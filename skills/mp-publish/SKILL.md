# /mp-publish - Publish Extension

Publish an extension to the marketplace.

## Arguments

- `$ARGUMENTS`: Extension ID or path (defaults to current directory)
- `--bump <level>`: Bump version (patch, minor, major)

## Steps

### 1. Parse arguments

```bash
TARGET_PATH="."
BUMP_LEVEL=""

for arg in $ARGUMENTS; do
  case "$arg" in
    --bump=*)
      BUMP_LEVEL="${arg#*=}"
      ;;
    --bump)
      # Next argument is the level
      ;;
    *)
      if [ -z "$TARGET_PATH" ] || [ "$TARGET_PATH" = "." ]; then
        TARGET_PATH="$arg"
      fi
      ;;
  esac
done
```

### 2. Validate manifest

```bash
MANIFEST_FILE="$TARGET_PATH/manifest.yaml"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "❌ No manifest.yaml found in $TARGET_PATH"
  echo ""
  echo "Create a manifest.yaml with:"
  echo "  id: my-skill"
  echo "  name: My Skill"
  echo "  version: 1.0.0"
  echo "  type: skill"
  echo "  author: your-name"
  echo "  description: Description of your skill"
  exit 1
fi

echo "📋 Validating manifest..."
```

### 3. Read and validate manifest

```bash
MANIFEST=$(python3 << 'EOF'
import yaml
import sys
import os

manifest_path = os.environ.get('MANIFEST_FILE', 'manifest.yaml')

try:
    with open(manifest_path, 'r') as f:
        manifest = yaml.safe_load(f)

    required = ['id', 'name', 'version', 'type', 'author', 'description']
    missing = [k for k in required if not manifest.get(k)]

    if missing:
        print(f"ERROR: Missing required fields: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    if manifest['type'] not in ['skill', 'plugin']:
        print(f"ERROR: Invalid type '{manifest['type']}'. Must be 'skill' or 'plugin'", file=sys.stderr)
        sys.exit(1)

    print(f"ID: {manifest['id']}")
    print(f"Name: {manifest['name']}")
    print(f"Version: {manifest['version']}")
    print(f"Type: {manifest['type']}")

except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
EOF
)

if [ $? -ne 0 ]; then
  exit 1
fi

echo "✅ Manifest valid"
echo ""
```

### 4. Bump version if requested

```bash
if [ -n "$BUMP_LEVEL" ]; then
  NEW_VERSION=$(python3 << EOF
import yaml

with open("$MANIFEST_FILE", 'r') as f:
    manifest = yaml.safe_load(f)

version = manifest['version']
major, minor, patch = map(int, version.split('.'))

if '$BUMP_LEVEL' == 'major':
    major += 1
    minor = 0
    patch = 0
elif '$BUMP_LEVEL' == 'minor':
    minor += 1
    patch = 0
else:  # patch
    patch += 1

new_version = f"{major}.{minor}.{patch}"
manifest['version'] = new_version

with open("$MANIFEST_FILE", 'w') as f:
    yaml.dump(manifest, f, default_flow_style=False)

print(new_version)
EOF
)

  echo "📦 Version bumped to: $NEW_VERSION"
  echo ""
fi
```

### 5. Get API key

```bash
CONFIG_FILE="$HOME/.claude/marketplace/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Not configured. Run: /mp-config --api-key YOUR_KEY"
  exit 1
fi

API_KEY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('apiKey', ''))")

if [ -z "$API_KEY" ]; then
  echo "❌ No API key configured. Run: /mp-config --api-key YOUR_KEY"
  exit 1
fi

SERVER=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('server', 'https://api.claude-mp.com'))")
```

### 6. Package and upload

```bash
echo "📦 Packaging extension..."

# Collect files
FILES_JSON=$(python3 << 'EOF'
import yaml
import json
import os
import base64

with open("manifest.yaml", 'r') as f:
    manifest = yaml.safe_load(f)

files = {'manifest.yaml': open('manifest.yaml').read()}

# Add SKILL.md or PLUGIN.md
if os.path.exists('SKILL.md'):
    files['SKILL.md'] = open('SKILL.md').read()
if os.path.exists('PLUGIN.md'):
    files['PLUGIN.md'] = open('PLUGIN.md').read()

# Add commands
if os.path.exists('commands'):
    for f in os.listdir('commands'):
        if f.endswith('.md'):
            path = os.path.join('commands', f)
            files[f'commands/{f}'] = open(path).read()

# Add scripts
if os.path.exists('scripts'):
    for root, dirs, filenames in os.walk('scripts'):
        for filename in filenames:
            path = os.path.join(root, filename)
            rel_path = os.path.relpath(path, '.')
            files[rel_path] = open(path).read()

print(json.dumps(files))
EOF
)

echo "📤 Uploading to marketplace..."

RESPONSE=$(curl -s -X POST "$SERVER/extensions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$(python3 -c "import yaml; print(yaml.safe_load(open('manifest.yaml'))['id'])")\", \"manifest\": $(python3 -c "import yaml,json; print(json.dumps(yaml.safe_load(open('manifest.yaml'))))"), \"files\": $FILES_JSON}")

echo ""
echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print('✅ Published successfully!')
        print(f\"   Version: {data.get('version', 'unknown')}\")
        print('')
        print('💡 Search for your extension: /mp-search $(python3 -c \"import yaml; print(yaml.safe_load(open('manifest.yaml'))['id'])\")')
    else:
        print(f\"❌ Publish failed: {data.get('error', 'Unknown error')}\")
except Exception as e:
    print(f'Response: {sys.stdin.read()}')
"
```

## Example

```
/mp-publish                    # Publish current directory
/mp-publish ./my-skill         # Publish specific directory
/mp-publish --bump patch       # Bump version and publish
/mp-publish --bump minor       # Minor version bump
```
