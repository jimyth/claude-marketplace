#!/bin/bash
# Sum functions - Work hours statistics

# Source common and api functions (same directory)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/api.sh"

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
