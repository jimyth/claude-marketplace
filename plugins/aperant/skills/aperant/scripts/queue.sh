#!/bin/bash
# queue.sh - 队列查询脚本
# 读取 .auto-claude/specs/ 目录，聚合所有任务元数据，按状态分组

set -euo pipefail

# 任务状态常量
TASK_STATUSES=("backlog" "queue" "in_progress" "ai_review" "human_review" "done")

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
    # 优先使用环境变量
    if [[ -n "${APERANT_PROJECT_PATH:-}" ]]; then
        echo "$APERANT_PROJECT_PATH"
        return
    fi

    # 尝试 git 根目录
    local git_root
    git_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
    if [[ -n "$git_root" ]]; then
        echo "$git_root"
        return
    fi

    # 默认当前目录
    echo "$(pwd)"
}

# 获取 specs 目录
get_specs_dir() {
    local project_path="$1"
    echo "$project_path/.auto-claude/specs"
}

# 读取 implementation_plan.json
read_plan() {
    local spec_dir="$1"
    local plan_file="$spec_dir/implementation_plan.json"

    if [[ ! -f "$plan_file" ]]; then
        return 1
    fi

    cat "$plan_file"
}

# 计算任务进度
calculate_progress() {
    local plan_data="$1"

    # 使用 jq 计算进度
    local total completed
    total=$(echo "$plan_data" | jq '[.phases[].subtasks[]] | length' 2>/dev/null || echo "0")
    completed=$(echo "$plan_data" | jq '[.phases[].subtasks[] | select(.status == "completed")] | length' 2>/dev/null || echo "0")

    if [[ "$total" -eq 0 ]]; then
        echo "0 0 0"
        return
    fi

    local progress=$((completed * 100 / total))
    echo "$progress $completed $total"
}

# 获取执行阶段
get_execution_phase() {
    local plan_data="$1"
    echo "$plan_data" | jq -r '.execution_state.phase // empty' 2>/dev/null
}

# 按状态分组任务
get_tasks_by_status() {
    local project_path="$1"
    local status_filter="${2:-}"

    local specs_dir
    specs_dir=$(get_specs_dir "$project_path")

    if [[ ! -d "$specs_dir" ]]; then
        echo "❌ specs 目录不存在: $specs_dir" >&2
        return 1
    fi

    # 初始化所有状态计数
    for status in "${TASK_STATUSES[@]}"; do
        echo "status:$status:count:0"
    done

    # 遍历所有 spec 目录
    for spec_dir in "$specs_dir"/*; do
        [[ -d "$spec_dir" ]] || continue

        local spec_id
        spec_id=$(basename "$spec_dir")

        # 读取 plan 文件
        local plan_data
        plan_data=$(read_plan "$spec_dir" 2>/dev/null) || continue

        # 获取状态
        local task_status
        task_status=$(echo "$plan_data" | jq -r '.status // "backlog"' 2>/dev/null)

        # 状态映射：pr_created 显示为 done
        if [[ "$task_status" == "pr_created" ]]; then
            task_status="done"
        fi

        # 过滤状态
        if [[ -n "$status_filter" && "$task_status" != "$status_filter" ]]; then
            continue
        fi

        # 获取任务信息
        local title priority category
        title=$(echo "$plan_data" | jq -r '.feature // .title // "$spec_id"' 2>/dev/null)
        priority=$(echo "$plan_data" | jq -r '.priority // "medium"' 2>/dev/null)
        category=$(echo "$plan_data" | jq -r '.category // "feature"' 2>/dev/null)

        # 计算进度
        local progress completed total
        read -r progress completed total <<< "$(calculate_progress "$plan_data")"

        # 获取执行阶段
        local execution_phase
        execution_phase=$(get_execution_phase "$plan_data")

        # 输出任务数据
        echo "task:$spec_id:$task_status:$title:$priority:$category:$progress:$completed:$total:$execution_phase"
    done
}

# 格式化队列摘要
format_queue_summary() {
    local project_path="$1"
    local data
    data=$(get_tasks_by_status "$project_path")

    echo "📋 **任务队列总览**"
    echo ""

    for status in "${TASK_STATUSES[@]}"; do
        local emoji="${STATUS_EMOJI[$status]}"
        local count
        count=$(echo "$data" | grep "^status:$status:count:" | cut -d: -f4)

        local status_display="$status"
        status_display=$(echo "$status" | sed 's/_/ /g' | sed 's/\b\(.\)/\u\1/g')

        echo "$emoji **$status_display** ($count)"
    done
}

# 格式化任务卡片
format_task_card() {
    local spec_id="$1"
    local title="$2"
    local priority="$3"
    local completed="$4"
    local total="$5"

    local priority_icon="${PRIORITY_EMOJI[$priority]:-⚪}"

    echo "[${spec_id}] ${title}"
    echo "  ${priority_icon} ${priority^}"

    if [[ "$total" -gt 0 ]]; then
        local filled=$((completed))
        local empty=$((total - completed))
        local progress_bar=""
        progress_bar=$(printf '🔵%.0s' $(seq 1 "$filled"))
        progress_bar+="$(printf '⚪%.0s' $(seq 1 "$empty"))"
        echo "  $progress_bar ($completed/$total)"
    fi
}

# 主函数
main() {
    local command="${1:-summary}"
    local project_path
    project_path=$(get_project_path)

    case "$command" in
        summary)
            format_queue_summary "$project_path"
            ;;
        list)
            local status="${2:-}"
            get_tasks_by_status "$project_path" "$status"
            ;;
        *)
            echo "用法: $0 {summary|list [status]}" >&2
            exit 1
            ;;
    esac
}

main "$@"
