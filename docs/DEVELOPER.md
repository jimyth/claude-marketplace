# Skill Developer Guide

## Skill Structure

A skill is a directory containing:

```
my-skill/
├── manifest.yaml    # Metadata (required)
├── SKILL.md         # Main skill file (required)
├── README.md        # Documentation (optional)
├── commands/        # Sub-commands (optional)
│   ├── sub1.md
│   └── sub2.md
├── scripts/         # Helper scripts (optional)
│   └── helper.sh
└── templates/       # Template files (optional)
    └── config.json
```

## Manifest Schema

```yaml
# Required fields
id: my-skill              # Kebab-case, unique identifier
name: My Skill Name       # Display name
version: 1.0.0            # Semantic version
type: skill               # "skill" or "plugin"
author: your-name         # Your name or username
description: What it does # Brief description

# Optional fields
tags: [automation, utils]
entry: SKILL.md           # Main file (default: SKILL.md)
commands:                 # Sub-commands
  - id: sub1
    file: commands/sub1.md
    description: Sub-command 1
changelog:                # Version history
  - version: 1.0.0
    date: 2024-01-15
    changes:
      - Initial release
```

## SKILL.md Template

```markdown
# /skill-name - One-line Description

Detailed description of what the skill does.

## Arguments

- \`$ARGUMENTS\`: Description of what arguments are expected
- First argument typically is the primary target
- Use flags for options: --option, --option=value

## Steps

### 1. First Step Title

\`\`\`bash
# Bash code that executes this step
echo "Processing..."
\`\`\`

### 2. Second Step Title

\`\`\`bash
# More bash code
\`\`\`

## Example

\`\`\`
/skill-name arg1 --option=value
/skill-name another-arg
\`\`\`
```

## Best Practices

### 1. Argument Handling

```bash
# Parse named and positional arguments
TARGET=""
VERBOSE=false

for arg in $ARGUMENTS; do
  case "$arg" in
    --verbose|-v)
      VERBOSE=true
      ;;
    --output=*)
      OUTPUT="${arg#*=}"
      ;;
    *)
      TARGET="$arg"
      ;;
  esac
done
```

### 2. Error Handling

```bash
if [ -z "$TARGET" ]; then
  echo "❌ Error: Target is required"
  echo "Usage: /skill-name <target>"
  exit 1
fi
```

### 3. User Feedback

```bash
echo "🔄 Processing..."
# ... work ...
echo "✅ Done!"
```

### 4. Idempotency

Make your skill safe to run multiple times:

```bash
if [ -f "$OUTPUT_FILE" ]; then
  echo "⚠️  File exists, skipping creation"
else
  echo "Creating file..."
  touch "$OUTPUT_FILE"
fi
```

### 5. Dependencies

Check for required tools:

```bash
if ! command -v python3 &> /dev/null; then
  echo "❌ python3 is required but not installed"
  exit 1
fi
```

## Version Management

### Semantic Versioning

- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes

### Bumping Versions

```bash
/mp-publish --bump patch   # 1.0.0 → 1.0.1
/mp-publish --bump minor   # 1.0.0 → 1.1.0
/mp-publish --bump major   # 1.0.0 → 2.0.0
```

## Testing Your Skill

Before publishing, test locally:

1. Copy SKILL.md to `~/.claude/commands/my-skill.md`
2. Run `/my-skill test-args`
3. Verify output
4. Remove test file
5. Publish with `/mp-publish`

## Publishing Checklist

- [ ] manifest.yaml has all required fields
- [ ] SKILL.md has clear documentation
- [ ] Tested locally
- [ ] Version number is correct
- [ ] Changelog updated (if updating existing skill)
