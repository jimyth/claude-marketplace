# Jimyth Skills

A plugin marketplace for Claude Code.

## Installation

### 1. Add the marketplace

```bash
/plugin marketplace add jimyth/claude-marketplace
```

### 2. Install the tgbot plugin

```bash
/plugin install tgbot@jimyth-skills
```

### 3. Use the skill

```bash
/tgbot:tgbot              # Create bot with default name
/tgbot:tgbot my-awesome-bot  # Create with custom name
```

## Available Plugins

### tgbot

Generate complete Telegram Bot projects with python-telegram-bot.

- Python 3.9+ compatible
- Task management with inline keyboards
- Real-time status updates
- Async/await support

## Project Structure

```
claude-marketplace/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    └── tgbot/
        ├── .claude-plugin/
        │   └── plugin.json
        └── skills/
            └── tgbot/
                └── SKILL.md
```

## License

MIT
