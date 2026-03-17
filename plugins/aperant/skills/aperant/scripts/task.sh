#!/bin/bash
# task.sh - 任务操作脚本
# 操作单个任务的状态和元数据

set -euo pipefail

# 状态转换映射
declare -A STATUS_MAP=(
    ["backlog"]="backlog:pending:backlog:idle"
    ["queue"]="queue:active:backlog:idle"
    ["in_progress"]="in_progress:active:coding:coding"
    ["ai_review"]="ai_review:active:qa_review:qa_review"
    ["human_review"]="human_review:active:human_review:qa_fixing"
    ["done"]="done:completed:done:complete"
)

# 状态图标
declare -A STATUS_EMOJI=(
    ["backlog"]="📋"
    ["queue"]="⏳"
    ["in_progress"]="🔄"
    ["ai_review"]="🤖"
    ["human_review"]="👀"
    ["done"]="✅"
)

# 优先级图标
declare -A PRIORITY_EMOJI=(
    ["urgent"]="🔴"
    ["high"]="🟠"
    ["medium"]="🟡"
    ["low"]="⚪"
)

# 获取项目路径
get_project_path() {
    if [[ -n "${APERANT_PROJECT_PATH:-}" ]]; then
        echo "$APERANT_PROJECT_PATH"
        return
    fi

    local git_root
    git_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
    if [[ -n "$git_root" ]]; then
        echo "$git_root"
        return
    fi

    echo "$(pwd)"
}

# 获取 specs 目录
get_specs_dir() {
    local project_path="$1"
    echo "$project_path/.auto-claude/specs"
}

# 获取任务目录
get_spec_dir() {
    local project_path="$1"
    local spec_id="$2"
    local specs_dir
    specs_dir=$(get_specs_dir "$project_path")
    echo "$specs_dir/$spec_id"
}

# 检查状态转换是否有效
is_valid_transition() {
    local from="$1"
    local to="$2"

    case "$from:$to" in
        "backlog:queue"|"backlog:done") return 0 ;;
        "queue:in_progress"|"queue:backlog") return 0 ;;
        "in_progress:ai_review"|"in_progress:backlog"|"in_progress:done") return 0 ;;
        "ai_review:human_review"|"ai_review:backlog"|"ai_review:queue") return 0 ;;
        "human_review:done"|"human_review:backlog"|"human_review:queue") return 0 ;;
        "done:backlog") return 0 ;;
        *) return 1 ;;
    esac
}

# 读取任务详情
get_task() {
    local project_path="$1"
    local spec_id="$2"

    local spec_dir plan_file
    spec_dir=$(get_spec_dir "$project_path" "$spec_id")
    plan_file="$spec_dir/implementation_plan.json"

    if [[ ! -f "$plan_file" ]]; then
        echo "❌ 任务不存在: $spec_id" >&2
        return 1
    fi

    cat "$plan_file"
}

# 格式化任务详情
format_task_detail() {
    local plan_data="$1"
    local spec_id="$2"

    local title status priority description
    title=$(echo "$plan_data" | jq -r '.feature // .title // "无标题"' 2>/dev/null)
    status=$(echo "$plan_data" | jq -r '.status // "unknown"' 2>/dev/null)
    priority=$(echo "$plan_data" | jq -r '.priority // "medium"' 2>/dev/null)
    description=$(echo "$plan_data" | jq -r '.description // ""' 2>/dev/null)

    local status_emoji="${STATUS_EMOJI[$status]:-❓}"
    local priority_icon="${PRIORITY_EMOJI[$priority]:-⚪}"

    echo "**[${spec_id}] ${title}**"
    echo ""
    echo "状态: ${status_emoji} ${status^}"
    echo "优先级: ${priority_icon} ${priority^}"
    echo ""
    if [[ -n "$description" ]]; then
        echo "**描述**"
        echo "$description"
        echo ""
    fi

    # 显示子任务进度
    local total completed progress
    total=$(echo "$plan_data" | jq '[.phases[].subtasks[]] | length' 2>/dev/null || echo "0")
    completed=$(echo "$plan_data" | jq '[.phases[].subtasks[] | select(.status == "completed")] | length' 2>/dev/null || echo "0")

    if [[ "$total" -gt 0 ]]; then
        progress=$((completed * 100 / total))
        echo "**进度**: $progress% ($completed/$total 子任务完成)"
    fi
}

