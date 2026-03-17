# Aperant Plugin for Claude Code

在 Claude Code 终端中管理 Aperant 项目任务，通过交互式选择查看队列、移动任务状态、创建新任务。

## 功能特性

- 📋 **查看队列** - 显示所有任务队列的总览和详情
- 🔄 **移动任务** - 通过交互式选择移动任务到不同状态
- ✨ **创建任务** - 直接在 Claude Code 中创建新的 Planning 任务
- 📊 **任务详情** - 查看任务的详细信息、进度和日志
- 🎯 **交互式操作** - 使用 AskUserQuestion 实现流畅的交互体验

## 安装

此插件是 [claude-marketplace](https://github.com/jimyth/claude-marketplace) 的一部分。

克隆仓库后，插件会自动在 marketplace 中注册。

## 使用方式

### 基本命令

```
/aperant                    # 显示队列总览并交互式选择
/aperant show-queues         # 显示所有队列总览
/aperant create <标题>       # 创建新的 Planning 任务
```

### 交互流程示例

```
用户: /aperant

→ 显示队列总览:
   📋 Backlog (5)
   ⏳ Queue (3)
   🔄 In Progress (2)

→ 用户选择 "In Progress"

→ 显示任务列表:
   [003] 实现用户认证模块 🟠 High (2/4)
   [005] 优化数据库查询 🟡 Medium (1/4)

→ 用户选择 "[003] 实现用户认证模块"

→ 显示任务详情和操作:
   状态: 🔄 In Progress | 优先级: 🟠 High
   可用操作:
   - 查看详情
   - 查看日志
   - 移动到 AI Review
   - 移动到 Backlog
   - 移动到 Done

→ 用户选择 "移动到 AI Review"

→ ✅ 任务已移动到 🤖 AI Review
```

### 创建任务示例

```
用户: /aperant create 实现用户认证模块

✅ 任务创建成功！

📁 任务 ID: 006-implement-user-auth
📝 标题: 实现用户认证模块
📋 状态: Backlog

🔗 后续操作:
   - 查看任务详情: /aperant
   - 移动到 Queue: /aperant (选择任务后移动)
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

## 状态转换规则

```
backlog ──────► queue ──────► in_progress
   │               │              │
   │               │              ▼
   │               │         ai_review
   │               │              │
   │               │              ▼
   │               └───── human_review
   │                      │         │
   └──────────────────────┴─────────┴──► done
```

## 技术实现

### 文件操作

插件通过模拟 APP 端的操作逻辑来更新任务状态：

1. 读取 `.auto-claude/specs/<spec_id>/implementation_plan.json`
2. 更新状态字段（status, planStatus, xstateState, executionPhase）
3. 原子写入文件（临时文件 + mv）

### 状态映射

| 用户操作 | status | planStatus | xstateState | executionPhase |
|----------|--------|------------|-------------|----------------|
| 移动到 Backlog | backlog | pending | backlog | idle |
| 移动到 Queue | queue | active | backlog | idle |
| 移动到 In Progress | in_progress | active | coding | coding |
| 移动到 AI Review | ai_review | active | qa_review | qa_review |
| 移动到 Human Review | human_review | active | human_review | qa_fixing |
| 移动到 Done | done | completed | done | complete |

### 目录结构

```
plugins/aperant/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── aperant/
│       ├── SKILL.md
│       ├── scripts/
│       │   ├── queue.sh
│       │   ├── task.sh
│       │   └── create.sh
│       └── templates/
│           └── task_metadata.json.template
└── README.md
```

## 辅助脚本

### queue.sh

队列查询脚本，读取 `.auto-claude/specs/` 目录并按状态分组任务。

```bash
./scripts/queue.sh summary    # 显示队列总览
./scripts/queue.sh list <status>  # 显示特定状态的任务
```

### task.sh

任务操作脚本，获取详情、移动状态、查看日志。

```bash
./scripts/task.sh --get <spec_id>              # 获取任务详情
./scripts/task.sh --move <spec_id> <status>    # 移动任务
./scripts/task.sh --logs <spec_id> [lines]     # 查看日志
```

### create.sh

任务创建脚本，生成新的任务目录和元数据文件。

```bash
./scripts/create.sh <标题> [描述] [优先级]
```

## 环境变量

- `APERANT_PROJECT_PATH`: 指定 Aperant 项目路径（可选）
  - 如果未设置，插件会自动检测 git 根目录或使用当前目录

## 错误处理

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| 无法检测 Aperant 项目路径 | 不在 git 仓库中 | 设置 `APERANT_PROJECT_PATH` 环境变量 |
| 任务不存在 | spec_id 错误 | 使用 `/aperant` 查看可用任务 |
| 无效的状态转换 | 状态转换规则限制 | 查看状态转换规则 |
| 状态文件格式错误 | JSON 损坏或并发写入 | 重试操作 |

## 兼容性

- 需要安装 `jq` 命令行工具用于 JSON 处理
- 支持 macOS 和 Linux 系统
- 与 Aperant APP 端状态文件完全兼容

## 开发

```bash
# 安装依赖（jq）
brew install jq  # macOS
apt install jq  # Ubuntu/Debian

# 测试脚本
./plugins/aperant/skills/aperant/scripts/queue.sh summary
./plugins/aperant/skills/aperant/scripts/task.sh --get 001-example
```

## 许可证

MIT License

## 作者

Jimyth

## 相关链接

- [Aperant 项目](https://github.com/jimyth/Aperant)
- [claude-marketplace](https://github.com/jimyth/claude-marketplace)
- [OpenSpec 工作流](https://github.com/jimyth/Aperant/blob/main/guides/openspec.md)
