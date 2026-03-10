# Claude Marketplace

A plugin marketplace for Claude Code with marketplace management tools and Telegram bot generator.

## Installation

Add this marketplace to Claude Code:

```bash
/plugin marketplace add jimyth/claude-marketplace
```

## Available Plugins

### marketplace

Marketplace management tools for searching, installing, updating, and publishing extensions.

**Commands:**
- `/marketplace:mp-config` - Configure marketplace API key and settings
- `/marketplace:mp-search` - Search for extensions in the marketplace
- `/marketplace:mp-install` - Install extensions from the marketplace
- `/marketplace:mp-list` - List installed extensions
- `/marketplace:mp-update` - Check for and install extension updates
- `/marketplace:mp-publish` - Publish extensions to the marketplace

**Install:**
```bash
/plugin install marketplace@claude-marketplace
```

### tgbot

Generate complete Telegram Bot projects with python-telegram-bot.

**Commands:**
- `/tgbot:tgbot` - Generate a Telegram Bot project

**Features:**
- Python 3.9+ compatible
- Task management with inline keyboards
- Real-time status updates
- Async/await support

**Install:**
```bash
/plugin install tgbot@claude-marketplace
```

## Project Structure

```
claude-marketplace/
├── .claude-plugin/
│   └── marketplace.json     # Marketplace catalog
├── plugins/
│   ├── marketplace/         # Marketplace management plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── commands/
│   │       ├── mp-config.md
│   │       ├── mp-search.md
│   │       ├── mp-install.md
│   │       ├── mp-list.md
│   │       ├── mp-update.md
│   │       └── mp-publish.md
│   └── tgbot/               # Telegram Bot Generator plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── commands/
│           └── tgbot.md
├── skills/                  # Legacy skills (for backward compatibility)
├── packages/                # Backend service (optional)
└── docs/                    # Documentation
```

## Legacy Installation

For backward compatibility, you can also install via the install script:

```bash
curl -sSL https://raw.githubusercontent.com/jimyth/claude-marketplace/main/install.sh | bash
```

This installs the CLI skills directly to `~/.claude/commands/`.

## Development

```bash
# Clone the repository
git clone https://github.com/jimyth/claude-marketplace.git

# Test locally
/plugin marketplace add ./claude-marketplace

# Install a plugin for testing
/plugin install marketplace@claude-marketplace
```

## License

MIT
