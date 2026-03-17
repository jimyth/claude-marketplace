## Overview

aperant-plugin 是一个 Claude Code 插件，通过交互式选择的方式让用户在终端中管理 Aperant 项目的任务。插件读取 Aperant 项目的 `.auto-claude/specs/` 目录，提供队列查看、任务详情查看、任务状态切换、任务创建等功能。

## Architecture

### 插件目录结构

```
plugins/aperant/
├── .claude-plugin/
│   └── plugin.json           # 插件元数据
├── skills/
│   └── aperant/
│       ├── SKILL.md          # 主 Skill 文件
│       ├── scripts/
│       │   ├── queue.sh      # 队列查询脚本
│       │   ├── task.sh       # 任务操作脚本
│       │   └── create.sh     # 任务创建脚本
│       └── templates/
│           └── task_metadata.json.template
└── README.md
```

### 数据流

```
User → Claude Code → aperant Skill → Scripts → Aperant Project
                                    ↓
                              .auto-claude/specs/
                                ├── 001-xxx/
                                │   └── task_metadata.json
                                ├── 002-yyy/
                                │   └── task_metadata.json
                                └── ...
```

## Components

### 1. plugin.json

定义插件的基本信息和依赖。

```json
{
  "name": "aperant",
  "version": "1.0.0",
  "description": "Aperant 任务管理插件 - 在 Claude Code 中管理 Aperant 项目任务",
  "author": {
    "name": "Jimyth"
  },
  "keywords": ["aperant", "task", "kanban", "workflow"],
  "category": "development"
}
```

### 2. SKILL.md

主 Skill 文件，定义交互逻辑和调用脚本。

**Frontmatter:**
```yaml
---
name: aperant
description: 管理 Aperant 项目任务 - 查看队列、移动任务、创建新任务
argument-hint: [show-queues|create <title>]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash, AskUserQuestion
---
```

**交互流程:**
1. 解析用户输入（可选参数）
2. 如果有 `create` 参数，直接创建任务
3. 否则显示队列总览，让用户选择队列
4. 显示选中队列的任务列表，让用户选择任务
5. 显示任务详情和操作选项
6. 执行用户选择的操作

### 3. Scripts

#### queue.sh

读取 `.auto-claude/specs/` 目录，聚合所有任务元数据，按状态分组。

**输入:**
- `--status <status>`: 过滤特定状态
- `--format json|text`: 输出格式

**输出:**
- JSON 格式的队列数据
- 文本格式的队列摘要

#### task.sh

操作单个任务的状态和元数据。

**输入:**
- `--get <spec_id>`: 获取任务详情
- `--move <spec_id> <to_status>`: 移动任务
- `--logs <spec_id>`: 获取任务日志

**输出:**
- 任务详情 JSON
- 操作结果消息

#### create.sh

创建新的任务目录和元数据文件。

**输入:**
- `--title <title>`: 任务标题
- `--description <description>`: 任务描述（可选）
- `--priority <priority>`: 优先级（可选，默认 medium）

**输出:**
- 创建的任务 ID
- 错误消息（如果失败）

## Data Structures

### 任务目录结构

```
.auto-claude/specs/
├── 001-feature-name/
│   ├── implementation_plan.json    # 主要状态文件 (APP 端写入)
│   ├── task_metadata.json           # 用户自定义元数据 (创建时写入)
│   ├── requirements.json            # 需求文档
│   ├── spec.md                      # 规格文档
│   └── task.log                     # 任务日志
├── 002-another-feature/
│   └── ...
```

### implementation_plan.json (核心状态文件)

**APP 端的主要状态文件，任务移动时更新此文件。**

```json
{
  "feature": "实现用户认证模块",
  "description": "实现 JWT 认证和用户登录功能",
  "created_at": "2025-03-17T10:30:00Z",
  "updated_at": "2025-03-17T12:45:00Z",
  "status": "in_progress",
  "planStatus": "active",
  "reviewReason": null,
  "xstateState": "coding",
  "executionPhase": "coding",
  "execution_state": {
    "phase": "coding",
    "started_at": "2025-03-17T11:00:00Z"
  },
  "phases": [
    {
      "name": "planning",
      "status": "completed",
      "subtasks": [
        { "id": "1", "title": "分析需求", "status": "completed" },
        { "id": "2", "title": "设计 API", "status": "completed" }
      ]
    },
    {
      "name": "coding",
      "status": "active",
      "subtasks": [
        { "id": "3", "title": "实现登录接口", "status": "in_progress" },
        { "id": "4", "title": "实现注册接口", "status": "pending" }
      ]
    }
  ]
}
```

**关键字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 任务状态：backlog, in_progress, ai_review, human_review, done |
| `planStatus` | string | 计划状态：pending, active, completed, failed |
| `reviewReason` | string\|null | 审查原因：plan_review, completed, errors |
| `xstateState` | string | XState 状态机状态：backlog, planning, coding, qa_review, qa_fixing, plan_review, human_review, done |
| `executionPhase` | string | 执行阶段：idle, planning, coding, qa_review, qa_fixing, complete |
| `updated_at` | string | 最后更新时间 (ISO 8601) |

