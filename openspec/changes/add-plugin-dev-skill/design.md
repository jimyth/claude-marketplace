## Context

当前工程是一个 Claude Code Plugin Marketplace，已包含：
- `.claude-plugin/marketplace.json` - Marketplace 配置
- `plugins/tgbot/` - 一个示例插件（Telegram Bot 生成器）
- `.claude/skills/` - OpenSpec 相关 skills

官方文档要求：
- Marketplace 需要包含 `.claude-plugin/marketplace.json`
- Skills 放在 `.claude/skills/<skill-name>/SKILL.md`
- Plugin skills 放在 `<plugin>/skills/<skill-name>/SKILL.md`

目标是创建一个 Project Skill，让开发者只需描述想要的功能，AI 就能自动生成符合规范的插件。

## Goals / Non-Goals

**Goals:**
- 创建一个 `create-plugin` Skill，指导 AI 生成符合官方规范的插件
- 提供清晰的目录结构模板
- 提供完整的 Skill 开发规范（Frontmatter、内容结构等）
- 参考现有 tgbot 插件作为示例
- 支持通过 `/create-plugin <name> <description>` 触发

**Non-Goals:**
- 不修改现有插件结构
- 不创建新的插件类型或扩展机制
- 不处理插件的发布和分发流程

## Decisions

### 1. Skill 位置选择
**决定**: 放在 `.claude/skills/create-plugin/` (Project 级别)

**理由**:
- Project skills 只在这个项目内生效，符合"仅用于此 marketplace 工程"的需求
- 当 clone 到其他位置时，skill 会随之复制
- 不污染用户的 personal skills

### 2. Skill 结构设计
**决定**: 采用完整的多文件结构

```
create-plugin/
├── SKILL.md           # 主指令（必需）
├── templates/         # 模板文件
│   ├── plugin-json.md   # plugin.json 模板
│   └── skill-md.md      # SKILL.md 模板
└── examples/          # 参考示例
    └── tgbot.md       # 现有 tgbot 插件说明
```

**理由**:
- 保持 `SKILL.md` 简洁（< 500 行）
- 模板文件可在需要时动态加载
- 示例文件帮助 AI 理解最佳实践

### 3. Frontmatter 配置
**决定**: 使用以下配置

```yaml
name: create-plugin
description: Create a new plugin for this marketplace. Use when the user wants to develop a new plugin or skill for Claude Code.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash
```

**理由**:
- `disable-model-invocation: true`: 插件创建是用户主动行为，不应自动触发
- `allowed-tools`: 需要读写文件和创建目录

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Skill 内容过长可能超出上下文预算 | 使用支持文件分离，按需加载 |
| 模板可能过时 | 在 SKILL.md 中提醒检查官方文档最新版本 |
| 生成的插件可能不符合特定需求 | 提供灵活的模板，鼓励用户自定义 |
