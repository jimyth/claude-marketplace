## ADDED Requirements

### Requirement: Skill 必须位于正确的目录结构

`create-plugin` Skill 必须位于 `.claude/skills/create-plugin/SKILL.md`，作为 Project 级别的 Skill。

#### Scenario: 正确的 Skill 目录位置
- **WHEN** 创建 create-plugin Skill
- **THEN** Skill 文件必须位于 `.claude/skills/create-plugin/SKILL.md`

#### Scenario: Skill 作为 Project 级别生效
- **WHEN** 用户 clone 此工程到任意位置
- **THEN** Skill 在该工程目录内可用，但在其他工程不可用

### Requirement: SKILL.md 必须包含正确的 Frontmatter

Frontmatter 必须包含 `name`、`description`、`disable-model-invocation` 字段。

#### Scenario: Frontmatter 包含必需字段
- **WHEN** 读取 SKILL.md 文件
- **THEN** 必须包含以下 YAML frontmatter 字段：
  - `name: create-plugin`
  - `description` 描述 Skill 功能
  - `disable-model-invocation: true`

### Requirement: Skill 必须指导创建符合官方规范的插件目录

生成的插件目录必须包含 `.claude-plugin/plugin.json` 和 `skills/` 目录。

#### Scenario: 插件目录包含必需文件
- **WHEN** AI 执行 create-plugin Skill 创建新插件
- **THEN** 必须创建以下结构：
  - `plugins/<plugin-name>/.claude-plugin/plugin.json`
  - `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`

#### Scenario: plugin.json 包含必需字段
- **WHEN** 创建 plugin.json 文件
- **THEN** 必须包含 `name`、`version`、`description` 字段

### Requirement: Skill 必须提供完整的开发规范说明

SKILL.md 内容必须包含目录结构规范、Frontmatter 配置说明、最佳实践。

#### Scenario: SKILL.md 包含开发规范
- **WHEN** 读取 create-plugin/SKILL.md
- **THEN** 内容必须包含：
  - 插件目录结构规范
  - Skill Frontmatter 字段说明
  - 支持文件（templates、examples）的使用方法

### Requirement: Skill 必须提供模板文件

必须提供 `templates/` 目录，包含 plugin.json 和 SKILL.md 的模板。

#### Scenario: templates 目录存在
- **WHEN** 查看 `.claude/skills/create-plugin/templates/`
- **THEN** 必须包含至少以下模板文件：
  - `plugin-json.md` - plugin.json 模板
  - `skill-md.md` - SKILL.md 模板

### Requirement: Skill 必须提供示例参考

必须提供 `examples/` 目录，包含现有 tgbot 插件作为参考示例。

#### Scenario: examples 目录存在
- **WHEN** 查看 `.claude/skills/create-plugin/examples/`
- **THEN** 必须包含 `tgbot.md` 文件，描述现有 tgbot 插件的结构

### Requirement: marketplace.json 必须更新

创建新插件后，必须更新 `.claude-plugin/marketplace.json` 中的 plugins 列表。

#### Scenario: 更新 marketplace.json
- **WHEN** 创建新插件完成
- **THEN** `.claude-plugin/marketplace.json` 的 `plugins` 数组必须包含新插件名称