### task_metadata.json (用户自定义元数据)

**创建任务时写入，包含用户的自定义配置。**

```json
{
  "sourceType": "manual",
  "category": "feature",
  "priority": "medium",
  "fastMode": false,
  "thinkingLevel": "medium",
  "phaseThinking": {
    "planning": "medium",
    "coding": "high"
  },
  "baseBranch": "__project_default__"
}
```

### 队列数据结构

```json
{
  "backlog": {
    "count": 5,
    "tasks": [
      {
        "spec_id": "006",
        "title": "实现用户认证模块",
        "status": "backlog",
        "priority": "high",
        "category": "feature",
        "progress": 0,
        "subtask_completed": 0,
        "subtask_total": 0,
        "execution_phase": null
      }
    ]
  }
}
```

## Interaction Design

### 交互式选择流程

使用 `AskUserQuestion` 工具实现交互式选择：

1. **队列选择**
   - 用户调用 `/aperant`
   - 显示队列总览
   - 使用 `AskUserQuestion` 让用户选择队列

2. **任务选择**
   - 显示选中队列的任务列表
   - 使用 `AskUserQuestion` 让用户选择任务

3. **操作选择**
   - 显示任务详情
   - 使用 `AskUserQuestion` 让用户选择操作

### 状态图标映射

| 状态 | 图标 |
|------|------|
| backlog | 📋 |
| queue | ⏳ |
| in_progress | 🔄 |
| ai_review | 🤖 |
| human_review | 👀 |
| done | ✅ |

### 优先级图标映射

| 优先级 | 图标 |
|--------|------|
| urgent | 🔴 |
| high | 🟠 |
| medium | 🟡 |
| low | ⚪ |

## Implementation Details

### 文件操作：模拟 APP 端任务移动

**核心原则**: 插件必须模拟 APP 端的完整操作逻辑，确保数据一致性。

#### 任务移动时的文件操作步骤

当用户选择移动任务到新状态时，执行以下操作：

```bash
# 1. 构建文件路径
SPEC_DIR=".auto-claude/specs/$SPEC_ID"
PLAN_FILE="$SPEC_DIR/implementation_plan.json"

# 2. 读取现有 implementation_plan.json
PLAN_DATA=$(cat "$PLAN_FILE")

# 3. 更新状态字段（使用 jq 或 Python）
UPDATED_PLAN=$(echo "$PLAN_DATA" | jq --arg new_status "$TO_STATUS" '
  .status = $new_status |
  .planStatus = (
    if $new_status == "done" then "completed"
    elif $new_status == "backlog" then "pending"
    else "active" end
  ) |
  .xstateState = (
    if $new_status == "backlog" then "backlog"
    elif $new_status == "done" then "done"
    elif $new_status == "in_progress" then "coding"
    elif $new_status == "ai_review" then "qa_review"
    elif $new_status == "human_review" then "human_review"
    else "backlog" end
  ) |
  .executionPhase = (
    if $new_status == "backlog" then "idle"
    elif $new_status == "done" then "complete"
    elif $new_status == "in_progress" then "coding"
    elif $new_status == "ai_review" then "qa_review"
    elif $new_status == "human_review" then "qa_fixing"
    else "idle" end
  ) |
  .updated_at = (now | todateiso8601)
')

# 4. 原子写入（先写临时文件，再重命名）
TEMP_FILE="$PLAN_FILE.tmp.$$"
echo "$UPDATED_PLAN" > "$TEMP_FILE"
mv "$TEMP_FILE" "$PLAN_FILE"
```

#### 状态映射表

| 用户操作 | status | planStatus | xstateState | executionPhase |
|----------|--------|------------|-------------|----------------|
| 移动到 Backlog | backlog | pending | backlog | idle |
| 移动到 Queue | queue | active | backlog | idle |
| 移动到 In Progress | in_progress | active | coding | coding |
| 移动到 AI Review | ai_review | active | qa_review | qa_review |
| 移动到 Human Review | human_review | active | human_review | qa_fixing |
| 移动到 Done | done | completed | done | complete |

#### 特殊状态转换逻辑

**Backlog → In Progress** (启动任务):
```json
{
  "status": "in_progress",
  "planStatus": "active",
  "xstateState": "coding",
  "executionPhase": "coding",
  "execution_state": {
    "phase": "coding",
    "started_at": "2025-03-17T12:00:00Z"
  }
}
```

**Human Review → Done** (完成任务):
```json
{
  "status": "done",
  "planStatus": "completed",
  "xstateState": "done",
  "executionPhase": "complete",
  "reviewReason": "completed"
}
```

**In Progress → Backlog** (停止任务):
```json
{
  "status": "backlog",
  "planStatus": "pending",
  "xstateState": "backlog",
  "executionPhase": "idle"
}
```

### 动态路径解析

插件需要支持项目级和用户级安装，因此脚本路径使用动态解析：

```bash
# 在 SKILL.md 中
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUEUE_SCRIPT="$SCRIPT_DIR/scripts/queue.sh"
```

