#!/bin/bash
# create.sh - 任务创建脚本
# 创建新的任务目录和元数据文件

set -euo pipefail

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

# 生成新的 spec ID
generate_spec_id() {
    local project_path="$1"
    local title="$2"

    local specs_dir
    specs_dir=$(get_specs_dir "$project_path")

    if [[ ! -d "$specs_dir" ]]; then
        echo "001-${title}"
        return
    fi

    # 查找最大的数字 ID
    local max_num=0
    for dir in "$specs_dir"/*/; do
        if [[ -d "$dir" ]]; then
            local dirname
            dirname=$(basename "$dir")
            if [[ "$dirname" =~ ^([0-9]+) ]]; then
                local num="${BASH_REMATCH[1]}"
                if [[ "$num" -gt "$max_num" ]]; then
                    max_num="$num"
                fi
            fi
        fi
    done

    local new_num=$((max_num + 1))
    printf "%03d-%s" "$new_num" "$title"
}

# Slugify 标题
slugify_title() {
    local title="$1"
    echo "$title" \
        | tr '[:upper:]' '[:lower:]' \
        | sed 's/[^a-z0-9]+/-/g' \
        | sed 's/^-//' \
        | sed 's/-$//' \
        | cut -c1-50
}

# 创建新任务
create_task() {
    local project_path="$1"
    local title="$2"
    local description="${3:-}"
    local priority="${4:-medium}"

    # 生成 spec ID
    local slug
    slug=$(slugify_title "$title")
    local spec_id
    spec_id=$(generate_spec_id "$project_path" "$slug")

    # 创建任务目录
    local specs_dir spec_dir
    specs_dir=$(get_specs_dir "$project_path")
    spec_dir="$specs_dir/$spec_id"

    if [[ -d "$spec_dir" ]]; then
        echo "❌ 任务目录已存在: $spec_id" >&2
        return 1
    fi

    mkdir -p "$spec_dir"

    # 生成时间戳
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # 创建 implementation_plan.json
    cat > "$spec_dir/implementation_plan.json" <<EOF
{
  "feature": "$title",
  "description": "$description",
  "created_at": "$now",
  "updated_at": "$now",
  "status": "backlog",
  "planStatus": "pending",
  "xstateState": "backlog",
  "executionPhase": "idle",
  "phases": []
}
EOF

    # 创建 task_metadata.json
    cat > "$spec_dir/task_metadata.json" <<EOF
{
  "id": "${spec_id%%-*}",
  "title": "$title",
  "description": "$description",
  "status": "backlog",
  "priority": "$priority",
  "category": "feature",
  "createdAt": "$now",
  "updatedAt": "$now",
  "errorMessage": null
}
EOF

    # 创建 requirements.json
    cat > "$spec_dir/requirements.json" <<EOF
{
  "task_description": "$description",
  "workflow_type": "feature"
}
EOF

    echo "✅ 任务创建成功！"
    echo ""
    echo "📁 任务 ID: $spec_id"
    echo "📝 标题: $title"
    echo "📋 状态: Backlog"
    echo ""
    echo "🔗 后续操作:"
    echo "   - 查看任务详情: /aperant"
    echo "   - 移动到 Queue: /aperant (选择任务后移动)"
}

# 主函数
main() {
    local title="$1"
    local description="${2:-}"
    local priority="${3:-medium}"

    if [[ -z "$title" ]]; then
        echo "❌ 请提供任务标题" >&2
        echo "用法: $0 <标题> [描述] [优先级]" >&2
        exit 1
    fi

    local project_path
    project_path=$(get_project_path)

    create_task "$project_path" "$title" "$description" "$priority"
}

main "$@"
