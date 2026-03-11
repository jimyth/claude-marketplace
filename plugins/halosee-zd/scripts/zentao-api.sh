#!/bin/bash
# Zentao API Client - Simplified
# Create and manage Zentao tasks

set -e

# Config paths
ZENTAO_CONFIG_DIR="${HOME}/.zentao-sync"
ZENTAO_CONFIG_FILE="${ZENTAO_CONFIG_DIR}/config.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}Warning: $1${NC}" >&2
}

success() {
    echo -e "${GREEN}$1${NC}"
}

init_config() {
    if [ ! -d "$ZENTAO_CONFIG_DIR" ]; then
        mkdir -p "$ZENTAO_CONFIG_DIR"
        chmod 700 "$ZENTAO_CONFIG_DIR"
    fi

    if [ ! -f "$ZENTAO_CONFIG_FILE" ]; then
        echo '{"zentao":{"url":"","token":"","account":"","password":"","cycle":24}}' > "$ZENTAO_CONFIG_FILE"
        chmod 600 "$ZENTAO_CONFIG_FILE"
    fi
}

get_config() {
    local key="$1"
    init_config
    jq -r "$key" "$ZENTAO_CONFIG_FILE"
}

get_zentao_url() {
    local url=$(get_config '.zentao.url')
    echo "${url%/}"
}

get_token() {
    get_config '.zentao.token'
}

get_account() {
    get_config '.zentao.account'
}

get_password() {
    get_config '.zentao.password'
}

get_cycle() {
    local cycle=$(get_config '.zentao.cycle')
    if [ -z "$cycle" ] || [ "$cycle" = "null" ]; then
        echo "24"
    else
        echo "$cycle"
    fi
}

set_config() {
    local key="$1"
    local value="$2"
    init_config

    local tmp_file=$(mktemp)
    if jq "$key = $value" "$ZENTAO_CONFIG_FILE" > "$tmp_file"; then
        mv "$tmp_file" "$ZENTAO_CONFIG_FILE"
        chmod 600 "$ZENTAO_CONFIG_FILE"
    else
        rm -f "$tmp_file"
        error "Failed to update config"
    fi
}

zentao_login() {
    local base_url=$(get_zentao_url)
    local account=$(get_account)
    local password=$(get_password)

    if [ -z "$base_url" ]; then
        error "URL not configured. Run: /zentao-config --url <url>"
    fi

    if [ -z "$account" ] || [ -z "$password" ]; then
        error "Account or password not configured. Run: /zentao-config --account <account> --password <password>"
    fi

    echo "Logging in..."

    local response=$(curl -s -X POST "${base_url}/api.php/v1/tokens" \
        -H "Content-Type: application/json" \
        -d "{\"account\":\"${account}\",\"password\":\"${password}\"}" 2>/dev/null)

    if [ -z "$response" ]; then
        error "Cannot connect to Zentao API. Check URL."
    fi

    local token=$(echo "$response" | jq -r '.token // empty' 2>/dev/null)

    if [ -n "$token" ] && [ "$token" != "null" ]; then
        success "Login successful"
        set_config '.zentao.token' "\"$token\""
        echo "$token"
    else
        local err_msg=$(echo "$response" | jq -r '.error // .message // "Unknown error"' 2>/dev/null)
        error "Login failed: $err_msg"
    fi
}

api_request() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"

    local base_url=$(get_zentao_url)
    local token=$(get_token)

    if [ -z "$base_url" ]; then
        error "URL not configured"
    fi

    if [ -z "$token" ] || [ "$token" = "null" ]; then
        warn "Token not found, logging in..."
        token=$(zentao_login)
        if [ -z "$token" ]; then
            error "Login failed"
        fi
    fi

    local url="${base_url}/api.php/v1${endpoint}"
    local args=(-s -X "$method" -H "Content-Type: application/json" -H "Token: $token")

    if [ -n "$data" ]; then
        args+=(-d "$data")
    fi

    local response http_code
    response=$(curl "${args[@]}" -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | sed '$d')

    if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
        if [ "$http_code" = "401" ]; then
            warn "Token expired, re-logging in..."
            set_config '.zentao.token' '""'
            token=$(zentao_login)
            if [ -n "$token" ]; then
                args=(-s -X "$method" -H "Content-Type: application/json" -H "Token: $token")
                [ -n "$data" ] && args+=(-d "$data")
                response=$(curl "${args[@]}" -w "\n%{http_code}" "$url" 2>/dev/null)
                http_code=$(echo "$response" | tail -n1)
                response=$(echo "$response" | sed '$d')
            fi
        fi

        if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
            error "API request failed (HTTP $http_code): $response"
        fi
    fi

    echo "$response"
}

