#!/bin/bash
# Init functions - Project configuration initialization

# Source common and api functions (same directory)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/api.sh"

# Configuration file name
CONFIG_FILE=".zd-project.json"

# Find project config file by searching upward from current directory
find_project_config() {
    local dir="$(pwd)"
    while [ "$dir" != "/" ]; do
        if [ -f "$dir/$CONFIG_FILE" ]; then
            echo "$dir/$CONFIG_FILE"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Load project configuration
load_project_config() {
    local config_path=$(find_project_config)
    if [ -z "$config_path" ]; then
        return 1
    fi
    cat "$config_path"
}

# Save project configuration
save_project_config() {
    local config_data="$1"
    local target_dir="${2:-$(pwd)}"
    echo "$config_data" > "$target_dir/$CONFIG_FILE"
    success "Configuration saved to $target_dir/$CONFIG_FILE"
}

# Generate default keywords based on execution name
generate_execution_keywords() {
    local name="$1"
    local keywords=""

    case "$name" in
        *开发*|*dev*|*Devel*) keywords="开发,实现,功能,编码" ;;
        *测试*|*test*|*Test*) keywords="测试,bug,修复,单元测试,集成测试" ;;
        *设计*|*design*|*Design*) keywords="设计,架构,方案,UI" ;;
        *运维*|*ops*|*Ops*) keywords="运维,部署,环境,配置" ;;
        *需求*|*req*|*Req*) keywords="需求,分析,调研" ;;
        *) keywords="$name" ;;
    esac

    echo "$keywords"
}

# Generate default task type keywords
generate_task_type_keywords() {
    cat <<'EOF'
{
    "devel": { "name": "开发", "keywords": ["开发", "实现", "编码", "功能", "feature", "devel"] },
    "test": { "name": "测试", "keywords": ["测试", "test", "bug", "修复", "单元测试", "集成测试"] },
    "design": { "name": "设计", "keywords": ["设计", "design", "架构", "方案", "UI"] },
    "study": { "name": "研究", "keywords": ["研究", "study", "调研", "学习", "技术选型"] },
    "discuss": { "name": "讨论", "keywords": ["讨论", "discuss", "会议", "沟通"] },
    "ui": { "name": "界面", "keywords": ["界面", "UI", "前端", "样式"] },
    "affair": { "name": "事务", "keywords": ["事务", "affair", "行政", "流程"] },
    "misc": { "name": "其他", "keywords": ["其他", "misc"] }
}
EOF
}

# Initialize project configuration
do_init() {
    local refresh=false show=false project_id=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --refresh) refresh=true; shift ;;
            --show) show=true; shift ;;
            --project) project_id="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    # Show current config
    if [ "$show" = true ]; then
        local config=$(load_project_config)
        if [ $? -ne 0 ]; then
            warn "No project configuration found. Run: /zd-init"
            return 1
        fi
        echo "$config" | jq '.'
        return 0
    fi

    # Check existing config for refresh
    local existing_config=""
    if [ "$refresh" = true ]; then
        existing_config=$(load_project_config)
        if [ $? -ne 0 ]; then
            warn "No existing config to refresh. Creating new config..."
            refresh=false
        else
            project_id=$(echo "$existing_config" | jq -r '.projectId')
        fi
    fi

    # Get project list if no project specified
    if [ -z "$project_id" ]; then
        echo "Fetching projects..."
        local projects_result=$(api_get "/projects")
        if ! is_api_success "$projects_result"; then
            error "Failed to get projects: $(parse_api_error "$projects_result")"
        fi

        echo "$projects_result" | jq -r '.projects[]? // .[]? | "[\(.id)] \(.name) (\(.status))"'
        echo ""
        read -p "Select project ID: " project_id
    fi

    # Get project info
    local project_info=$(api_get "/projects/$project_id")
    if ! is_api_success "$project_info"; then
        error "Failed to get project info: $(parse_api_error "$project_info")"
    fi

    local project_name=$(echo "$project_info" | jq -r '.name')

    # Get executions
    echo "Fetching executions for project #$project_id..."
    local execs_result=$(api_get "/projects/$project_id/executions")
    if ! is_api_success "$execs_result"; then
        error "Failed to get executions: $(parse_api_error "$execs_result")"
    fi

    # Build executions array with keywords
    local executions=$(echo "$execs_result" | jq --argjson refresh "$refresh" '
        [.executions[]? // .[]?] | map({
            id: .id,
            name: .name,
            status: .status,
            keywords: ((.name | split("") | .[0:2] | join("")) | split(","))
        })
    ')

    # Generate default execution (first active one, or first one)
    local default_execution=$(echo "$executions" | jq -r '[.[] | select(.status == "doing" or .status == "wait")] | .[0].id // .[0].id // empty')

    # Build config JSON
    local config=$(jq -n \
        --argjson projectId "$project_id" \
        --arg projectName "$project_name" \
        --argjson executions "$executions" \
        --argjson defaultExecution "$default_execution" \
        --argjson taskTypes "$(generate_task_type_keywords)" \
        '{
            projectId: $projectId,
            projectName: $projectName,
            executions: $executions,
            defaultExecution: $defaultExecution,
            taskTypes: $taskTypes,
            defaults: {
                type: "devel",
                pri: 3,
                estimate: 8
            }
        }')

    # Save config
    save_project_config "$config"
    echo ""
    echo "Configuration preview:"
    echo "$config" | jq '.'
}

