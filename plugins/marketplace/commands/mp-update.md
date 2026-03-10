# /mp-update - Update Skills

Check for and install updates for installed skills.

## Arguments

- `$ARGUMENTS`: Skill ID (optional, updates all if not specified)

## Execute

Run this single command to update skills:

```bash
EXT_ID="${ARGUMENTS:-}"
SERVER="https://raw.githubusercontent.com/jimyth/claude-marketplace/main"
INDEX_URL="$SERVER/index.yaml"
CACHE_FILE="$HOME/.claude/marketplace/index-cache.yaml"
INSTALL_CACHE="$HOME/.claude/marketplace/installed.json"
COMMANDS_DIR="$HOME/.claude/commands"

# Check if any skills installed
if [ ! -f "$INSTALL_CACHE" ]; then
  echo "📋 No skills installed yet."
  echo ""
  echo "💡 Search and install:"
  echo "   /jimyth-skills:mp-search <keyword>"
  echo "   /jimyth-skills:mp-install <id>"
  exit 0
fi

# Force refresh index
echo "🔄 Fetching latest index..."
mkdir -p "$(dirname "$CACHE_FILE")"
curl -sL "$INDEX_URL" -o "$CACHE_FILE" || {
  echo "❌ Failed to fetch index"
  exit 1
}

echo "🔍 Checking for updates..."
echo ""

python3 << 'SCRIPT'
import yaml
import json
import os
import urllib.request

ext_id = os.environ.get('EXT_ID', '')
cache_file = os.environ.expanduser("~/.claude/marketplace/index-cache.yaml")
install_cache_file = os.path.expanduser("~/.claude/marketplace/installed.json")
commands_dir = os.environ.expanduser("~/.claude/commands")
server = os.environ.get('SERVER', '')

try:
    # Load index
    with open(cache_file, 'r') as f:
        index = yaml.safe_load(f)

    # Load installed skills
    with open(install_cache_file, 'r') as f:
        installed = json.load(f).get('installed', [])

    # Build skill lookup
    skills_by_id = {s['id']: s for s in index.get('skills', [])}

    updates = []
    for skill in installed:
        sid = skill['id']
        if ext_id and sid != ext_id:
            continue

        if sid in skills_by_id:
            remote = skills_by_id[sid]
            local_version = skill.get('version', '0.0.0')
            remote_version = remote.get('version', '1.0.0')

            if remote_version != local_version:
                updates.append({
                    'id': sid,
                    'name': remote.get('name', sid),
                    'local': local_version,
                    'remote': remote_version,
                    'path': remote['path']
                })

    if not updates:
        print("✅ All skills are up to date!")
        exit(0)

    print(f"📦 Updates available: {len(updates)}")
    print("")

    for u in updates:
        print(f"  {u['id']}: {u['local']} → {u['remote']}")

    print("")
    print("Updating...")

    # Perform updates
    for u in updates:
        skill_md_url = f"{server}/{u['path']}/SKILL.md"
        dest_file = os.path.join(commands_dir, f"{u['id']}.md")

        print(f"\n  📥 {u['id']}...")

        try:
            urllib.request.urlretrieve(skill_md_url, dest_file)
            print(f"     ✅ Updated to v{u['remote']}")

            # Update install cache
            for skill in installed:
                if skill['id'] == u['id']:
                    skill['version'] = u['remote']
                    break

        except Exception as e:
            print(f"     ❌ Failed: {e}")

    # Save updated cache
    with open(install_cache_file, 'w') as f:
        json.dump({'installed': installed}, f, indent=2)

    print("")
    print("✅ Update complete!")

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
SCRIPT
```

## Example

```
/jimyth-skills:mp-update           # Update all
/jimyth-skills:mp-update tgbot     # Update specific skill
```
