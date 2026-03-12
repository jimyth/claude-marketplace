#!/bin/bash
# Task functions - Create, list, start, finish, view tasks

# Source common and api functions (same directory)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/api.sh"
source "${LIB_DIR}/init.sh"

do_create() {
    local name="" execution="" type="" pri="" estimate="" desc="" assignedTo="" story="" left="" deadline="" no_start=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --name) name="$2"; shift 2 ;;
            --execution) execution="$2"; shift 2 ;;
            --type) type="$2"; shift 2 ;;
            --pri) pri="$2"; shift 2 ;;
            --estimate) estimate="$2"; shift 2 ;;
            --left) left="$2"; shift 2 ;;
            --desc) desc="$2"; shift 2 ;;
            --assignedTo) assignedTo="$2"; shift 2 ;;
            --story) story="$2"; shift 2 ;;
            --deadline) deadline="$2"; shift 2 ;;
            --no-start) no_start=true; shift ;;
            *) shift ;;
        esac
    done

    [ -z "$name" ] && error "Task name required: --name <name>"

    # 尝试加载项目配置
    local config=""
    local has_config=1
    config=$(load_project_config 2>/dev/null) || has_config=1
    [ -n "$config" ] && has_config=0

    if [ $has_config -eq 0 ]; then
        echo "Using project config from .zd-project.json"

        # 从配置获取默认值（如果用户未指定）
        if [ -z "$execution" ]; then
            execution=$(infer_execution "$name" "$desc" "$config")
            echo "Auto-inferred execution: $execution"
        fi

        if [ -z "$type" ]; then
            type=$(infer_task_type "$name" "$desc" "$config")
            [ -z "$type" ] && type="devel"
            echo "Auto-inferred type: $type"
        fi

        if [ -z "$pri" ]; then
            pri=$(echo "$config" | jq -r '.defaults.pri // 3')
        fi

        if [ -z "$estimate" ]; then
            estimate=$(echo "$config" | jq -r '.defaults.estimate // 8')
        fi
    else
        # 无配置时使用默认值
        [ -z "$type" ] && type="devel"
        [ -z "$pri" ] && pri=3
        [ -z "$estimate" ] && estimate=8
    fi

    [ -z "$execution" ] && error "Execution ID required: --execution <id> (or run /zd-init to configure defaults)"

    # 默认指派给自己
    if [ -z "$assignedTo" ]; then
        assignedTo=$(get_account)
        [ -z "$assignedTo" ] && error "Account not configured. Run: zentao-api.sh config --account <account>"
    fi

    # 剩余工时默认等于预计工时
    [ -z "$left" ] && left="$estimate"

    # 默认使用当前日期作为预计开始日期
    local estStarted=$(date +"%Y-%m-%d")
    # 默认截止日期为 7 天后
    local default_deadline=$(date -v+7d +"%Y-%m-%d" 2>/dev/null || date -d "+7 days" +"%Y-%m-%d" 2>/dev/null || echo "")
    [ -z "$deadline" ] && deadline="$default_deadline"

    # Build JSON data using jq for proper escaping
    local data=$(jq -n \
        --arg name "$name" \
        --arg type "$type" \
        --argjson pri "$pri" \
        --argjson estimate "$estimate" \
        --argjson left "$left" \
        --arg estStarted "$estStarted" \
        --arg deadline "$deadline" \
        --arg desc "$desc" \
        --arg assignedTo "$assignedTo" \
        --argjson story "${story:-null}" \
        '{
            name: $name,
            type: $type,
            pri: $pri,
            estimate: $estimate,
            left: $left,
            estStarted: $estStarted,
            deadline: (if $deadline != "" then $deadline else null end),
            desc: (if $desc != "" then $desc else null end),
            assignedTo: $assignedTo,
            story: (if $story != null then $story else null end)
        } | with_entries(select(.value != null))')

    echo "Creating task..."
    # API endpoint: POST /executions/:executionID/tasks
    local result=$(api_post "/executions/$execution/tasks" "$data")

    if is_api_success "$result"; then
        local task_id=$(echo "$result" | jq -r '.id // .data.id // "unknown"')
        success "Task #$task_id created: $name (assigned to: $assignedTo)"

        # 自动启动任务
        if [ "$no_start" = false ] && [ "$task_id" != "unknown" ]; then
            echo "Starting task #$task_id..."
            # start API 需要传递 assignedTo，否则会清空指派人
            local start_result=$(api_post "/tasks/$task_id/start" "{\"left\":$left,\"assignedTo\":\"$assignedTo\"}")
            if is_api_success "$start_result"; then
                success "Task #$task_id started"
            else
                warn "Task created but failed to start: $(parse_api_error "$start_result")"
            fi
        fi
    else
        error "Failed to create task: $(parse_api_error "$result")"
    fi
}