api_get() {
    api_request "GET" "$1"
}

api_post() {
    api_request "POST" "$1" "$2"
}

is_api_success() {
    local response="$1"
    local error=$(echo "$response" | jq -r '.error // empty' 2>/dev/null)
    [ -z "$error" ]
}

parse_api_error() {
    local response="$1"
    echo "$response" | jq -r '.error // .message // "Unknown error"' 2>/dev/null
}

test_connection() {
    local base_url=$(get_zentao_url)
    [ -z "$base_url" ] && error "URL not configured"

    echo "Testing connection: $base_url"

    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${base_url}/" 2>/dev/null)
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
        success "Zentao service accessible"
    else
        error "Cannot access Zentao (HTTP $http_code)"
    fi

    zentao_login
}

do_config() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --url)
                set_config '.zentao.url' "\"$2\""
                success "URL set: $2"
                shift 2
                ;;
            --token)
                set_config '.zentao.token' "\"$2\""
                success "Token set"
                shift 2
                ;;
            --account)
                set_config '.zentao.account' "\"$2\""
                success "Account set: $2"
                shift 2
                ;;
            --password)
                set_config '.zentao.password' "\"$2\""
                success "Password set"
                shift 2
                ;;
            --cycle)
                set_config '.zentao.cycle' "$2"
                success "Cycle set: $2"
                shift 2
                ;;
            --show)
                echo "URL: $(get_zentao_url)"
                echo "Account: $(get_account)"
                echo "Cycle: $(get_cycle)"
                shift
                ;;
            --test)
                test_connection
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
}

do_projects() {
    echo "Fetching projects..."
    local result=$(api_get "/projects")

    if is_api_success "$result"; then
        echo "$result" | jq -r '.projects[]? // .[]? | "\(.id)\t\(.name)\t\(.status)"' | column -t -s $'\t'
    else
        error "Failed to get projects: $(parse_api_error "$result")"
    fi
}

do_executions() {
    local project_id="$1"
    [ -z "$project_id" ] && error "Project ID required: executions <project_id>"

    echo "Fetching executions for project #$project_id..."
    local result=$(api_get "/projects/$project_id/executions")

    if is_api_success "$result"; then
        echo "$result" | jq -r '.executions[]? // .[]? | "\(.id)\t\(.name)\t\(.status)"' | column -t -s $'\t'
    else
        error "Failed to get executions: $(parse_api_error "$result")"
    fi
}

do_create() {
    local name="" execution="" type="devel" pri=3 estimate="8" desc="" assignedTo="" story="" left="" deadline="" no_start=false

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
    [ -z "$execution" ] && error "Execution ID required: --execution <id>"

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

    # Build JSON data
    local data="{\"name\":\"$name\",\"type\":\"$type\",\"pri\":$pri,\"estimate\":$estimate,\"left\":$left,\"estStarted\":\"$estStarted\""

    [ -n "$deadline" ] && data="$data,\"deadline\":\"$deadline\""
    [ -n "$desc" ] && data="$data,\"desc\":\"$desc\""
    data="$data,\"assignedTo\":\"$assignedTo\""
    [ -n "$story" ] && data="$data,\"story\":$story"

    data="$data}"

    echo "Creating task..."
    # API endpoint: POST /executions/:executionID/tasks
    local result=$(api_post "/executions/$execution/tasks" "$data")

    if is_api_success "$result"; then
        local task_id=$(echo "$result" | jq -r '.id // .data.id // "unknown"')
        success "Task #$task_id created: $name (assigned to: $assignedTo)"

        # 自动启动任务
        if [ "$no_start" = false ] && [ "$task_id" != "unknown" ]; then
            echo "Starting task #$task_id..."
            local start_result=$(api_post "/tasks/$task_id/start" "{\"left\":$left}")
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
    local status=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --status) status="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    echo "Fetching my tasks..."
    local result=$(api_get "/tasks?assignedTo=$(get_account)")

    if is_api_success "$result"; then
        local tasks=$(echo "$result" | jq '.tasks // .')

        if [ -n "$status" ]; then
            tasks=$(echo "$tasks" | jq --arg s "$status" '[.[] | select(.status == $s)]')
        fi

        local count=$(echo "$tasks" | jq 'length')
        echo "Found $count tasks:"
        echo ""
        echo "$tasks" | jq -r '.[] | "[\(.id)] \(.name) (\(.status)) - \(.executionName // "No execution")"'
    else
        error "Failed to get tasks: $(parse_api_error "$result")"
    fi
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

