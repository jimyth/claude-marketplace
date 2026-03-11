# SKILL.md Template

This template shows the structure for a Claude Code skill's `SKILL.md` file.

## Location

```
plugins/<plugin-name>/skills/<skill-name>/SKILL.md
```

or for project-level skills:

```
.claude/skills/<skill-name>/SKILL.md
```

## Complete Template

```markdown
---
name: skill-name
description: What this skill does and when Claude should use it. Be specific so Claude knows when to invoke this skill.
argument-hint: [optional] [arguments]
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Skill Title

Brief introduction to what this skill does.

## Usage

Describe how to use this skill:

\`\`\`
/skill-name <required-arg> [optional-arg]
\`\`\`

- `<required-arg>`: Description of required argument
- `[optional-arg]`: Description of optional argument

## Overview

Detailed explanation of the skill's purpose and behavior.

## Steps

### 1. First Step

Instructions for the first step.

\`\`\`bash
# Example code if needed
echo "Step 1"
\`\`\`

### 2. Second Step

Instructions for the second step.

### 3. Third Step

Instructions for the third step.

## Notes

- Important note 1
- Important note 2
```

## Frontmatter Reference

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | No | Directory name | Display name. Becomes `/slash-command`. Lowercase, numbers, hyphens only. Max 64 chars. |
| `description` | Recommended | First paragraph | What the skill does. Claude uses this to decide when to apply it. |
| `argument-hint` | No | - | Hint shown during autocomplete. E.g., `[filename]` or `[repo] [branch]` |
| `disable-model-invocation` | No | `false` | Set `true` to prevent Claude from auto-triggering. Use for side-effect operations. |
| `user-invocable` | No | `true` | Set `false` to hide from `/` menu. Use for background knowledge. |
| `allowed-tools` | No | All tools | Tools Claude can use without permission. E.g., `Read, Write, Bash(gh *)` |
| `model` | No | Default | Model to use when skill is active. |
| `context` | No | - | Set `fork` to run in isolated subagent context. |
| `agent` | No | `general-purpose` | Which subagent type when `context: fork`. Options: `Explore`, `Plan`, `general-purpose`. |
| `hooks` | No | - | Hooks scoped to skill lifecycle. |

## Variable Substitutions

Available in skill content:

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed to the skill |
| `$0`, `$1`, `$2` | Individual arguments by position (0-indexed) |
| `$ARGUMENTS[0]` | Same as `$0` |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing SKILL.md |

## Dynamic Content

Use `!`command`` syntax to inject command output:

```markdown
## Current Branch

!`git branch --show-current`
```

## Script Path (Plugins with scripts)

For plugins that include executable scripts, use **`${CLAUDE_SKILL_DIR}`** variable:

**Correct approach:**

```bash
SCRIPT_PATH="${CLAUDE_SKILL_DIR}/../../scripts/main.sh"
```

**Why:**
- `${CLAUDE_SKILL_DIR}` is the official variable pointing to the SKILL.md directory
- Works regardless of installation scope (project-level or user-level)
- No need for fallback logic

**Usage:**

```bash
bash "$SCRIPT_PATH" --option value
```

## Examples

### Simple Command Skill

```markdown
---
name: hello
description: Say hello to someone
argument-hint: [name]
disable-model-invocation: true
---

Say hello to $ARGUMENTS!

If no name provided, say hello to the world.
```

### File Generator Skill

```markdown
---
name: gen-component
description: Generate a React component
argument-hint: <component-name>
disable-model-invocation: true
allowed-tools: Write, Read
---

Generate a React component named $0.

### Steps
1. Create component directory: `src/components/$0/`
2. Create `$0.tsx` with React component
3. Create `$0.test.tsx` with tests
4. Create `index.ts` for exports
```

### Research Skill (Forked)

```markdown
---
name: research
description: Research a topic in the codebase
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Use Glob to find relevant files
2. Use Grep to search for keywords
3. Read and analyze the code
4. Summarize findings with file references
```

### Plugin with Script

```markdown
---
name: zd-list
description: 查看我的禅道任务列表
argument-hint: [--status wait|doing|done]
disable-model-invocation: true
allowed-tools: Bash
---

# 查看我的任务

查看指派给当前用户的任务列表。

## 脚本路径

\`\`\`bash
# 动态查找插件脚本（按优先级：缓存目录 > 用户级）
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../../scripts/zentao-api.sh"
\`\`\`

## 使用方法

\`\`\`bash
# 查看所有我的任务
bash "$ZD_SCRIPT" list

# 只看进行中的任务
bash "$ZD_SCRIPT" list --status doing
\`\`\`
```

## Best Practices

1. **Clear Description**: Help Claude understand when to use the skill
2. **Step-by-Step**: Break complex tasks into numbered steps
3. **Examples**: Show usage examples
4. **Keep It Focused**: Each skill should do one thing well
5. **Use Arguments**: Make skills reusable with `$ARGUMENTS`
6. **Use disable-model-invocation**: For user-triggered actions like `/deploy`, `/commit`
7. **Dynamic Script Paths**: For plugins with executable scripts, use dynamic path resolution

## Official Documentation

- Skills: https://code.claude.com/docs/en/skills
- Plugins: https://code.claude.com/docs/en/plugins
