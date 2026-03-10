# /mp-install - Install Skill

Install a skill from the marketplace to `~/.claude/commands/`.

## Arguments

- `$ARGUMENTS`: Skill ID to install (required)

## Execute

Run this single command to install a skill:

```bash
EXT_ID="${ARGUMENTS:-}"

if [ -z "$EXT_ID" ]; then
  echo "❌ Please specify a skill ID"
  echo "Usage: /jimyth-skills:mp-install <id>"
  echo ""
  echo "Search for skills: /jimyth-skills:mp-search <keyword>"
  exit 1
fi

SERVER="https://raw.githubusercontent.com/jimyth/claude-marketplace/main"
INDEX_URL="$SERVER/index.yaml"
CACHE_FILE="$HOME/.claude/marketplace/index-cache.yaml"
COMMANDS_DIR="$HOME/.claude/commands"

# Ensure directories exist
mkdir -p "$(dirname "$CACHE_FILE")"
mkdir -p "$COMMANDS_DIR"

# Fetch index if not cached
if [ ! -f "$CACHE_FILE" ]; then
  echo "🔄 Fetching marketplace index..."
  curl -sL "$INDEX_URL" -o "$CACHE_FILE" || {
    echo "❌ Failed to fetch index"
    exit 1
  }
fi

# Get skill info and download
echo "📥 Installing: $EXT_ID"

python3 << SCRIPT
import yaml
import os
import urllib.request

cache_file = os.path.expanduser("~/.claude/marketplace/index-cache.yaml")
server = os.environ.get('SERVER', '')
ext_id = os.environ.get('EXT_ID', '')
commands_dir = os.environ.get('COMMANDS_DIR', '')

try:
    with open(cache_file, 'r') as f:
        index = yaml.safe_load(f)

    # Find skill
    skill = None
    for s in index.get('skills', []):
        if s['id'] == ext_id:
            skill = s
            break

    if not skill:
        print(f"❌ Skill not found: {ext_id}")
        exit(1)

    skill_path = skill['path']
    skill_name = skill['name']
    skill_version = skill.get('version', '1.0.0')

    # Download SKILL.md to commands directory
    skill_md_url = f"{server}/{skill_path}/SKILL.md"
    dest_file = os.path.join(commands_dir, f"{ext_id}.md")

    print(f"📦 Downloading {skill_name} v{skill_version}...")
    print(f"   From: {skill_md_url}")

    try:
        urllib.request.urlretrieve(skill_md_url, dest_file)
        print(f"   ✅ Installed to: {dest_file}")
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        exit(1)

    # Update installation cache
    import json
    from datetime import datetime

    install_cache_file = os.path.expanduser("~/.claude/marketplace/installed.json")
    install_cache = {"installed": []}

    if os.path.exists(install_cache_file):
        with open(install_cache_file, 'r') as f:
            install_cache = json.load(f)

    # Remove old entry if exists
    install_cache['installed'] = [i for i in install_cache['installed'] if i['id'] != ext_id]

    # Add new entry
    install_cache['installed'].append({
        "id": ext_id,
        "name": skill_name,
        "version": skill_version,
        "installedAt": datetime.now().isoformat()[:10]
    })

    with open(install_cache_file, 'w') as f:
        json.dump(install_cache, f, indent=2)

    print("")
    print("✅ Installation complete!")
    print(f"💡 Use: /{ext_id}")

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
SCRIPT
```

## Example

```
/jimyth-skills:mp-install tgbot
/tgbot my-bot
```
