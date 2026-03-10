---
name: create-plugin
description: Create a new plugin for this Claude Code marketplace. Use when the user wants to develop a new plugin or skill for Claude Code.
argument-hint: <plugin-name> <description>
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Create Plugin for Claude Code Marketplace

This skill guides you to create a new plugin that conforms to the official Claude Code plugin specification.

## Overview

When the user wants to create a new plugin, follow these steps to generate a complete plugin structure.

## Usage

```
/create-plugin <plugin-name> <description>
```

- `plugin-name`: Plugin name (kebab-case, e.g., `my-tool`)
- `description`: Brief description of plugin functionality

## Plugin Directory Structure

Each plugin must follow this structure:

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json       # Plugin metadata (required)
└── skills/
    └── <skill-name>/     # At least one skill
        └── SKILL.md      # Skill definition (required)
```

## Implementation Steps

### Step 1: Validate Input

1. Parse `$ARGUMENTS` to get plugin name and description
2. Convert plugin name to kebab-case if needed
3. Ensure plugin doesn't already exist in `plugins/` directory

### Step 2: Create Plugin Directory

```bash
PLUGIN_NAME="$0"
PLUGIN_DIR="plugins/$PLUGIN_NAME"

mkdir -p "$PLUGIN_DIR/.claude-plugin"
mkdir -p "$PLUGIN_DIR/skills/$PLUGIN_NAME"
```

### Step 3: Create plugin.json

Create `plugins/<plugin-name>/.claude-plugin/plugin.json`:

```json
{
  "name": "<plugin-name>",
  "version": "1.0.0",
  "description": "<description from user>",
  "author": {
    "name": "<ask user or use default>"
  },
  "license": "MIT",
  "keywords": ["<relevant>", "<keywords>"],
  "category": "<development|productivity|integration|other>"
}
```

**Required fields:**
- `name`: Plugin identifier (matches directory name)
- `version`: Semantic version (start with "1.0.0")
- `description`: What the plugin does

**Optional fields:**
- `author`: Author information
- `license`: License type (default: MIT)
- `keywords`: Array of relevant keywords
- `category`: Plugin category

### Step 4: Create SKILL.md

Create `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`:

The skill name typically matches the plugin name for simplicity.

**SKILL.md Template:**

```markdown
---
name: <skill-name>
description: <What this skill does. When should Claude use it?>
argument-hint: [optional-args]
---

# <Skill Title>

<Brief description of what the skill does>

## Usage

<How to use this skill>

## Steps

### 1. <Step Name>

<Step instructions>

### 2. <Step Name>

<Step instructions>

## Notes

<Any additional notes or tips>
```

### Step 5: Update marketplace.json

Add the new plugin to `.claude-plugin/marketplace.json`:

```json
{
  "plugins": [
    // ... existing plugins ...
    {
      "name": "<plugin-name>",
      "source": "./<plugin-name>",
      "description": "<description>",
      "version": "1.0.0",
      "author": {
        "name": "<author>"
      },
      "category": "<category>",
      "keywords": ["<keywords>"]
    }
  ]
}
```

### Step 6: Summary

Show the user:
1. Created directory structure
2. Files created
3. How to use the new plugin: `/<plugin-name>:<skill-name>`

## Skill Frontmatter Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name (defaults to directory name). Becomes `/slash-command` |
| `description` | Recommended | What the skill does. Claude uses this to decide when to apply it |
| `argument-hint` | No | Hint shown during autocomplete (e.g., `[filename]`) |
| `disable-model-invocation` | No | Set `true` to prevent auto-trigger (default: `false`) |
| `user-invocable` | No | Set `false` to hide from `/` menu (default: `true`) |
| `allowed-tools` | No | Tools Claude can use without permission (e.g., `Read, Write, Bash`) |
| `context` | No | Set `fork` to run in isolated subagent |
| `agent` | No | Which subagent type when `context: fork` |

## Best Practices

1. **Single Responsibility**: Each skill should do one thing well
2. **Clear Description**: Help Claude understand when to use the skill
3. **Modular Structure**: Use supporting files for complex skills
4. **Examples**: Include usage examples in SKILL.md
5. **Arguments**: Use `$ARGUMENTS`, `$0`, `$1` for parameterized skills
6. **Dynamic Script Paths**: Use dynamic path resolution for scripts (see below)

### Dynamic Script Paths

When a plugin includes executable scripts (e.g., shell scripts), use **dynamic path resolution** instead of hardcoded paths. This ensures the plugin works correctly regardless of installation scope (project-level or user-level).

**Recommended Pattern:**

```bash
# Dynamic plugin path resolution (project-level > user-level)
PLUGIN_SCRIPT="$(find . -path '*/.claude/plugins/<plugin-name>/scripts/script.sh' 2>/dev/null | head -1)"
[ -z "$PLUGIN_SCRIPT" ] && PLUGIN_SCRIPT="$HOME/.claude/plugins/<plugin-name>/scripts/script.sh"
```

**Why this matters:**
- Plugins can be installed at project scope (`./.claude/plugins/`) or user scope (`~/.claude/plugins/`)
- Hardcoded paths break when installed at a different scope
- The `find` command searches recursively from current directory, covering subdirectories

**Example in SKILL.md:**

```markdown
## Script Path

\`\`\`bash
# Dynamic plugin path resolution
MY_SCRIPT="$(find . -path '*/.claude/plugins/my-plugin/scripts/main.sh' 2>/dev/null | head -1)"
[ -z "$MY_SCRIPT" ] && MY_SCRIPT="$HOME/.claude/plugins/my-plugin/scripts/main.sh"
\`\`\`

## Usage

\`\`\`bash
bash "$MY_SCRIPT" --option value
\`\`\`
```

## Templates

For detailed templates, see:
- [templates/plugin-json.md](templates/plugin-json.md) - plugin.json template
- [templates/skill-md.md](templates/skill-md.md) - SKILL.md template

## Examples

For reference, see:
- [examples/tgbot.md](examples/tgbot.md) - Existing tgbot plugin structure

## Official Documentation

Always refer to the latest official documentation:
- Plugins: https://code.claude.com/docs/en/plugins
- Skills: https://code.claude.com/docs/en/skills
- Marketplace: https://code.claude.com/docs/en/discover-plugins
