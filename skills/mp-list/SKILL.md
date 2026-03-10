# /mp-list - List Installed Extensions

List all installed extensions.

## Steps

### 1. Check cache file

```bash
CACHE_FILE="$HOME/.claude/marketplace/cache.json"

if [ ! -f "$CACHE_FILE" ]; then
  echo "📋 No extensions installed yet."
  echo ""
  echo "💡 Search for extensions: /mp-search <keyword>"
  echo "   Install an extension: /mp-install <id>"
  exit 0
fi
```

### 2. Display installed extensions

```bash
echo "📋 Installed Extensions:"
echo ""

python3 << 'EOF'
import json
import os
from datetime import datetime

cache_file = os.environ.get('CACHE_FILE', os.path.expanduser('~/.claude/marketplace/cache.json'))

try:
    with open(cache_file, 'r') as f:
        cache = json.load(f)

    installed = cache.get('installed', [])

    if not installed:
        print("No extensions installed.")
    else:
        for ext in installed:
            source_tag = f"[{ext.get('source', 'unknown')}]"
            installed_date = ext.get('installedAt', '')
            if installed_date:
                try:
                    dt = datetime.fromisoformat(installed_date)
                    installed_date = dt.strftime('%Y-%m-%d')
                except:
                    pass

            print(f"  📦 {ext['id']} {source_tag}")
            print(f"     Version: {ext.get('version', 'unknown')}")
            print(f"     Installed: {installed_date}")
            print(f"     Path: {ext.get('path', 'N/A')}")
            print("")

        print("───────────────────────────────────────")
        print(f"Total: {len(installed)} extension(s)")
        print("")
        print("💡 Update all: /mp-update --all")
        print("   Remove: /mp-clean <id>")

except Exception as e:
    print(f"Error reading cache: {e}")
EOF
```

## Example

```
/mp-list    # List all installed extensions
```
