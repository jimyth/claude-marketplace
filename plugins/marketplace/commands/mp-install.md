# /mp-install - Install Extension

Install an extension from the marketplace.

## Arguments

- `$ARGUMENTS`: Extension ID to install

## Steps

### 1. Parse arguments

```bash
EXT_ID="$ARGUMENTS"

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
SERVER="https://raw.githubusercontent.com/jimyth/claude-marketplace/main"

if [ -f "$CONFIG_FILE" ]; then
  SERVER=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('server', '$SERVER'))")
fi
```

### 3. Check if already installed

```bash
INSTALL_DIR="$HOME/.claude/marketplace/extensions/$EXT_ID"
CACHE_FILE="$HOME/.claude/marketplace/cache.json"

if [ -d "$INSTALL_DIR" ]; then
  echo "⚠️  Extension '$EXT_ID' is already installed."
  echo "   Use /mp-update $EXT_ID to update"
  exit 0
fi
```

### 4. Get extension info from index

```bash
echo "📥 Installing: $EXT_ID"

INDEX_CACHE="$HOME/.claude/marketplace/index-cache.yaml"
if [ ! -f "$INDEX_CACHE" ]; then
  echo "🔄 Fetching index first..."
  curl -sL "$SERVER/index.yaml" -o "$INDEX_CACHE"
fi

EXT_INFO=$(python3 << EOF
import yaml
import json

with open("$INDEX_CACHE", 'r') as f:
    index = yaml.safe_load(f)

for skill in index.get('skills', []):
    if skill['id'] == '$EXT_ID':
        print(json.dumps(skill))
        break
else:
    print("null")
EOF
)

if [ "$EXT_INFO" = "null" ]; then
  echo "❌ Extension not found: $EXT_ID"
  exit 1
fi
```

### 5. Download files

```bash
echo "📦 Downloading files..."

mkdir -p "$INSTALL_DIR"

# Download each file
python3 << EOF
import json
import os
import urllib.request

ext_info = $EXT_INFO
server = "$SERVER"
install_dir = "$INSTALL_DIR"

skill_path = ext_info['path']
files = ext_info.get('files', ['SKILL.md'])

for filename in files:
    url = f"{server}/{skill_path}/{filename}"
    filepath = os.path.join(install_dir, filename)

    print(f"  ↓ {filename}")
    try:
        urllib.request.urlretrieve(url, filepath)
    except Exception as e:
        print(f"    Error: {e}")
EOF

echo "✅ Files downloaded"
```

### 6. Update cache

```bash
mkdir -p "$(dirname "$CACHE_FILE")"

python3 << EOF
import json
import os
from datetime import datetime

cache_file = "$CACHE_FILE"
ext_id = "$EXT_ID"
install_dir = "$INSTALL_DIR"

# Read manifest
manifest = {}
manifest_path = os.path.join(install_dir, "manifest.yaml")
if os.path.exists(manifest_path):
    import yaml
    with open(manifest_path, 'r') as f:
        manifest = yaml.safe_load(f)

# Load or create cache
cache = {"installed": []}
if os.path.exists(cache_file):
    with open(cache_file, 'r') as f:
        cache = json.load(f)

# Add extension
cache['installed'].append({
    "id": ext_id,
    "version": manifest.get('version', '1.0.0'),
    "source": "public",
    "installedAt": datetime.now().isoformat()[:10],
    "path": install_dir
})

# Save cache
with open(cache_file, 'w') as f:
    json.dump(cache, f, indent=2)
EOF

echo ""
echo "✅ Installation complete!"
echo "📁 Installed to: $INSTALL_DIR"
echo ""
echo "💡 Use: /$EXT_ID"
```

## Example

```
/mp-install tgbot      # Install Telegram Bot Generator
/mp-install mp-search  # Install another skill
```