### 任务 ID 生成

新任务 ID 生成逻辑：

1. 读取 `.auto-claude/specs/` 目录
2. 过滤出所有 3 位数字开头的目录名
3. 找到最大数字
4. 新 ID = 最大数字 + 1，格式化为 3 位数字

### 状态转换规则

**完整状态转换矩阵：**

| 当前状态 | 可转换到的状态 | XState 事件 | 说明 |
|----------|----------------|-------------|------|
| backlog | queue, done | PLAN_APPROVED, MARK_DONE | 从待办可直接启动或完成 |
| queue | in_progress, backlog | PLAN_APPROVED, USER_STOPPED | 队列中可启动或退回 |
| in_progress | ai_review, backlog, done | QA_REVIEW_COMPLETE, USER_STOPPED, MARK_DONE | 执行中可审查、停止或完成 |
| ai_review | human_review, backlog, queue | QA_PASSED, USER_STOPPED | AI 审查后可人工审查或退回 |
| human_review | done, backlog, queue | MARK_DONE, USER_STOPPED | 人工审查后可完成或退回 |
| done | backlog | USER_STOPPED | 已完成可重新激活 |

**状态转换验证逻辑：**

```bash
# 检查状态转换是否有效
VALID_TRANSITIONS=(
  "backlog:queue"
  "backlog:done"
  "queue:in_progress"
  "queue:backlog"
  "in_progress:ai_review"
  "in_progress:backlog"
  "in_progress:done"
  "ai_review:human_review"
  "ai_review:backlog"
  "ai_review:queue"
  "human_review:done"
  "human_review:backlog"
  "human_review:queue"
  "done:backlog"
)

is_valid_transition() {
  local from=$1
  local to=$2
  for transition in "${VALID_TRANSITIONS[@]}"; do
    if [[ "$transition" == "$from:$to" ]]; then
      return 0
    fi
  done
  return 1
}
```

**特殊转换限制：**

1. **backlog → human_review**: 不允许，必须先经过 in_progress
2. **queue → done**: 不允许，必须先经过 in_progress
3. **done → in_progress**: 不允许，必须先回到 backlog

### 状态转换规则

## Error Handling

### 文件操作错误

1. **项目路径检测失败**
   - 错误消息: "❌ 无法检测 Aperant 项目路径，请确保在 Aperant 项目目录中运行"
   - 建议: 设置 `APERANT_PROJECT_PATH` 环境变量

2. **任务不存在**
   - 错误消息: "❌ 任务不存在: <spec_id>"
   - 建议: 使用 `/aperant` 查看可用任务
   - 检查: `.auto-claude/specs/<spec_id>/` 目录是否存在

3. **implementation_plan.json 读取失败**
   - 错误消息: "❌ 无法读取任务状态文件"
   - 原因: 文件损坏或权限问题
   - 建议: 检查文件权限或重新创建任务

4. **implementation_plan.json 写入失败**
   - 错误消息: "❌ 无法更新任务状态"
   - 原因: 磁盘空间不足或权限问题
   - 建议: 检查磁盘空间和文件权限

5. **JSON 解析失败**
   - 错误消息: "❌ 状态文件格式错误"
   - 原因: implementation_plan.json 被 APP 端并发写入
   - 建议: 重试操作（使用原子写入避免）

### 状态转换错误

6. **状态转换无效**
   - 错误消息: "❌ 无效的状态转换: <from> → <to>"
   - 建议: 查看允许的状态转换规则

7. **转换冲突（任务正在执行）**
   - 错误消息: "⚠️ 任务正在执行中，无法移动到 <status>"
   - 建议: 先停止任务或选择其他状态

### 竞态条件处理

**APP 端和插件同时操作时的处理：**

```bash
# 使用原子写入避免竞态条件
atomic_write() {
  local file=$1
  local content=$2
  local temp_file="${file}.tmp.$$"

  # 写入临时文件
  echo "$content" > "$temp_file"

  # 原子重命名（在 POSIX 系统上是原子的）
  if mv "$temp_file" "$file" 2>/dev/null; then
    return 0
  else
    rm -f "$temp_file"
    return 1
  fi
}
```

**检测并处理并发修改：**

```bash
# 读取文件时记录修改时间
before_mtime=$(stat -f "%m" "$PLAN_FILE" 2>/dev/null || stat -c "%Y" "$PLAN_FILE")

# 执行更新操作...

# 验证文件未被其他进程修改
after_mtime=$(stat -f "%m" "$PLAN_FILE" 2>/dev/null || stat -c "%Y" "$PLAN_FILE")
if [[ "$before_mtime" != "$after_mtime" ]]; then
  echo "⚠️ 任务状态已被其他进程修改，请重试"
  exit 1
fi
```

## Testing Strategy

### 单元测试
- 测试 ID 生成逻辑
- 测试状态转换规则
- 测试路径解析逻辑

### 集成测试
- 测试完整的交互流程
- 测试与 Aperant 项目的数据读写
- 测试错误处理

### 用户测试
- 测试 UX 易用性
- 测试交互流程的直观性
- 收集反馈并迭代改进
