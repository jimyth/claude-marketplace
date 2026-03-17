---
name: aperant
description: 管理 Aperant 项目任务 - 查看队列、移动任务、创建新任务。使用 AskUserQuestion 实现交互式选择。
argument-hint: [show-queues|create <title>]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash, AskUserQuestion
---

# Aperant 任务管理

在 Claude Code 中管理 Aperant 项目的任务，通过交互式选择查看队列、移动任务状态、创建新任务。

## 概述

Aperant 项目使用 OpenSpec 工作流管理开发任务。这个插件让你在 Claude Code 终端中管理这些任务，无需切换到桌面 App。

## 使用方式

```
/aperant                    # 显示队列总览并交互式选择
/aperant show-queues         # 显示所有队列总览
/aperant create <标题>       # 创建新的 Planning 任务
```

## 交互流程

```
/aperant
  → 显示队列总览
  → 选择队列
    → 显示任务列表
    → 选择任务
      → 显示任务详情
      → 选择操作（移动状态/查看日志）
```

## 状态说明

| 状态 | 图标 | 说明 |
|------|------|------|
| backlog | 📋 | 待办事项 |
| queue | ⏳ | 队列中 |
| in_progress | 🔄 | 执行中 |
| ai_review | 🤖 | AI 审查中 |
| human_review | 👀 | 人工审查中 |
| done | ✅ | 已完成 |

## 实现步骤

### 步骤 1: 解析用户输入

检查用户是否提供了 `create` 参数，如果有则跳转到任务创建流程。

### 步骤 2: 检测 Aperant 项目路径

按优先级检测项目路径：
1. 环境变量 `APERANT_PROJECT_PATH`
2. Git 根目录
3. 当前工作目录

### 步骤 3: 显示队列总览

读取 `.auto-claude/specs/` 目录，解析所有任务的 `implementation_plan.json`，按状态分组。

```
📋 任务队列总览

📋 Backlog (5)
⏳ Queue (3)
🔄 In Progress (2)
🤖 AI Review (1)
👀 Human Review (0)
✅ Done (10)
```

### 步骤 4: 交互式选择队列

使用 AskUserQuestion 让用户选择要查看的队列：

```
请选择要查看的队列：
- Backlog (5)
- Queue (3)
- In Progress (2)
- AI Review (1)
- Human Review (0)
- Done (10)
```

### 步骤 5: 显示任务列表

显示选中队列中的所有任务：

```
🔄 In Progress (2)

[003] 实现用户认证模块
  🟠 High
  🔵🔵⚪⚪ (2/4)

[005] 优化数据库查询
  🟡 Medium
  🔵⚪⚪⚪ (1/4)
```

### 步骤 6: 选择任务并显示操作

让用户选择任务，然后显示可用操作：

```
[003] 实现用户认证模块

状态: 🔄 In Progress
优先级: 🟠 High
进度: 2/4 子任务完成

可用操作：
- 查看详情
- 查看日志
- 移动到 AI Review
- 移动到 Backlog
- 移动到 Done
- 返回队列列表
```

### 步骤 7: 执行状态转换

当用户选择移动操作时：

1. 读取 `.auto-claude/specs/<spec_id>/implementation_plan.json`
2. 更新状态字段（status, planStatus, xstateState, executionPhase）
3. 原子写入文件
4. 显示确认消息

### 步骤 8: 创建新任务（可选）

如果用户使用 `/aperant create <标题>`：

1. 生成新的 3 位数字 ID
2. 创建任务目录
3. 生成 `implementation_plan.json` 和 `task_metadata.json`
4. 创建 `requirements.json`

## 状态映射

移动任务时更新以下字段：

| 目标状态 | status | planStatus | xstateState | executionPhase |
|----------|--------|------------|-------------|----------------|
| backlog | backlog | pending | backlog | idle |
| queue | queue | active | backlog | idle |
| in_progress | in_progress | active | coding | coding |
| ai_review | ai_review | active | qa_review | qa_review |
| human_review | human_review | active | human_review | qa_fixing |
| done | done | completed | done | complete |

## 错误处理

- **项目路径检测失败**: 提示设置 `APERANT_PROJECT_PATH`
- **任务不存在**: 提示使用 `/aperant` 查看可用任务
- **状态转换无效**: 显示允许的状态转换规则
- **文件操作失败**: 显示具体错误和建议

## 辅助脚本

插件使用以下辅助脚本（位于 `scripts/` 目录）：

- `queue.sh`: 队列查询和聚合
- `task.sh`: 任务操作（获取详情、移动状态、查看日志）
- `create.sh`: 任务创建

这些脚本使用动态路径解析，支持项目级和用户级安装。

## 动态路径解析

```bash
# 在 SKILL.md 中使用
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUEUE_SCRIPT="$SCRIPT_DIR/scripts/queue.sh"
TASK_SCRIPT="$SCRIPT_DIR/scripts/task.sh"
CREATE_SCRIPT="$SCRIPT_DIR/scripts/create.sh"
```
