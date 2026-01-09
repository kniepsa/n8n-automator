#!/bin/bash
# Quality Batch Check - runs every 5 edits via PostToolUse hook
# Checks code size, TypeScript issues, and code quality patterns

FILE_PATH="$1"
STATE_DIR="$HOME/.claude/quality-state"
FINDINGS_FILE="$STATE_DIR/findings.jsonl"
COUNT_FILE="$STATE_DIR/edit-count"
SESSION_FILE="$STATE_DIR/session-files"

# Exit if no file provided or file doesn't exist
[ -z "$FILE_PATH" ] && exit 0
[ ! -f "$FILE_PATH" ] && exit 0

# Skip non-code files
case "$FILE_PATH" in
  *.md|*.json|*.yaml|*.yml|*.txt|*.log|*.lock|*.css) exit 0 ;;
esac

# Ensure state directory exists
mkdir -p "$STATE_DIR"

# Track files edited this session
echo "$FILE_PATH" >> "$SESSION_FILE"

# Increment edit counter
COUNT=$(($(cat "$COUNT_FILE" 2>/dev/null || echo 0) + 1))
echo "$COUNT" > "$COUNT_FILE"

# Only run full checks every 5 edits
[ $((COUNT % 5)) -ne 0 ] && exit 0

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

add_finding() {
  local severity="$1"
  local type="$2"
  local file="$3"
  local message="$4"
  echo "{\"timestamp\":\"$TIMESTAMP\",\"type\":\"$type\",\"severity\":\"$severity\",\"file\":\"$file\",\"message\":\"$message\"}" >> "$FINDINGS_FILE"
}

# Get unique files edited this session
EDITED_FILES=$(sort -u "$SESSION_FILE" 2>/dev/null | head -20)

for file in $EDITED_FILES; do
  [ ! -f "$file" ] && continue

  # 1. File size check
  LINES=$(wc -l < "$file" 2>/dev/null | tr -d ' ')
  if [ "$LINES" -gt 800 ]; then
    add_finding "critical" "code_size" "$file" "File has $LINES lines (max recommended: 800). Consider splitting."
  elif [ "$LINES" -gt 400 ]; then
    add_finding "high" "code_size" "$file" "File has $LINES lines (recommended: <400). Consider splitting."
  fi

  # 2. TypeScript 'any' usage
  if [[ "$file" == *.ts ]] || [[ "$file" == *.tsx ]] || [[ "$file" == *.svelte ]]; then
    ANY_COUNT=$(grep -c ": any\|as any\|<any>" "$file" 2>/dev/null || echo 0)
    if [ "$ANY_COUNT" -gt 0 ]; then
      add_finding "medium" "typescript" "$file" "'any' type used $ANY_COUNT times. Use 'unknown' + type guards."
    fi
  fi

  # 3. Debug statements
  if grep -qE "console\.(log|debug|info)\(" "$file" 2>/dev/null; then
    DEBUG_COUNT=$(grep -cE "console\.(log|debug|info)\(" "$file" 2>/dev/null || echo 0)
    add_finding "low" "debug_code" "$file" "$DEBUG_COUNT console statements found. Remove before ship."
  fi

  # 4. TODO/FIXME comments
  if grep -qiE "TODO:|FIXME:|HACK:|XXX:" "$file" 2>/dev/null; then
    TODO_COUNT=$(grep -ciE "TODO:|FIXME:|HACK:|XXX:" "$file" 2>/dev/null || echo 0)
    add_finding "low" "todo" "$file" "$TODO_COUNT TODO/FIXME comments found."
  fi

  # 5. Svelte-specific: Missing loading states
  if [[ "$file" == *.svelte ]]; then
    if grep -qE "fetch\(|supabase\.|\.from\(|async " "$file" 2>/dev/null; then
      if ! grep -qiE "loading|isLoading|pending|\{#await" "$file" 2>/dev/null; then
        add_finding "medium" "ux" "$file" "Async operation without loading state indicator."
      fi
    fi

    # Icon buttons without aria-label
    if grep -qE "<button[^>]*>.*<svg" "$file" 2>/dev/null; then
      if ! grep -qE "aria-label" "$file" 2>/dev/null; then
        add_finding "medium" "accessibility" "$file" "Icon button may be missing aria-label."
      fi
    fi
  fi
done

exit 0
