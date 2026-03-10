# /mp-update - Update Extensions

Check for and install updates for extensions.

## Arguments

- `$ARGUMENTS`: Extension ID (optional, updates all if not specified)
- `--all`: Update all installed extensions

## Steps

### 1. Parse arguments

```bash
EXT_ID=""
UPDATE_ALL=false

for arg in $ARGUMENTS; do
  case "$arg" in
    --all)
      UPDATE_ALL=true
      ;;
    *)
      EXT_ID="$arg"
      ;;
  esac
done
```

### 2. Get configuration

```bash
CONFIG_FILE="$HOME/.claude/marketplace/config.json"
CACHE_FILE="$HOME/.claude/marketplace/cache.json"
SERVER="https://api.claude-mp.com"

if [ -f "$CONFIG_FILE" ]; then
  SERVER=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('server', '$SERVER'))")
fi
```

### 3. Get installed extensions

```bash
if [ ! -f "$CACHE_FILE" ]; then
  echo "📋 No extensions installed."
  exit 0
fi

INSTALLED=$(python3 -c "
import json
with open('$CACHE_FILE') as f:
    cache = json.load(f)
for ext in cache.get('installed', []):
    print(f\"{ext['id']}|{ext.get('version', '0.0.0')}\")
")

if [ -z "$INSTALLED" ]; then
  echo "📋 No extensions installed."
  exit 0
fi
```

### 4. Check for updates

```bash
echo "🔍 Checking for updates..."
echo ""

UPDATES_AVAILABLE=()

while IFS='|' read -r ID LOCAL_VERSION; do
  # Skip if specific extension requested and not this one
  if [ -n "$EXT_ID" ] && [ "$ID" != "$EXT_ID" ]; then
    continue
  fi

  # Get remote version
  REMOTE_INFO=$(curl -s "$SERVER/extensions/$ID" 2>/dev/null)
  REMOTE_VERSION=$(echo "$REMOTE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('version',''))" 2>/dev/null)

  if [ -n "$REMOTE_VERSION" ] && [ "$REMOTE_VERSION" != "$LOCAL_VERSION" ]; then
    UPDATES_AVAILABLE+=("$ID|$LOCAL_VERSION|$REMOTE_VERSION")
  fi
done <<< "$INSTALLED"
```

### 5. Display and confirm updates

```bash
if [ ${#UPDATES_AVAILABLE[@]} -eq 0 ]; then
  echo "✅ All extensions are up to date!"
  exit 0
fi

echo "📦 Updates available:"
echo ""

for update in "${UPDATES_AVAILABLE[@]}"; do
  IFS='|' read -r ID LOCAL REMOTE <<< "$update"
  echo "  $ID: $LOCAL → $REMOTE"
done

echo ""
read -p "Update ${#UPDATES_AVAILABLE[@]} extension(s)? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Cancelled."
  exit 0
fi
```

### 6. Install updates

```bash
for update in "${UPDATES_AVAILABLE[@]}"; do
  IFS='|' read -r ID LOCAL REMOTE <<< "$update"
  echo ""
  echo "📥 Updating $ID..."

  # Reinstall extension
  rm -rf "$HOME/.claude/marketplace/extensions/$ID"

  TEMP_ZIP="/tmp/$ID.zip"
  curl -s -o "$TEMP_ZIP" "$SERVER/extensions/$ID/download"

  mkdir -p "$HOME/.claude/marketplace/extensions/$ID"
  cd "$HOME/.claude/marketplace/extensions/$ID"
  unzip -q "$TEMP_ZIP"
  rm "$TEMP_ZIP"

  # Update cache
  python3 -c "
import json
with open('$CACHE_FILE', 'r') as f:
    cache = json.load(f)
for ext in cache['installed']:
    if ext['id'] == '$ID':
        ext['version'] = '$REMOTE'
with open('$CACHE_FILE', 'w') as f:
    json.dump(cache, f, indent=2)
"

  echo "  ✅ Updated to v$REMOTE"
done

echo ""
echo "✅ All updates installed!"
```

## Example

```
/mp-update           # Check and update all
/mp-update tgbot     # Update specific extension
```
