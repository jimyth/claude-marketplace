## Why

Aperant 项目使用 OpenSpec 工作流管理开发任务，但开发者需要在 Claude Code 终端和桌面 App 之间切换来管理任务状态。通过创建一个 Aperant 插件，开发者可以在 Claude Code 内直接查看队列、移动任务、创建 Planning 任务，实现与 LLM 对话后无缝转化为任务，提升开发效率。

## What Changes

- 在 `plugins/aperant/` 创建新的插件目录结构
- 创建 `aperant` Skill，提供交互式任务管理功能
- 实现队列查看、任务详情查看、任务状态切换、任务创建功能
- 所有功能通过交互式选择实现，而非命令行参数
- 更新 `.claude-plugin/marketplace.json` 注册新插件

## Capabilities

### New Capabilities

- `aperant-queue-view`: 查看和浏览 Aperant 任务队列，支持交互式选择队列和任务
- `aperant-task-management`: 查看任务详情、移动任务到不同状态
- `aperant-task-creation`: 在 Claude Code 内创建新的 Planning 阶段任务

### Modified Capabilities

无现有能力需要修改。

## Impact

- 新增插件目录: `plugins/aperant/`
- 新增 Skill: `.claude/skills/aperant/SKILL.md` (在插件内)
- 更新: `.claude-plugin/marketplace.json`
- 依赖: 读取 Aperant 项目的 `.auto-claude/specs/` 目录和任务元数据
