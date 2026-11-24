#!/usr/bin/env bash
# Agent Plugins v1.0.0 and Agent Skills Validator for lustrous-lit
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

info()  { echo -e "${BLUE}==>${NC} $1"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; WARNINGS=$((WARNINGS + 1)); }
err()   { echo -e "  ${RED}✖${NC} $1"; ERRORS=$((ERRORS + 1)); }

info "1. Validating repository layout, symlinks, and .gitignore"
if [ ! -d "plugins" ]; then
  err "Missing top-level 'plugins/' directory."
else
  ok "Found 'plugins/' directory."
fi

if [ -f ".gitignore" ] && grep -q "^\.serena/" .gitignore && grep -q "^\.antigravitycli/" .gitignore; then
  ok ".gitignore contains .serena/ and .antigravitycli/"
else
  warn ".gitignore is missing .serena/ or .antigravitycli/ exclusions"
fi

ABS_ROOT="$(pwd -P)"
while IFS= read -r symlink; do
  [ -n "$symlink" ] || continue
  if git check-ignore -q "$symlink" 2>/dev/null; then
    continue
  fi
  target="$(readlink "$symlink")"
  sym_dir="$(dirname "$symlink")"
  real_target="$(python3 -c "import os, sys; print(os.path.realpath(os.path.join(sys.argv[1], sys.argv[2])))" "$sym_dir" "$target" 2>/dev/null || true)"
  if [ -z "$real_target" ] || { [[ "$real_target" != "$ABS_ROOT" ]] && [[ "$real_target" != "$ABS_ROOT"/* ]]; }; then
    err "Symlink '$symlink' escapes repository root ($target)"
  fi
done < <(find plugins -type l 2>/dev/null || true)

info "2. Validating Plugin Package Manifests (plugin.json)"
for plugin_dir in plugins/*; do
  [ -d "$plugin_dir" ] || continue
  plugin_name="$(basename "$plugin_dir")"
  manifest="$plugin_dir/plugin.json"

  if [ ! -f "$manifest" ]; then
    err "Plugin '$plugin_name' missing plugin.json"
    continue
  fi

  if ! python3 -m json.tool "$manifest" >/dev/null 2>&1; then
    err "Plugin '$plugin_name' plugin.json is invalid JSON"
    continue
  fi

  schema_val="$(python3 -c "import json; print(json.load(open('$manifest')).get('\$schema',''))")"
  name_val="$(python3 -c "import json; print(json.load(open('$manifest')).get('name',''))")"

  if [ "$schema_val" != "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json" ]; then
    err "Plugin '$plugin_name' $manifest has invalid or missing \$schema: '$schema_val'"
  else
    ok "Plugin '$plugin_name' \$schema matches Agent Plugins 1.0.0"
  fi

  if [ "$name_val" != "$plugin_name" ]; then
    err "Plugin '$plugin_name' name in plugin.json ('$name_val') does not match folder name '$plugin_name'"
  else
    ok "Plugin '$plugin_name' manifest name matches directory name"
  fi
done

info "3. Validating Agent Skills (SKILL.md)"
for skill_md in plugins/*/skills/*/SKILL.md; do
  [ -f "$skill_md" ] || continue
  skill_dir="$(dirname "$skill_md")"
  expected_name="$(basename "$skill_dir")"

  read_res="$(python3 -c "
import json, sys, re
content = open('$skill_md', 'r', encoding='utf-8').read()
if not content.startswith('---'):
    print(json.dumps({'error': 'Missing YAML frontmatter delimiter at start'}))
    sys.exit(0)
parts = content.split('---', 2)
if len(parts) < 3:
    print(json.dumps({'error': 'Malformed YAML frontmatter delimiters'}))
    sys.exit(0)
fm = parts[1]
def get_val(key):
    m = re.search(r'^' + key + r':\s*(.*)$', fm, re.MULTILINE)
    if not m: return ''
    v = m.group(1).strip()
    if (v.startswith('\"') and v.endswith('\"')) or (v.startswith(\"'\") and v.endswith(\"'\")):
        v = v[1:-1]
    return v
print(json.dumps({'name': get_val('name'), 'desc_len': len(get_val('description')), 'license': get_val('license')}))
")"

  has_err="$(echo "$read_res" | python3 -c "import json,sys; print(json.load(sys.stdin).get('error',''))")"
  if [ -n "$has_err" ]; then
    err "Skill '$expected_name' at '$skill_md': $has_err"
    continue
  fi

  name_in_fm="$(echo "$read_res" | python3 -c "import json,sys; print(json.load(sys.stdin).get('name',''))")"
  desc_len="$(echo "$read_res" | python3 -c "import json,sys; print(json.load(sys.stdin).get('desc_len',0))")"
  lic_in_fm="$(echo "$read_res" | python3 -c "import json,sys; print(json.load(sys.stdin).get('license',''))")"

  if [ "$name_in_fm" != "$expected_name" ]; then
    err "Skill '$expected_name' frontmatter name ('$name_in_fm') does not match directory '$expected_name'"
  else
    ok "Skill '$expected_name' frontmatter name matches directory"
  fi

  if [ "$desc_len" -eq 0 ] || [ "$desc_len" -gt 1024 ]; then
    err "Skill '$expected_name' invalid description length ($desc_len chars)"
  else
    ok "Skill '$expected_name' description length OK ($desc_len chars)"
  fi

  if [ -z "$lic_in_fm" ]; then
    warn "Skill '$expected_name' missing 'license' in frontmatter"
  fi

  if [ -d "$skill_dir/scripts" ]; then
    for script in "$skill_dir/scripts"/*; do
      [ -f "$script" ] || continue
      if [ ! -x "$script" ]; then
        err "Script '$script' in skill '$expected_name' is NOT executable (+x)"
      else
        ok "Script '$(basename "$script")' in '$expected_name' is executable"
      fi
    done
  fi
done

info "4. Validating Marketplace Manifest (.claude-plugin/marketplace.json)"
if [ -f ".claude-plugin/marketplace.json" ]; then
  python3 -c '
import json, sys
mp = json.load(open(".claude-plugin/marketplace.json"))
for p in mp.get("plugins", []):
    src = p["source"]
    manifest = json.load(open(src + "/plugin.json"))
    if p.get("description") != manifest.get("description"):
        print(f"Description mismatch between marketplace.json and {src}/plugin.json", file=sys.stderr)
        sys.exit(1)
' && ok ".claude-plugin/marketplace.json is valid and descriptions match plugin.json" || err "Marketplace manifest validation failed"
else
  err "Missing .claude-plugin/marketplace.json"
fi

echo
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✓ All plugin and skill validations passed!${NC}"
  exit 0
else
  echo -e "${RED}✖ Validation failed with $ERRORS error(s).${NC}"
  exit 1
fi
