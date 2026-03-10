# plugin.json Template

This template shows the structure for a Claude Code plugin's `plugin.json` file.

## Location

```
plugins/<plugin-name>/.claude-plugin/plugin.json
```

## Complete Template

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo"
  },
  "keywords": [
    "keyword1",
    "keyword2",
    "keyword3"
  ],
  "category": "development",
  "compatibility": {
    "claudeCode": ">=1.0.33"
  }
}
```

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case, must match directory name) |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `description` | string | Brief description of plugin functionality |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `author` | object | Author information |
| `author.name` | string | Author's name |
| `author.email` | string | Author's email |
| `license` | string | License type (e.g., "MIT", "Apache-2.0") |
| `repository` | object | Source repository information |
| `repository.type` | string | Usually "git" |
| `repository.url` | string | Repository URL |
| `keywords` | array | Array of relevant keywords for discovery |
| `category` | string | Plugin category |
| `compatibility` | object | Compatibility requirements |
| `compatibility.claudeCode` | string | Required Claude Code version |

## Categories

Common categories include:
- `development` - Development tools
- `productivity` - Productivity enhancements
- `integration` - External service integrations
- `code-quality` - Linting, formatting, analysis
- `documentation` - Documentation tools
- `testing` - Testing utilities
- `other` - Everything else

## Examples

### Minimal Plugin

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A simple plugin"
}
```

### Full Plugin

```json
{
  "name": "advanced-tool",
  "version": "2.1.0",
  "description": "Advanced tool with multiple features for code analysis",
  "author": {
    "name": "Developer Name",
    "email": "dev@example.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/advanced-tool"
  },
  "keywords": [
    "analysis",
    "code-quality",
    "linting"
  ],
  "category": "code-quality",
  "compatibility": {
    "claudeCode": ">=1.0.33"
  }
}
```