# 获取任务日志
get_task_logs() {
    local project_path="$1"
    local spec_id="$2"
    local lines="${3:-50}"

    local spec_dir log_file
    spec_dir=$(get_spec_dir "$project_path" "$spec_id")
    log_file="$spec_dir/task.log"

    if [[ ! -f "$log_file" ]]; then
        echo "📭 暂无日志"
        return
    fi

    tail -n "$lines" "$log_file"
}

# 移动任务到新状态
move_task() {
    local project_path="$1"
    local spec_id="$2"
    local to_status="$3"

    local spec_dir plan_file
    spec_dir=$(get_spec_dir "$project_path" "$spec_id")
    plan_file="$spec_dir/implementation_plan.json"

    if [[ ! -f "$plan_file" ]]; then
        echo "❌ 任务不存在: $spec_id" >&2
        return 1
    fi

    # 读取当前状态
    local current_status
    current_status=$(jq -r '.status // "backlog"' "$plan_file" 2>/dev/null)

    # 验证状态转换
    if ! is_valid_transition "$current_status" "$to_status"; then
        echo "❌ 无效的状态转换: $current_status → $to_status" >&2
        return 1
    fi

    # 获取目标状态映射
    local mapping="${STATUS_MAP[$to_status]}"
    IFS=':' read -r new_status plan_status xstate_state execution_phase <<< "$mapping"

    # 记录修改时间
    local before_mtime
    before_mtime=$(stat -f "%m" "$plan_file" 2>/dev/null || stat -c "%Y" "$plan_file")

    # 使用 jq 更新状态
    local updated_plan
    updated_plan=$(jq --arg status "$new_status" \
        --arg planStatus "$plan_status" \
        --arg xstateState "$xstate_state" \
        --arg executionPhase "$execution_phase" \
        '
        .status = $status |
        .planStatus = $planStatus |
        .xstateState = $xstateState |
        .executionPhase = $executionPhase |
        .updated_at = (now | todateiso8601)
        ' "$plan_file")

    # 原子写入
    local temp_file="${plan_file}.tmp.$$"
    echo "$updated_plan" > "$temp_file"

    # 验证文件未被其他进程修改
    local after_mtime
    after_mtime=$(stat -f "%m" "$plan_file" 2>/dev/null || stat -c "%Y" "$plan_file")

    if [[ "$before_mtime" != "$after_mtime" ]]; then
        rm -f "$temp_file"
        echo "⚠️ 任务状态已被其他进程修改，请重试" >&2
        return 1
    fi

    mv "$temp_file" "$plan_file"

    local status_emoji="${STATUS_EMOJI[$to_status]}"
    echo "✅ 任务已移动到 ${status_emoji} ${to_status^}"
}

# 主函数
main() {
    local command="${1:-}"
    local project_path
    project_path=$(get_project_path)

    case "$command" in
        --get)
            local spec_id="$2"
            local plan_data
            plan_data=$(get_task "$project_path" "$spec_id")
            format_task_detail "$plan_data" "$spec_id"
            ;;
        --move)
            local spec_id="$2"
            local to_status="$3"
            move_task "$project_path" "$spec_id" "$to_status"
            ;;
        --logs)
            local spec_id="$2"
            local lines="${3:-50}"
            get_task_logs "$project_path" "$spec_id" "$lines"
            ;;
        *)
            echo "用法: $0 {--get|--move|--logs}" >&2
            echo "  --get <spec_id>         获取任务详情" >&2
            echo "  --move <spec_id> <status>  移动任务到新状态" >&2
            echo "  --logs <spec_id> [lines]  查看任务日志" >&2
            exit 1
            ;;
    esac
}

main "$@"