# Infer execution from task content
infer_execution() {
    local task_name="$1"
    local task_desc="${2:-}"
    local config="${3:-}"

    if [ -z "$config" ]; then
        config=$(load_project_config)
        [ $? -ne 0 ] && return 1
    fi

    local content="$task_name $task_desc"
    local default_exec=$(echo "$config" | jq -r '.defaultExecution')

    # Try to match keywords
    local best_match=""
    local best_score=0

    while IFS= read -r exec; do
        local exec_id=$(echo "$exec" | jq -r '.id')
        local keywords=$(echo "$exec" | jq -r '.keywords | join(" ")')

        # Count keyword matches
        local score=0
        for kw in $keywords; do
            if [[ "$content" == *"$kw"* ]]; then
                score=$((score + 1))
            fi
        done

        if [ $score -gt $best_score ]; then
            best_score=$score
            best_match=$exec_id
        fi
    done < <(echo "$config" | jq -c '.executions[]')

    if [ -n "$best_match" ] && [ $best_score -gt 0 ]; then
        echo "$best_match"
    else
        echo "$default_exec"
    fi
}

# Infer task type from content
infer_task_type() {
    local task_name="$1"
    local task_desc="${2:-}"
    local config="${3:-}"

    if [ -z "$config" ]; then
        config=$(load_project_config)
        [ $? -ne 0 ] && echo "devel" && return
    fi

    local content="$task_name $task_desc"
    local default_type=$(echo "$config" | jq -r '.defaults.type // "devel"')

    # Try to match task type keywords
    local best_match=""
    local best_score=0

    while IFS= read -r type_entry; do
        local type_name=$(echo "$type_entry" | jq -r '.key')
        local keywords=$(echo "$type_entry" | jq -r '.value.keywords | join(" ")')

        local score=0
        for kw in $keywords; do
            if [[ "$content" == *"$kw"* ]]; then
                score=$((score + 1))
            fi
        done

        if [ $score -gt $best_score ]; then
            best_score=$score
            best_match=$type_name
        fi
    done < <(echo "$config" | jq -c '.taskTypes | to_entries[]')

    if [ -n "$best_match" ] && [ $best_score -gt 0 ]; then
        echo "$best_match"
    else
        echo "$default_type"
    fi
}

# Get default values from config
get_config_defaults() {
    local config=$(load_project_config)
    if [ $? -ne 0 ]; then
        echo "{}"
        return 1
    fi

    echo "$config" | jq '.defaults'
}
