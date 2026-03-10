# tgbot Plugin Example

This document describes the structure of the existing `tgbot` plugin as a reference example.

## Directory Structure

```
plugins/tgbot/
├── .claude-plugin/
│   └── plugin.json       # Plugin metadata
└── skills/
    └── tgbot/
        └── SKILL.md      # Skill definition
```

## plugin.json

```json
{
  "name": "tgbot",
  "version": "1.0.0",
  "description": "Generate Telegram Bot projects with python-telegram-bot",
  "author": {
    "name": "Jimyth"
  },
  "license": "MIT",
  "keywords": ["telegram", "bot", "python", "generator"],
  "category": "development"
}
```

### Key Points

- `name`: Matches the directory name (`tgbot`)
- `version`: Starts at "1.0.0"
- `description`: Clear, concise description
- `keywords`: Relevant tags for discovery
- `category`: "development" since it's a code generator

## SKILL.md

```markdown
---
name: tgbot
description: Generate a complete Telegram Bot project using python-telegram-bot. Use when user wants to create a Telegram bot.
---

# Generate Telegram Bot

Create a complete Telegram Bot project with python-telegram-bot library.

## Usage

User provides bot name (optional, defaults to "my-tgbot").

## Steps

### 1. Setup project name

[... implementation details ...]

### 7. Summary

[... summary output ...]
```

### Key Points

- **Frontmatter**:
  - `name`: `tgbot` - becomes `/tgbot` command
  - `description`: Helps Claude know when to suggest this skill

- **Structure**:
  - Brief introduction
  - Usage section
  - Numbered steps with bash code blocks
  - Summary at the end

- **Argument Handling**:
  - Uses `${ARGUMENTS:-my-tgbot}` for optional default value

- **Output**:
  - Creates complete project structure
  - Includes all necessary files
  - Shows summary and next steps

## Generated Project Structure

When the skill runs, it creates:

```
~/workspace/<bot-name>/
├── bot.py           # Main bot implementation
├── config.py        # Configuration management
├── requirements.txt # Python dependencies
├── run.sh           # Run script
├── .env.example     # Environment template
└── README.md        # Documentation
```

## Usage Example

```
/tgbot my-awesome-bot
```

Output:
```
🤖 Creating Telegram Bot: my-awesome-bot
   Directory: /home/user/workspace/my-awesome-bot

✅ Telegram Bot created successfully!

📁 Project structure:
   /home/user/workspace/my-awesome-bot/
   ├── bot.py           # Main bot code
   ├── config.py        # Configuration
   ├── requirements.txt # Dependencies
   ├── run.sh           # Run script
   └── README.md        # Documentation

🚀 Next steps:
   1. Get token from @BotFather
   2. export TELEGRAM_BOT_TOKEN='your_token'
   ...
```

## Lessons Learned

1. **Simple Structure**: One skill, one plugin - keep it focused
2. **Clear Steps**: Numbered steps with bash blocks are easy to follow
3. **Good Defaults**: Use default values for optional arguments
4. **Helpful Output**: Show what was created and what to do next
5. **Self-Contained**: All logic in one SKILL.md file for simple skills