do_sum() {
    local period="$1"
    [ -z "$period" ] && error "Period required: sum YYYYMM (e.g., sum 202504)"

    # 解析周期
    local year="${period:0:4}"
    local month="${period:4:2}"

    # 验证格式
    [[ ! "$period" =~ ^[0-9]{6}$ ]] && error "Invalid period format. Use YYYYMM (e.g., 202504)"

    # 获取周期起始日
    local cycle=$(get_cycle)

    # 计算开始日期：上个月 cycle 号
    local start_month=$((10#$month - 1))
    local start_year=$year
    if [ $start_month -eq 0 ]; then
        start_month=12
        start_year=$((year - 1))
    fi
    local start_date=$(printf "%04d-%02d-%02d" $start_year $start_month $cycle)

    # 计算结束日期：本月 cycle 号
    local end_date=$(printf "%04d-%02d-%02d" $year $((10#$month)) $cycle)

    echo "工时统计: $start_date 至 $end_date"
    echo ""
    echo "Fetching completed tasks..."

    # 获取已完成任务列表
    local result=$(api_get "/tasks?assignedTo=$(get_account)&status=done")

    if ! is_api_success "$result"; then
        error "Failed to get tasks: $(parse_api_error "$result")"
    fi

    # 过滤并统计指定周期内的任务
    local tasks=$(echo "$result" | jq --arg start "$start_date" --arg end "$end_date" '
        [.tasks[]? // .[]? | select(
            .status == "done" and
            .finishedDate != null and
            (.finishedDate | split("T")[0]) >= $start and
            (.finishedDate | split("T")[0]) < $end
        )] | sort_by(.finishedDate)
    ')

    local count=$(echo "$tasks" | jq 'length')
    local total_hours=$(echo "$tasks" | jq '[.[].consumed] | add // 0')

    echo "已完成任务: $count 个"
    echo "总消耗工时: ${total_hours} 小时"
    echo ""

    if [ "$count" -gt 0 ]; then
        echo "任务明细:"
        echo "$tasks" | jq -r '.[] | "[\(.id)] \(.name) - \(.consumed)h"'
    fi
}

# Main command dispatch
case "${1:-}" in
    "login") shift; zentao_login ;;
    "config") shift; do_config "$@" ;;
    "projects") shift; do_projects ;;
    "executions") shift; do_executions "$1" ;;
    "create") shift; do_create "$@" ;;
    "list") shift; do_list "$@" ;;
    "view") shift; do_view "$1" ;;
    "start") shift; do_start "$@" ;;
    "finish") shift; do_finish "$@" ;;
    "sum") shift; do_sum "$1" ;;
    *)
        echo "Zentao Sync Tool"
        echo ""
        echo "Usage: zentao-api.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  login       Login and get token"
        echo "  config      Configure settings"
        echo "  projects    List all projects"
        echo "  executions  List executions in a project"
        echo "  create      Create a new task"
        echo "  list        List my tasks"
        echo "  view        View task details"
        echo "  start       Start a task"
        echo "  finish      Complete a task"
        echo "  sum         Summarize hours for a period"
        echo ""
        echo "Create task options:"
        echo "  --name        Task name (required)"
        echo "  --execution   Execution/iteration ID (required)"
        echo "  --type        Task type: devel,design,test,study,discuss,ui,affair,misc (default: devel)"
        echo "  --pri         Priority 1-4 (default: 3)"
        echo "  --estimate    Estimated hours (default: 8)"
        echo "  --left        Remaining hours (default: same as estimate)"
        echo "  --desc        Task description"
        echo "  --assignedTo  Assign to account (default: current user)"
        echo "  --story       Related story ID"
        echo "  --deadline    Deadline date (default: 7 days later)"
        echo "  --no-start    Don't auto-start after creation"
        echo ""
        echo "Config options:"
        echo "  --url         Zentao server URL"
        echo "  --account     Login account"
        echo "  --password    Login password"
        echo "  --cycle       Work hours cycle day (default: 24)"
        echo "  --show        Show current config"
        echo "  --test        Test connection"
        ;;
esac
