# Claude Marketplace

A plugin marketplace for Claude Code that provides a skill market manager.

## Architecture

```
Claude Code Plugin Marketplace (jimyth/claude-marketplace)
│
├── plugins/
│   └── marketplace/          # Skill Market Manager Plugin
│       └── commands/
│           ├── mp-config     # Configure API key
│           ├── mp-search     # Search skills
│           ├── mp-install    # Install skills
│           ├── mp-list       # List installed
│           ├── mp-update     # Update skills
│           └── mp-publish    # Publish skills
│
└── skills/                   # Skills available in the market
    └── tgbot/                # Telegram Bot Generator
```

## Installation

### Step 1: Add the plugin marketplace

```bash
/plugin marketplace add jimyth/claude-marketplace
```

### Step 2: Install the skill market manager

```bash
/plugin install marketplace@claude-marketplace
```

### Step 3: Use the skill market manager

```bash
# Search for skills
/marketplace:mp-search telegram

# Install a skill
/marketplace:mp-install tgbot

# List installed skills
/marketplace:mp-list

# Update skills
/marketplace:mp-update
```

### Step 4: Use installed skills directly

After installing a skill, use it without namespace prefix:

```bash
/tgbot my-awesome-bot
```

## Available Skills

### tgbot

Generate complete Telegram Bot projects with python-telegram-bot.

```bash
/marketplace:mp-install tgbot
/tgbot                    # Create bot in ~/workspace/my-tgbot
/tgbot my-awesome-bot     # Create with custom name
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `/marketplace:mp-config` | Configure marketplace API key and settings |
| `/marketplace:mp-search [keyword]` | Search for skills |
| `/marketplace:mp-install <id>` | Install a skill |
| `/marketplace:mp-list` | List installed skills |
| `/marketplace:mp-update [id]` | Update skills |
| `/marketplace:mp-publish [path]` | Publish a skill |

## Project Structure

```
claude-marketplace/
├── .claude-plugin/
│   └── marketplace.json     # Plugin marketplace catalog
├── plugins/
│   └── marketplace/         # Skill market manager plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── commands/
│           ├── mp-config.md
│           ├── mp-search.md
│           ├── mp-install.md
│           ├── mp-list.md
│           ├── mp-update.md
│           └── mp-publish.md
├── skills/                  # Skills in the market
│   └── tgbot/
│       ├── manifest.yaml
│       └── SKILL.md
├── index.yaml               # Skills index
└── install.sh               # Legacy install script
```

## Development

```bash
# Clone the repository
git clone https://github.com/jimyth/claude-marketplace.git

# Test locally
/plugin marketplace add ./claude-marketplace

# Install the marketplace plugin
/plugin install marketplace@claude-marketplace
```

## License

MIT
