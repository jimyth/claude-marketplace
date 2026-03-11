# plugin.json Template

This template shows the structure for a Claude Code plugin's `plugin.json` file.

## Location

```
plugins/<plugin-name>/.claude-plugin/plugin.json
```

## Official Standard

According to the [Claude Code Marketplace Schema](https://github.com/ananddtyagi/claude-code-marketplace/blob/main/PLUGIN_SCHEMA.md), `plugin.json` requires:

- `name`: Plugin identifier
- `version`: Semantic version (e.g., "1.0.0")
- `description`: What the plugin does

## Minimal Template (Recommended)

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Author Name"
  }
}
```

## Full Template (With Optional Fields)

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin-name",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"]
}
```

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case, must match directory name) |
| `version` | string | Semantic version (e.g., "1.0.0", "1.2.3") |
| `description` | string | Brief description of plugin functionality |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `author` | object | Author information |
| `author.name` | string | Author's name |
| `author.email` | string | Author's email |
| `author.url` | string | Author's website or GitHub profile |
| `homepage` | string | Plugin documentation URL |
| `repository` | string | Git repository URL |
| `license` | string | License identifier (e.g., "MIT", "Apache-2.0") |
| `keywords` | array | Searchable keywords |

## Semantic Versioning

Use [SemVer](https://semver.org/) for version numbers:

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

Examples:
- `1.0.0` - Initial release
- `1.1.0` - Added new skill
- `1.1.1` - Fixed bug in script

## Notes

- Keep `plugin.json` minimal and focused
- Update version when making changes
- Use semantic versioning for clarity

## Examples

### Minimal Plugin

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A simple plugin"
}
```

### Plugin with Author

```json
{
  "name": "halosee-zd",
  "version": "1.1.0",
  "description": "禅道任务管理插件 - 创建、查看、完成禅道任务并统计工时",
  "author": {
    "name": "Jimyth"
  }
}
```

## Official Documentation

- Plugins: https://code.claude.com/docs/en/plugins
- Plugins Reference: https://code.claude.com/docs/en/reference/plugins
- Marketplace Schema: https://github.com/ananddtyagi/claude-code-marketplace/blob/main/PLUGIN_SCHEMA.md
