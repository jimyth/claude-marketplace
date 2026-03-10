#!/bin/bash
# Claude Marketplace Installer
# Usage: curl -sSL https://raw.githubusercontent.com/jimyth/claude-marketplace/main/install.sh | bash

set -e

MARKETPLACE_REPO="https://github.com/jimyth/claude-marketplace.git"
COMMANDS_DIR="$HOME/.claude/commands"
MARKETPLACE_DIR="$HOME/.claude/marketplace"

echo "🏪 Installing Claude Marketplace..."
echo ""

# Create directories
mkdir -p "$COMMANDS_DIR" "$MARKETPLACE_DIR"

# Clone repository
TEMP_DIR=$(mktemp -d)
echo "📥 Downloading marketplace..."
git clone --depth 1 "$MARKETPLACE_REPO" "$TEMP_DIR"

# Install CLI skills
echo "📦 Installing CLI skills..."
for skill_dir in "$TEMP_DIR/skills"/mp-*/; do
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
        cp "$skill_dir/SKILL.md" "$COMMANDS_DIR/${skill_name}.md"
        echo "  ✓ ${skill_name}"
    fi
done

# Create config if not exists
if [ ! -f "$MARKETPLACE_DIR/config.json" ]; then
    echo ""
    echo "⚙️  Creating configuration..."
    cat > "$MARKETPLACE_DIR/config.json" << 'EOF'
{
  "server": "https://raw.githubusercontent.com/jimyth/claude-marketplace/main"
}
EOF
    echo "  ✓ Config created at ~/.claude/marketplace/config.json"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 Available commands:"
echo "   /mp-config  - Configure marketplace"
echo "   /mp-search  - Search extensions"
echo "   /mp-install - Install extensions"
echo "   /mp-list    - List installed"
echo "   /mp-update  - Update extensions"
echo "   /mp-publish - Publish your extensions"
echo ""
echo "🚀 Get started: /mp-search <keyword>"
