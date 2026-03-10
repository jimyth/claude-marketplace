# /mp-list - List Installed Skills

List all skills installed from the marketplace.

## Arguments

None

## Execute

Run this single command to list installed skills:

```bash
INSTALL_CACHE="$HOME/.claude/marketplace/installed.json"

if [ ! -f "$INSTALL_CACHE" ]; then
  echo "📋 No skills installed yet."
  echo ""
  echo "💡 Search and install:"
  echo "   /jimyth-skills:mp-search <keyword>"
  echo "   /jimyth-skills:mp-install <id>"
  exit 0
fi

echo "📋 Installed Skills:"
echo ""

python3 << 'SCRIPT'
import json
import os

cache_file = os.path.expanduser("~/.claude/marketplace/installed.json")

try:
    with open(cache_file, 'r') as f:
        cache = json.load(f)

    installed = cache.get('installed', [])

    if not installed:
        print("No skills installed.")
    else:
        for skill in installed:
            print(f"  📦 {skill['id']}")
            print(f"     {skill.get('name', 'Unknown')} v{skill.get('version', '1.0.0')}")
            print(f"     Installed: {skill.get('installedAt', 'Unknown')}")
            print("")

        print("───────────────────────────────────────")
        print(f"Total: {len(installed)} skill(s)")
        print("")
        print("💡 Update: /jimyth-skills:mp-update")

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
SCRIPT
```

## Example

```
/jimyth-skills:mp-list
```
