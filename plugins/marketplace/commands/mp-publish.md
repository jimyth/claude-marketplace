# /mp-publish - Publish Skill

Publish your skill to the marketplace.

## Arguments

- `$ARGUMENTS`: Path to skill directory (defaults to current directory)
- `--bump <level>`: Bump version (patch, minor, major)

## Execute

Run this single command to publish a skill:

```bash
SKILL_PATH="${ARGUMENTS:-.}"
BUMP_LEVEL=""

# Parse arguments
for arg in $SKILL_PATH; do
  case "$arg" in
    --bump=*)
      BUMP_LEVEL="${arg#*=}"
      SKILL_PATH="."
      ;;
    --bump)
      # Next arg is level (skip for now)
      ;;
    *)
      if [ -z "$SKILL_PATH" ] || [ "$SKILL_PATH" = "." ]; then
        SKILL_PATH="$arg"
      fi
      ;;
  esac
done

# Resolve to absolute path
SKILL_PATH="$(cd "$SKILL_PATH" 2>/dev/null && pwd)" || {
  echo "❌ Directory not found: $SKILL_PATH"
  exit 1
}

MANIFEST_FILE="$SKILL_PATH/manifest.yaml"
SKILL_FILE="$SKILL_PATH/SKILL.md"

# Validate manifest
if [ ! -f "$MANIFEST_FILE" ]; then
  echo "❌ No manifest.yaml found in $SKILL_PATH"
  echo ""
  echo "Create a manifest.yaml with:"
  echo "  id: my-skill"
  echo "  name: My Skill"
  echo "  version: 1.0.0"
  echo "  author: your-name"
  echo "  description: Description of your skill"
  echo "  tags:"
  echo "    - tag1"
  echo "    - tag2"
  exit 1
fi

# Validate SKILL.md
if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ No SKILL.md found in $SKILL_PATH"
  echo ""
  echo "Create a SKILL.md with your skill instructions."
  exit 1
fi

echo "📋 Validating skill..."
echo ""

# Validate and show manifest
python3 << SCRIPT
import yaml
import sys
import os

manifest_path = os.environ.get('MANIFEST_FILE', '')
bump_level = os.environ.get('BUMP_LEVEL', '')
skill_path = os.environ.get('SKILL_PATH', '')

try:
    with open(manifest_path, 'r') as f:
        manifest = yaml.safe_load(f)

    required = ['id', 'name', 'version', 'author', 'description']
    missing = [k for k in required if not manifest.get(k)]

    if missing:
        print(f"❌ Missing required fields: {', '.join(missing)}")
        sys.exit(1)

    skill_id = manifest['id']

    # Validate ID format
    if not skill_id.replace('-', '').replace('_', '').isalnum():
        print(f"❌ Invalid skill ID: {skill_id}")
        print("   Use only letters, numbers, hyphens, and underscores")
        sys.exit(1)

    print(f"  ID: {skill_id}")
    print(f"  Name: {manifest['name']}")
    print(f"  Version: {manifest['version']}")
    print(f"  Author: {manifest['author']}")
    print(f"  Description: {manifest['description']}")

    if manifest.get('tags'):
        print(f"  Tags: {', '.join(manifest['tags'])}")

    # Bump version if requested
    if bump_level:
        version = manifest['version']
        major, minor, patch = map(int, version.split('.'))

        if bump_level == 'major':
            major += 1
            minor = 0
            patch = 0
        elif bump_level == 'minor':
            minor += 1
            patch = 0
        else:  # patch
            patch += 1

        new_version = f"{major}.{minor}.{patch}"
        manifest['version'] = new_version

        with open(manifest_path, 'w') as f:
            yaml.dump(manifest, f, default_flow_style=False, sort_keys=False)

        print(f"\n📦 Version bumped: {version} → {new_version}")

    print("\n✅ Skill valid!")

    # Save skill_id for next step
    with open('/tmp/mp_publish_id.txt', 'w') as f:
        f.write(skill_id)

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
SCRIPT

if [ $? -ne 0 ]; then
  exit 1
fi

# Read skill ID
SKILL_ID=$(cat /tmp/mp_publish_id.txt 2>/dev/null || echo "")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Publishing Guide"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To publish your skill to the marketplace:"
echo ""
echo "1. Fork the repository:"
echo "   https://github.com/jimyth/claude-marketplace"
echo ""
echo "2. Copy your skill to the skills/ directory:"
echo "   cp -r \"$SKILL_PATH\" skills/$SKILL_ID"
echo ""
echo "3. Update index.yaml to include your skill:"
echo ""
echo "   - id: $SKILL_ID"
echo "     name: <name from manifest>"
echo "     version: <version from manifest>"
echo "     description: <description from manifest>"
echo "     author: <author from manifest>"
echo "     path: skills/$SKILL_ID"
echo "     files:"
echo "       - manifest.yaml"
echo "       - SKILL.md"
echo "     tags:"
echo "       - <tag1>"
echo "       - <tag2>"
echo ""
echo "4. Submit a Pull Request"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Example

```
/jimyth-skills:mp-publish                    # Publish current directory
/jimyth-skills:mp-publish ./my-skill         # Publish specific directory
/jimyth-skills:mp-publish --bump patch       # Bump version and show guide
```
