# SKILL.md Template

This template shows the structure for a Claude Code skill's `SKILL.md` file, based on official anthropics/skills best practices.

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
description: What this skill does and when Claude should use it. Push the description to improve triggering - include both what AND specific contexts for when to invoke.
argument-hint: [optional-args]
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Skill Title

Brief introduction explaining the value this skill provides.

## Usage

```
/skill-name <required-arg> [optional-arg]
```

- `<required-arg>`: Description of required argument
- `[optional-arg>`: Description of optional argument

## Overview

Explain what this skill accomplishes and why it matters. Describe the workflow at a high level.

## Steps

### 1. First Step

Explain what to do and why it matters. Use imperative form.

```bash
# Example command if needed
echo "Step 1"
```

**Why this step matters**: Explain the reasoning behind this step.

### 2. Second Step

Continue with imperative instructions, explaining the purpose.

### 3. Third Step

Complete the workflow with clear guidance.

## Examples

**Example 1: Basic usage**

Input: `/skill-name my-project`

Output: Description of expected result.

**Example 2: With options**

Input: `/skill-name my-project --option value`

Output: Description of expected result.

## Notes

- Important consideration 1
- Important consideration 2

## Evaluation (Optional)

To test this skill works correctly, create an `evals/evals.json` file:

```json
{
  "skill_name": "skill-name",
  "evals": [
    {
      "id": 1,
      "prompt": "Test prompt for the skill",
      "expected_output": "Description of expected result",
      "assertions": [
        {"type": "file_exists", "expected": true}
      ]
    }
  ]
}
```

## Writing Best Practices

1. **Use imperative form**: Write instructions as commands, not descriptions
2. **Explain the why**: Help readers understand the reasoning, avoid MUST/ALWAYS
3. **Keep SKILL.md under 500 lines**: For complex skills, use references/ directory
4. **Progressive disclosure**: Metadata always loads, body loads on trigger, resources load on demand
5. **Test with real prompts**: Create evals to verify the skill works

## Official Documentation

- Skills: https://code.claude.com/docs/en/skills
- Plugins: https://code.claude.com/docs/en/plugins
