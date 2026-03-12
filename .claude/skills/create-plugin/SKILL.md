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
├── skills/               # Agent Skills with SKILL.md files
│   └── <skill-name>/
│       ├── SKILL.md      # Skill definition (required)
│       ├── scripts/      # Optional scripts
│       └── examples/     # Optional examples
└── README.md             # Documentation (optional)
```

**Alternative**: For simple commands, you can use `commands/` directory:

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json
└── commands/
    └── <command>.md      # Simple command file
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
  "description": "<description from user>",
  "author": {
    "name": "<ask user or use default>"
  }
}
```

**Required fields:**
- `name`: Plugin identifier (matches directory name)
- `description`: What the plugin does

**Optional fields:**
- `author`: Author information

### Step 4: Create SKILL.md

Create `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`:

The skill name typically matches the plugin name for simplicity.

**SKILL.md Template:**

```markdown
---
name: <skill-name>
description: <What this skill does. When should Claude use it?>
argument-hint: [optional-args]
disable-model-invocation: true
allowed-tools: <tools needed>
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
      "source": "./plugins/<plugin-name>",
      "description": "<description>"
    }
  ]
}
```

### Step 6: Summary

Show the user:
1. Created directory structure
2. Files created
3. How to use the new plugin: `/plugin-name:skill-name`

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
7. **Use disable-model-invocation**: For user-triggered actions like `/deploy`, `/commit`

### Dynamic Script Paths

When a plugin includes executable scripts (e.g., shell scripts), use **dynamic path resolution** instead of hardcoded paths. This ensures the plugin works correctly regardless of installation scope (project-level or user-level).

**Recommended Pattern:**

```bash
# Dynamic plugin path resolution (cache > user-level)
PLUGIN_SCRIPT="${CLAUDE_SKILL_DIR}/../../scripts/script.sh"
```

**Why this matters:**
- Plugins can be installed at project scope (`./.claude/plugins/`) or user scope (`~/.claude/plugins/`)
- Hardcoded paths break when installed at a different scope
- The `find` command searches the cache directory first

**Example in SKILL.md:**

```markdown
## Script Path

\`\`\`bash
# Dynamic plugin path resolution
MY_SCRIPT="${CLAUDE_SKILL_DIR}/../../scripts/main.sh"
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

## Evals (Testing Your Skill)

After creating a skill, create test cases to verify it works correctly. Evals help ensure the skill behaves as expected.

### Creating evals

Create `plugins/<plugin-name>/skills/<skill-name>/evals/evals.json`:

```json
{
  "skill_name": "skill-name",
  "evals": [
    {
      "id": 1,
      "prompt": "Test prompt that should trigger this skill",
      "expected_output": "Description of what should happen",
      "files": [],
      "assertions": [
        {"type": "file_exists", "path": "expected/file.txt", "expected": true},
        {"type": "contains", "path": "output.txt", "value": "expected content"}
      ]
    }
  ]
}
```

**Assertion types:**
- `file_exists`: Check if a file was created
- `contains`: Check if file contains specific content
- `regex`: Match content against a pattern

### Why evals matter

Testing skills with real prompts reveals issues that aren't obvious from reading the instructions. A skill that looks correct might fail in practice because:
- The description doesn't trigger when expected
- Steps are ambiguous or incomplete
- Edge cases weren't considered

## Iterative Improvement

Skills improve through iteration. After testing:

1. **Review results**: Identify what worked and what didn't
2. **Generalize from feedback**: Don't just fix the specific test case - improve the underlying instructions
3. **Keep instructions lean**: Remove anything that isn't pulling its weight
4. **Explain the why**: Help readers understand the reasoning behind each step

### Iteration workflow

```
Draft skill → Test with evals → Review results → Improve skill → Repeat
```

Each iteration:
1. Run test cases (with skill and baseline without skill)
2. Compare outputs
3. Identify improvement areas
4. Update SKILL.md
5. Re-test

Stop when:
- All test cases pass
- Feedback is all positive
- No meaningful progress is being made

## Evals (Testing Your Skill)

After creating a skill, verify it works correctly by creating test cases. This follows the iterative improvement approach from anthropics/skills.

### Create evals.json

Create `evals/evals.json` in your skill directory:

```json
{
  "skill_name": "<skill-name>",
  "evals": [
    {
      "id": 1,
      "prompt": "User's test prompt for the skill",
      "expected_output": "Description of what should happen",
      "files": [],
      "expectations": [
        "The skill reads the configuration",
        "The skill creates the correct file"
      ],
      "assertions": [
        {"type": "file_exists", "expected": true}
      ]
    }
  ]
}
```

### Assertion Types

| Type | Description | Example |
|------|-------------|---------|
| `file_exists` | Check if file exists | `{"type": "file_exists", "expected": true}` |
| `contains` | Check if output contains text | `{"type": "contains", "expected": "result text"}` |
| `regex` | Match output against regex | `{"type": "regex", "expected": "pattern.*"}` |

### Iterative Improvement Flow

1. **Run test cases** - Use the skill to execute test prompts
2. **Review outputs** - Qualitatively assess the results
3. **Identify improvements** - Based on what worked and what didn't
4. **Update SKILL.md** - Refine instructions
5. **Re-test** - Verify improvements work

Stop when:
- All test cases pass
- Feedback is all positive
- No meaningful progress is being made

## Writing Best Practices (from skill-creator)

1. **Use imperative form**: Write instructions as commands, not descriptions
2. **Explain the why**: Help readers understand the reasoning, avoid MUST/ALWAYS
3. **Keep SKILL.md under 500 lines**: For complex skills, use references/ directory
4. **Progressive disclosure**: Metadata always loads, body loads on trigger, resources load on demand
5. **Test with real prompts**: Create evals to verify the skill works
6. **Push descriptions**: Make descriptions "pushy" to improve triggering accuracy

## Official Documentation

Always refer to the latest official documentation:
- Plugins: https://code.claude.com/docs/en/plugins
- Skills: https://code.claude.com/docs/en/skills
- Marketplace: https://code.claude.com/docs/en/discover-plugins
