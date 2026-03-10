# /mp-search - Search Extensions

Search for extensions in the marketplace.

## Arguments

- `$ARGUMENTS`: Search keywords (supports multiple, space-separated)
- `--scope=<scope>`: Search scope (all, personal, public)

## Steps

### 1. Parse arguments

```bash
KEYWORDS=""
SCOPE="all"

for arg in $ARGUMENTS; do
  case "$arg" in
    --scope=*)
      SCOPE="${arg#*=}"
      ;;
    *)
      KEYWORDS="$KEYWORDS $arg"
      ;;
  esac
done

KEYWORDS=$(echo "$KEYWORDS" | xargs)  # Trim whitespace
```

### 2. Get configuration

```bash
CONFIG_FILE="$HOME/.claude/marketplace/config.json"
SERVER="https://raw.githubusercontent.com/jimyth/claude-marketplace/main"

if [ -f "$CONFIG_FILE" ]; then
  SERVER=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('server', '$SERVER'))")
fi
```

### 3. Build search URL

```bash
if [ -z "$KEYWORDS" ]; then
  URL="$SERVER/search?scope=$SCOPE"
else
  ENCODED_KEYWORDS=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$KEYWORDS'))")
  URL="$SERVER/search?q=$ENCODED_KEYWORDS&scope=$SCOPE"
fi
```

### 4. Execute search

```bash
echo "🔍 Searching: $KEYWORDS"
echo "   Scope: $SCOPE"
echo ""

RESPONSE=$(curl -s "$URL")

if [ -z "$RESPONSE" ]; then
  echo "❌ Failed to connect to marketplace. Check your network."
  exit 1
fi
```

### 5. Display results

```bash
echo "$RESPONSE" | python3 << 'EOF'
import sys
import json

try:
    data = json.load(sys.stdin)
    results = data.get('results', [])

    if not results:
        print("No extensions found.")
        print("")
        print("💡 Try different keywords or check /mp-search --scope=all")
    else:
        print(f"Found {len(results)} extension(s):")
        print("")
        for ext in results:
            source_tag = f"[{ext.get('source', 'public')}]"
            print(f"  📦 {ext['id']} {source_tag}")
            print(f"     {ext['name']} v{ext.get('version', '1.0.0')}")
            print(f"     {ext.get('description', 'No description')}")
            print(f"     Author: {ext.get('author', 'Unknown')}")
            if ext.get('tags'):
                print(f"     Tags: {', '.join(ext['tags'])}")
            print("")

        print("───────────────────────────────────────")
        print("💡 Install: /mp-install <id>")
        print("   Example: /mp-install tgbot")
except Exception as e:
    print(f"Error parsing response: {e}")
EOF
```

## Example

```
/mp-search telegram bot     # Search with multiple keywords
/mp-search python --scope=personal  # Search only personal extensions
/mp-search                  # List all extensions
```
