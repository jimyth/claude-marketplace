# Claude Marketplace - User Guide

## Getting Started

### 1. Configure Your API Key

```bash
/mp-config --api-key your_api_key_here
```

Get your API key at [claude-mp.com/api-keys](https://claude-mp.com/api-keys)

### 2. Search for Extensions

```bash
/mp-search telegram    # Search by keyword
/mp-search python bot  # Multiple keywords
/mp-search --scope=personal  # Search only your extensions
```

### 3. Install an Extension

```bash
/mp-install tgbot      # Install by ID
```

### 4. List Installed Extensions

```bash
/mp-list
```

### 5. Update Extensions

```bash
/mp-update             # Check for updates
/mp-update --all       # Update all
/mp-update tgbot       # Update specific extension
```

## Publishing Your Own Extensions

### 1. Create Extension Directory

```
my-skill/
├── manifest.yaml
└── SKILL.md
```

### 2. Create manifest.yaml

```yaml
id: my-skill
name: My Awesome Skill
version: 1.0.0
type: skill
author: your-username
description: What your skill does
tags:
  - automation
  - productivity
```

### 3. Create SKILL.md

```markdown
# /my-skill - Brief Description

## Arguments
- \`$ARGUMENTS\`: Description

## Steps

### 1. First Step
\`\`\`bash
echo "Hello, World!"
\`\`\`
```

### 4. Publish

```bash
cd my-skill
/mp-publish
```

## Directory Structure

After installation, your directories will look like:

```
~/.claude/
├── commands/
│   └── my-skill.md -> ../marketplace/extensions/my-skill/SKILL.md
└── marketplace/
    ├── config.json      # Your configuration
    ├── cache.json       # Installed extensions
    └── extensions/
        └── my-skill/
            ├── manifest.yaml
            └── SKILL.md
```

## FAQ

**Q: How do I update my API key?**
A: Run `/mp-config --api-key new_key`

**Q: How do I remove an extension?**
A: Delete the directory in `~/.claude/marketplace/extensions/`

**Q: Can I use extensions offline?**
A: Yes, installed extensions work offline. Only search/install require network.
