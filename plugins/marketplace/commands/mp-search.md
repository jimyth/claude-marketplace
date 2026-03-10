# /mp-search - Search Extensions

Search for extensions in the marketplace.

## Arguments

- `$ARGUMENTS`: Search keywords (supports multiple, space-separated)

## Steps

### 1. Parse arguments

```bash
KEYWORDS="$ARGUMENTS"
```

### 2. Get configuration

```bash
CONFIG_FILE="$HOME/.claude/marketplace/config.json"
SERVER="https://raw.githubusercontent.com/jimyth/claude-marketplace/main"

if [ -f "$CONFIG_FILE" ]; then
  SERVER=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('server', '$SERVER'))")
fi

INDEX_URL="$SERVER/index.yaml"
CACHE_FILE="$HOME/.claude/marketplace/index-cache.yaml"
```

### 3. Fetch index (with cache)

```bash
# Check cache (24h TTL)
FETCH_INDEX=true
if [ -f "$CACHE_FILE" ]; then
  CACHE_AGE=$(( $(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || echo 0) ))
  if [ $CACHE_AGE -lt 86400 ]; then
    FETCH_INDEX=false
  fi
fi

if [ "$FETCH_INDEX" = true ]; then
  echo "🔄 Fetching marketplace index..."
  mkdir -p "$(dirname "$CACHE_FILE")"
  curl -sL "$INDEX_URL" -o "$CACHE_FILE"
fi
```

### 4. Search and display

```bash
echo "🔍 Searching: $KEYWORDS"
echo ""

python3 << 'EOF'
import yaml
import sys
import os

keywords = os.environ.get('KEYWORDS', '').lower().split()
cache_file = os.path.expanduser("~/.claude/marketplace/index-cache.yaml")

try:
    with open(cache_file, 'r') as f:
        index = yaml.safe_load(f)

    results = []
    for skill in index.get('skills', []):
        # Search in name, description, tags
        text = ' '.join([
            skill.get('name', ''),
            skill.get('description', ''),
            skill.get('author', ''),
            ' '.join(skill.get('tags', []))
        ]).lower()

        # Match any keyword
        if not keywords or any(kw in text for kw in keywords):
            results.append(skill)

    if not results:
        print("No extensions found.")
        print("")
        print("💡 Try different keywords")
    else:
        print(f"Found {len(results)} extension(s):")
        print("")
        for ext in results:
            print(f"  📦 {ext['id']}")
            print(f"     {ext['name']} v{ext.get('version', '1.0.0')}")
            print(f"     {ext.get('description', 'No description')}")
            print(f"     Author: {ext.get('author', 'Unknown')}")
            if ext.get('tags'):
                print(f"     Tags: {', '.join(ext['tags'])}")
            print("")

        print("───────────────────────────────────────")
        print("💡 Install: /mp-install <id>")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
EOF
```

## Example

```
/mp-search telegram    # Search by keyword
/mp-search python bot  # Multiple keywords
/mp-search             # List all
```
