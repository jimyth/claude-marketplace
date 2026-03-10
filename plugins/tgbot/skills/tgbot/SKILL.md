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

```bash
BOT_NAME="${ARGUMENTS:-my-tgbot}"
BOT_DIR="$HOME/workspace/$BOT_NAME"

echo "🤖 Creating Telegram Bot: $BOT_NAME"
echo "   Directory: $BOT_DIR"
```

### 2. Create project structure

```bash
mkdir -p "$BOT_DIR"

cat > "$BOT_DIR/requirements.txt" << 'EOF'
python-telegram-bot>=21.0
EOF

cat > "$BOT_DIR/.env.example" << 'EOF'
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
EOF
```

### 3. Create config module

```bash
cat > "$BOT_DIR/config.py" << 'EOF'
"""Bot configuration management."""
import os
from dataclasses import dataclass

@dataclass
class Config:
    """Bot configuration."""
    bot_token: str
    chat_id: int

    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables."""
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_id = os.getenv("TELEGRAM_CHAT_ID")

        if not bot_token:
            raise ValueError("TELEGRAM_BOT_TOKEN not set")
        if not chat_id:
            raise ValueError("TELEGRAM_CHAT_ID not set")

        return cls(bot_token=bot_token, chat_id=int(chat_id))
EOF
```

### 4. Create main bot file

```bash
cat > "$BOT_DIR/bot.py" << 'BOTEOF'
"""Main Telegram Bot implementation."""
import asyncio
import logging
from typing import List

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

from config import Config

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


class TaskBot:
    """Telegram Bot for task management."""

    def __init__(self, config: Config):
        self.config = config
        self.app = Application.builder().token(config.bot_token).build()
        self._setup_handlers()

    def _setup_handlers(self):
        """Set up command and callback handlers."""
        self.app.add_handler(CommandHandler("start", self.cmd_start))
        self.app.add_handler(CommandHandler("help", self.cmd_help))
        self.app.add_handler(CommandHandler("demo", self.cmd_demo))
        self.app.add_handler(CallbackQueryHandler(self.on_callback))

    async def cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command."""
        await update.message.reply_text(
            "👋 你好! 我是任务管理 Bot\n\n"
            "使用 /help 查看可用命令"
        )

    async def cmd_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command."""
        await update.message.reply_text(
            "📋 可用命令:\n\n"
            "/start - 开始使用\n"
            "/help - 显示帮助\n"
            "/demo - 演示任务流程"
        )

    async def cmd_demo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /demo command."""
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("✅ 确认", callback_data="confirm"),
            InlineKeyboardButton("❌ 取消", callback_data="cancel"),
        ]])

        await update.message.reply_text(
            "📦 *演示任务*\n\n"
            "这是一个演示任务，点击按钮进行确认或取消。",
            reply_markup=keyboard,
            parse_mode="Markdown",
        )

    async def on_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle button callbacks."""
        query = update.callback_query
        await query.answer()

        if query.data == "confirm":
            await query.edit_message_text("✅ 任务已确认!")
        elif query.data == "cancel":
            await query.edit_message_text("❌ 任务已取消")

    def run(self):
        """Start the bot."""
        logger.info("Starting bot...")
        self.app.run_polling(allowed_updates=Update.ALL_TYPES)


def main():
    """Main entry point."""
    config = Config.from_env()
    bot = TaskBot(config)
    bot.run()


if __name__ == "__main__":
    main()
BOTEOF
```

### 5. Create run script

```bash
cat > "$BOT_DIR/run.sh" << 'EOF'
#!/bin/bash
export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-your_token}"
export TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-your_chat_id}"
python3 bot.py
EOF

chmod +x "$BOT_DIR/run.sh"
```

### 6. Create README

```bash
cat > "$BOT_DIR/README.md" << 'EOF'
# Telegram Bot

A task management bot using python-telegram-bot.

## Quick Start

1. Get your Bot Token from [@BotFather](https://t.me/BotFather)
2. Get your Chat ID by messaging your bot and visiting:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Run:

```bash
export TELEGRAM_BOT_TOKEN="your_token"
export TELEGRAM_CHAT_ID="your_chat_id"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 bot.py
```

## Commands

- `/start` - Start the bot
- `/help` - Show help
- `/demo` - Demo task flow

## License

MIT
EOF
```

### 7. Summary

```bash
echo ""
echo "✅ Telegram Bot created successfully!"
echo ""
echo "📁 Project structure:"
echo "   $BOT_DIR/"
echo "   ├── bot.py           # Main bot code"
echo "   ├── config.py        # Configuration"
echo "   ├── requirements.txt # Dependencies"
echo "   ├── run.sh           # Run script"
echo "   └── README.md        # Documentation"
echo ""
echo "🚀 Next steps:"
echo "   1. Get token from @BotFather"
echo "   2. export TELEGRAM_BOT_TOKEN='your_token'"
echo "   3. export TELEGRAM_CHAT_ID='your_chat_id'"
echo "   4. cd $BOT_DIR && python3 -m venv venv && source venv/bin/activate"
echo "   5. pip install -r requirements.txt"
echo "   6. python3 bot.py"
```
