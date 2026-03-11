# plugin.json Template

This template shows the structure for a Claude Code plugin's `plugin.json` file.

## Location

```
plugins/<plugin-name>/.claude-plugin/plugin.json
```

## Official Standard

According to the official Claude Code documentation, `plugin.json` requires only:

- `name`: Plugin identifier
- `description`: What the plugin does
- `author`: (optional) Author information

## Minimal Template (Recommended)

```json
{
  "name": "plugin-name",
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
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  }
}
```

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case, must match directory name) |
| `description` | string | Brief description of plugin functionality |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `author` | object | Author information |
| `author.name` | string | Author's name |
| `author.email` | string | Author's email |

## Notes

- Keep `plugin.json` minimal and focused
- Additional metadata like `version`, `license`, `keywords` are not part of the official spec
- The marketplace system handles versioning separately

## Examples

### Minimal Plugin

```json
{
  "name": "my-plugin",
  "description": "A simple plugin"
}
```

### Plugin with Author

```json
{
  "name": "halosee-zd",
  "description": "禅道任务管理插件 - 创建、查看、完成禅道任务并统计工时",
  "author": {
    "name": "Jimyth"
  }
}
```

## Official Documentation

- Plugins: https://code.claude.com/docs/en/plugins
- Plugins Reference: https://code.claude.com/docs/en/reference/plugins
