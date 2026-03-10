# /mp-search - Search Skills

Search for skills in the marketplace.

## Arguments

- `$ARGUMENTS`: Search keywords (optional, lists all if empty)

## Execute

Run this single command to search skills:

```bash
KEYWORDS="${ARGUMENTS:-}"
SERVER="https://raw.githubusercontent.com/jimyth/claude-marketplace/main"
INDEX_URL="$SERVER/index.yaml"
CACHE_FILE="$HOME/.claude/marketplace/index-cache.yaml"

# Ensure cache directory exists
mkdir -p "$(dirname "$CACHE_FILE")"

# Fetch index if cache is missing or older than 24 hours
FETCH_INDEX=true
if [ -f "$CACHE_FILE" ]; then
  CACHE_AGE=$(( $(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0) ))
  if [ "$CACHE_AGE" -lt 86400 ]; then
    FETCH_INDEX=false
  fi
fi

if [ "$FETCH_INDEX" = true ]; then
  echo "🔄 Fetching marketplace index..."
  curl -sL "$INDEX_URL" -o "$CACHE_FILE" || {
    echo "❌ Failed to fetch index from $INDEX_URL"
    exit 1
  }
fi

# Search and display results
echo "🔍 Searching: ${KEYWORDS:-<all>}"
echo ""

python3 << 'SCRIPT'
import yaml
import os

keywords = os.environ.get('KEYWORDS', '').lower().split()
cache_file = os.path.expanduser("~/.claude/marketplace/index-cache.yaml")

try:
    with open(cache_file, 'r') as f:
        index = yaml.safe_load(f)

    results = []
    for skill in index.get('skills', []):
        text = ' '.join([
            skill.get('name', ''),
            skill.get('description', ''),
            skill.get('author', ''),
            ' '.join(skill.get('tags', []))
        ]).lower()

        if not keywords or any(kw in text for kw in keywords):
            results.append(skill)

    if not results:
        print("No skills found.")
        print("")
        print("💡 Try different keywords")
    else:
        print(f"Found {len(results)} skill(s):")
        print("")
        for skill in results:
            print(f"  📦 {skill['id']}")
            print(f"     {skill['name']} v{skill.get('version', '1.0.0')}")
            print(f"     {skill.get('description', 'No description')}")
            print(f"     Author: {skill.get('author', 'Unknown')}")
            if skill.get('tags'):
                print(f"     Tags: {', '.join(skill['tags'])}")
            print("")

        print("───────────────────────────────────────")
        print("💡 Install: /jimyth-skills:mp-install <id>")

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
SCRIPT
```

## Example

```
/jimyth-skills:mp-search telegram
/jimyth-skills:mp-search python bot
/jimyth-skills:mp-search
```