do_list() {
    local status="" execution_id=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --status) status="$2"; shift 2 ;;
            --execution) execution_id="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    local account=$(get_account)

    if [ -n "$execution_id" ]; then
        # 指定执行ID时，直接获取该执行下的任务
        echo "Fetching tasks from execution #$execution_id..."
        local result=$(api_get "/executions/$execution_id/tasks")

        if is_api_success "$result"; then
            local tasks=$(echo "$result" | jq '.tasks // .')
            [ -n "$status" ] && tasks=$(echo "$tasks" | jq --arg s "$status" '[.[] | select(.status == $s)]')
            _print_tasks "$tasks"
        else
            error "Failed to get tasks from execution: $(parse_api_error "$result")"
        fi
    else
        # 遍历所有有权限的执行获取任务
        echo "Fetching tasks from all accessible executions..."

        # 获取用户有权限的项目列表
        local projects_result=$(api_get "/projects")
        if ! is_api_success "$projects_result"; then
            error "Failed to get projects: $(parse_api_error "$projects_result")"
        fi

        local project_ids=$(echo "$projects_result" | jq -r '.projects[]? // .[]? | .id' | tr '\n')
        local all_tasks="[]"
        local total_count=0

        for pid in $project_ids; do
            local execs_result=$(api_get "/projects/$pid/executions")
            if ! is_api_success "$execs_result"; then
                continue
            fi

            local exec_ids=$(echo "$execs_result" | jq -r '.executions[]? // .[]? | .id' | tr '\n')

            for eid in $exec_ids; do
                local tasks_result=$(api_get "/executions/$eid/tasks")
                if is_api_success "$tasks_result"; then
                    local tasks=$(echo "$tasks_result" | jq '.tasks // .')
                    if [ "$tasks" != "null" ] && [ "$tasks" != "[]" ]; then
                        # 过滤指派给当前用户的任务
                        local my_tasks=$(echo "$tasks" | jq --arg acc "$account" '[.[] | select(.assignedTo.account == $acc)]')
                        if [ "$my_tasks" != "null" ] && [ "$my_tasks" != "[]" ]; then
                            all_tasks=$(echo "$all_tasks $my_tasks" | jq -s 'add' | jq 'unique_by(.id)')
                            total_count=$((total_count + $(echo "$my_tasks" | jq 'length')))
                        fi
                    fi
                fi
            done
        done

        if [ -n "$status" ]; then
            all_tasks=$(echo "$all_tasks" | jq --arg s "$status" '[.[] | select(.status == $s)]')
        fi

        echo "Found $total_count tasks:"
        echo ""
        echo "$all_tasks" | jq -r '.[] | "[\(.id)] \(.name) (\(.status)) - \(.executionName // "No execution")"'
    fi
}

_print_tasks() {
    local tasks="$1"
    local count=$(echo "$tasks" | jq 'length')
    echo "Found $count tasks:"
    echo ""
    echo "$tasks" | jq -r '.[] | "[\(.id)] \(.name) (\(.status)) - \(.executionName // "No execution")"'
}

do_start() {
    local task_id=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --id) task_id="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    [ -z "$task_id" ] && error "Task ID required: --id <id>"

    # Get task info to get current left value
    local task_info=$(api_get "/tasks/$task_id")
    is_api_success "$task_info" || error "Failed to get task: $(parse_api_error "$task_info")"

    local name=$(echo "$task_info" | jq -r '.name // "Unknown"')
    local current_left=$(echo "$task_info" | jq -r '.left // 1')
    [ -z "$current_left" ] || [ "$current_left" = "null" ] || [ "$current_left" = "0" ] && current_left=1

    local result=$(api_post "/tasks/$task_id/start" "{\"left\":$current_left}")
    if is_api_success "$result"; then
        success "Task #$task_id started: $name"
    else
        error "Failed to start task: $(parse_api_error "$result")"
    fi
}

do_finish() {
    local task_id="" consumed="1" note=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --id) task_id="$2"; shift 2 ;;
            --consumed) consumed="$2"; shift 2 ;;
            --note) note="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    [ -z "$task_id" ] && error "Task ID required: --id <id>"

    local finished_date=$(date +"%Y-%m-%d %H:%M:%S")
    local data="{\"consumed\":$consumed,\"currentConsumed\":$consumed,\"left\":0,\"finishedDate\":\"$finished_date\"}"

    [ -n "$note" ] && data=$(echo "$data" | jq --arg comment "$note" '. + {"comment": $comment}')

    local result=$(api_post "/tasks/$task_id/finish" "$data")
    if is_api_success "$result"; then
        success "Task #$task_id completed"
    else
        error "Failed to complete task: $(parse_api_error "$result")"
    fi
}

do_view() {
    local task_id="$1"
    [ -z "$task_id" ] && error "Task ID required: view <id>"

    local result=$(api_get "/tasks/$task_id")
    if is_api_success "$result"; then
        echo "$result" | jq '{
            id,
            name,
            status,
            type,
            pri,
            executionName,
            estimate,
            consumed,
            left,
            estStarted,
            realStarted,
            assignedTo: .assignedTo.account,
            deadline,
            desc
        }'
    else
        error "Failed to get task: $(parse_api_error "$result")"
    fi
}
