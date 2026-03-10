# /mp-config - Configure Marketplace

Configure your marketplace connection settings.

## Arguments

- `--api-key <key>`: Set your API key
- `--show`: Show current configuration

## Steps

### 1. Check arguments

```bash
API_KEY=""
SHOW_CONFIG=false

for arg in "$ARGUMENTS"; do
  case "$arg" in
    --api-key=*)
      API_KEY="${arg#*=}"
      ;;
    --show)
      SHOW_CONFIG=true
      ;;
  esac
done
```

### 2. Setup config directory

```bash
CONFIG_DIR="$HOME/.claude/marketplace"
CONFIG_FILE="$CONFIG_DIR/config.json"

mkdir -p "$CONFIG_DIR"
```

### 3. Show current config

```bash
if [ "$SHOW_CONFIG" = true ]; then
  if [ -f "$CONFIG_FILE" ]; then
    echo "📋 Current Configuration:"
    echo ""
    cat "$CONFIG_FILE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
key = data.get('apiKey', '')
masked = '****' + key[-4:] if len(key) > 4 else '(not set)'
print(f'  API Key: {masked}')
print(f'  Server: {data.get(\"server\", \"https://api.claude-mp.com\")}')
"
  else
    echo "⚠️  No configuration found. Run: /mp-config --api-key YOUR_KEY"
  fi
  exit 0
fi
```

### 4. Set API key

```bash
if [ -n "$API_KEY" ]; then
  # Validate API key format (should be at least 16 characters)
  if [ ${#API_KEY} -lt 16 ]; then
    echo "❌ Invalid API key format. Key should be at least 16 characters."
    exit 1
  fi

  # Create or update config
  if [ -f "$CONFIG_FILE" ]; then
    # Update existing config
    python3 << EOF
import json
with open("$CONFIG_FILE", "r") as f:
    config = json.load(f)
config["apiKey"] = "$API_KEY"
with open("$CONFIG_FILE", "w") as f:
    json.dump(config, f, indent=2)
EOF
  else
    # Create new config
    cat > "$CONFIG_FILE" << EOF
{
  "apiKey": "$API_KEY",
  "server": "https://api.claude-mp.com"
}
EOF
    chmod 600 "$CONFIG_FILE"
  fi

  echo "✅ API key configured successfully!"
  echo ""
  echo "💡 Next steps:"
  echo "   /mp-search <keyword>  - Search for extensions"
  echo "   /mp-install <name>    - Install an extension"
fi
```

### 5. Interactive setup (no arguments)

```bash
if [ -z "$API_KEY" ] && [ "$SHOW_CONFIG" = false ]; then
  echo "🔧 Claude Marketplace Configuration"
  echo ""
  echo "Usage:"
  echo "  /mp-config --api-key YOUR_API_KEY   Set API key"
  echo "  /mp-config --show                   Show current config"
  echo ""
  echo "Get your API key at: https://claude-mp.com/api-keys"
fi
```

## Example

```
/mp-config --api-key mp_live_abc123def456
/mp-config --show
```
