# /mp-config - Configure Marketplace

Configure the marketplace settings.

## Arguments

- `--server <url>`: Set custom server URL
- `--api-key <key>`: Set API key for publishing
- `--show`: Show current configuration
- `--reset`: Reset to default configuration

## Execute

Run this single command to configure marketplace:

```bash
CONFIG_FILE="$HOME/.claude/marketplace/config.json"
ARGS="${ARGUMENTS:-}"

# Ensure config directory exists
mkdir -p "$(dirname "$CONFIG_FILE")"

# Parse arguments
SHOW_CONFIG=false
RESET_CONFIG=false
SERVER_URL=""
API_KEY=""

for arg in $ARGS; do
  case "$arg" in
    --show)
      SHOW_CONFIG=true
      ;;
    --reset)
      RESET_CONFIG=true
      ;;
    --server=*)
      SERVER_URL="${arg#*=}"
      ;;
    --api-key=*)
      API_KEY="${arg#*=}"
      ;;
  esac
done

# Handle --show
if [ "$SHOW_CONFIG" = true ]; then
  if [ -f "$CONFIG_FILE" ]; then
    echo "📋 Current Configuration:"
    echo ""
    cat "$CONFIG_FILE"
  else
    echo "📋 No configuration file found."
    echo "Using defaults:"
    echo "  Server: https://raw.githubusercontent.com/jimyth/claude-marketplace/main"
  fi
  exit 0
fi

# Handle --reset
if [ "$RESET_CONFIG" = true ]; then
  cat > "$CONFIG_FILE" << 'EOF'
{
  "server": "https://raw.githubusercontent.com/jimyth/claude-marketplace/main"
}
EOF
  echo "✅ Configuration reset to defaults"
  cat "$CONFIG_FILE"
  exit 0
fi

# Read existing config or create new
if [ -f "$CONFIG_FILE" ]; then
  CONFIG=$(cat "$CONFIG_FILE")
else
  CONFIG='{"server": "https://raw.githubusercontent.com/jimyth/claude-marketplace/main"}'
fi

# Update config with new values
export CONFIG_FILE CONFIG SERVER_URL API_KEY

python3 << 'SCRIPT'
import json
import os

config_file = os.environ.get('CONFIG_FILE', '')
config_str = os.environ.get('CONFIG', '{}')
server_url = os.environ.get('SERVER_URL', '')
api_key = os.environ.get('API_KEY', '')

try:
    config = json.loads(config_str)

    if server_url:
        config['server'] = server_url
        print(f"✅ Server set to: {server_url}")

    if api_key:
        config['apiKey'] = api_key
        print(f"✅ API key configured")

    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)

    if not server_url and not api_key:
        print("📋 Current configuration:")
        print(json.dumps(config, indent=2))

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
SCRIPT
```

## Example

```
/jimyth-skills:mp-config --show
/jimyth-skills:mp-config --reset
/jimyth-skills:mp-config --api-key your_key_here
```
