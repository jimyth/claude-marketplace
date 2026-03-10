# /mp-install - Install Extension

Install an extension from the marketplace.

## Arguments

- `$ARGUMENTS`: Extension ID to install
- `--source=<source>`: Force specific source (personal, public)

## Steps

### 1. Parse arguments

```bash
EXT_ID=""
FORCE_SOURCE=""

for arg in $ARGUMENTS; do
  case "$arg" in
    --source=*)
      FORCE_SOURCE="${arg#*=}"
      ;;
    *)
      EXT_ID="$arg"
      ;;
  esac
done

if [ -z "$EXT_ID" ]; then
  echo "❌ Please specify an extension ID"
  echo "Usage: /mp-install <id>"
  echo ""
  echo "Search for extensions: /mp-search <keyword>"
  exit 1
fi
```

### 2. Get configuration

```bash
CONFIG_FILE="$HOME/.claude/marketplace/config.json"
SERVER="https://api.claude-mp.com"
API_KEY=""

if [ -f "$CONFIG_FILE" ]; then
  SERVER=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('server', '$SERVER'))")
  API_KEY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('apiKey', ''))")
fi
```

### 3. Check if already installed

```bash
INSTALL_DIR="$HOME/.claude/marketplace/extensions/$EXT_ID"
CACHE_FILE="$HOME/.claude/marketplace/cache.json"

if [ -d "$INSTALL_DIR" ]; then
  echo "⚠️  Extension '$EXT_ID' is already installed."
  echo ""
  read -p "Reinstall? (y/N): " CONFIRM
  if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
  fi
  rm -rf "$INSTALL_DIR"
fi
```

### 4. Download extension

```bash
echo "📥 Downloading: $EXT_ID"

# Build URL
URL="$SERVER/extensions/$EXT_ID/download"
if [ -n "$FORCE_SOURCE" ]; then
  URL="$URL?source=$FORCE_SOURCE"
fi

# Download ZIP
TEMP_ZIP="/tmp/$EXT_ID.zip"
HTTP_CODE=$(curl -s -w "%{http_code}" -o "$TEMP_ZIP" "$URL")

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Failed to download extension (HTTP $HTTP_CODE)"
  rm -f "$TEMP_ZIP"
  exit 1
fi
```

### 5. Install extension

```bash
echo "📦 Installing..."

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"
unzip -q "$TEMP_ZIP"
rm "$TEMP_ZIP"

# Link commands to ~/.claude/commands/
COMMANDS_DIR="$HOME/.claude/commands"
mkdir -p "$COMMANDS_DIR"

# Find and link command files
find . -name "*.md" -type f | while read cmd_file; do
  CMD_NAME=$(basename "$cmd_file" .md)
  ln -sf "$INSTALL_DIR/$cmd_file" "$COMMANDS_DIR/$CMD_NAME.md"
  echo "  ✓ Linked: /$CMD_NAME"
done
```

### 6. Update cache

```bash
python3 << EOF
import json
import os
from datetime import datetime

cache_file = "$CACHE_FILE"
os.makedirs(os.path.dirname(cache_file), exist_ok=True)

# Load existing cache
if os.path.exists(cache_file):
    with open(cache_file, 'r') as f:
        cache = json.load(f)
else:
    cache = {"installed": []}

# Add/update extension
installed = [e for e in cache["installed"] if e["id"] != "$EXT_ID"]
installed.append({
    "id": "$EXT_ID",
    "version": "1.0.0",
    "source": "public",
    "installedAt": datetime.now().isoformat(),
    "path": "$INSTALL_DIR"
})
cache["installed"] = installed

with open(cache_file, 'w') as f:
    json.dump(cache, f, indent=2)
EOF

echo ""
echo "✅ Extension installed successfully!"
echo "   Location: $INSTALL_DIR"
echo ""
echo "💡 Try: /$EXT_ID"
```

## Example

```
/mp-install tgbot              # Install from any source
/mp-install my-skill --source=personal  # Install from personal
```
