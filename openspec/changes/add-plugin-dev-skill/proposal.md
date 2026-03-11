## Why

当前 Claude Marketplace 工程已满足官方 Plugin Marketplace 的基本要求（有 `.claude-plugin/marketplace.json`），但缺少一个关键的开发指导 Skill。当开发者 clone 这个工程后，需要手动了解如何创建新插件和 Skill，这增加了学习成本和出错可能。需要一个 Project 级别的 Skill 来指导插件和 Skill 的开发规范，让 AI 能够自动按照规范生成符合官方标准的插件和 Skill。

## What Changes

- 在 `.claude/skills/create-plugin/` 目录下创建新的 Project Skill
- 包含 `SKILL.md` 主指令文件，定义插件开发的完整流程
- 包含 `templates/` 目录，提供插件和 Skill 的模板文件
- 包含 `examples/` 目录，提供现有 tgbot 插件作为参考示例
- 明确插件目录结构规范、Skill 文件结构规范、Frontmatter 配置说明

## Capabilities

### New Capabilities

- `plugin-dev-skill`: 创建 Project 级别的 Skill，用于指导在这个 Marketplace 中开发新的插件和 Skill。包含完整的开发规范、模板文件和最佳实践指南。

### Modified Capabilities

无现有能力需要修改。

## Impact

- 新增文件：`.claude/skills/create-plugin/SKILL.md`
- 新增目录：`.claude/skills/create-plugin/templates/`
- 新增目录：`.claude/skills/create-plugin/examples/`
- 影响：开发者 clone 工程后，可通过 `/create-plugin <plugin-name> <description>` 命令快速创建符合规范的插件
