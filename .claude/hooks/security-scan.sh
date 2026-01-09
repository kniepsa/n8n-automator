#!/bin/bash
# Security Scan - runs on every Edit/Write via PostToolUse hook
# Detects hardcoded secrets and credentials

FILE_PATH="$1"
STATE_DIR="$HOME/.claude/quality-state"
FINDINGS_FILE="$STATE_DIR/findings.jsonl"
ANNOUNCED_FILE="$STATE_DIR/announced"

# Exit if no file provided or file doesn't exist
[ -z "$FILE_PATH" ] && exit 0
[ ! -f "$FILE_PATH" ] && exit 0

# Skip non-code files
case "$FILE_PATH" in
  *.md|*.json|*.yaml|*.yml|*.txt|*.log|*.lock) exit 0 ;;
esac

# Ensure state directory exists
mkdir -p "$STATE_DIR"

# Security patterns to detect
PATTERNS=(
  # OpenAI/Anthropic API keys
  'sk-[a-zA-Z0-9]{20,}'
  'sk-ant-[a-zA-Z0-9]{20,}'

  # Generic API keys
  'api[_-]?key["\s:=]+["\047][^"\047]{16,}'
  'apikey["\s:=]+["\047][^"\047]{16,}'

  # AWS credentials
  'AKIA[0-9A-Z]{16}'
  'aws[_-]?secret[_-]?access[_-]?key'

  # Supabase JWT tokens
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}'

  # Private keys
  '-----BEGIN.*PRIVATE KEY-----'

  # Database connection strings with passwords
  'postgres://[^:]+:[^@]+@'
  'mysql://[^:]+:[^@]+@'

  # Bearer tokens
  'Bearer [a-zA-Z0-9\-._~+/]{20,}'
)

# Check each pattern
for pattern in "${PATTERNS[@]}"; do
  if grep -qE "$pattern" "$FILE_PATH" 2>/dev/null; then
    # Create finding hash for deduplication
    FINDING_HASH=$(echo "$FILE_PATH:$pattern" | md5 -q 2>/dev/null || echo "$FILE_PATH:$pattern" | md5sum | cut -d' ' -f1)

    # Check if already announced this session
    if grep -q "$FINDING_HASH" "$ANNOUNCED_FILE" 2>/dev/null; then
      exit 0
    fi

    # Add to findings
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "{\"timestamp\":\"$TIMESTAMP\",\"type\":\"security\",\"severity\":\"critical\",\"file\":\"$FILE_PATH\",\"message\":\"Potential secret detected\"}" >> "$FINDINGS_FILE"

    # Mark as announced
    echo "$FINDING_HASH" >> "$ANNOUNCED_FILE"

    # TTS alert (macOS)
    say "Security alert. Secret detected in code." 2>/dev/null &

    exit 0
  fi
done

# Check for .env files being modified (except .env.example)
if [[ "$FILE_PATH" == *".env"* ]] && [[ "$FILE_PATH" != *".env.example"* ]] && [[ "$FILE_PATH" != *".env.local.example"* ]]; then
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "{\"timestamp\":\"$TIMESTAMP\",\"type\":\"security\",\"severity\":\"critical\",\"file\":\"$FILE_PATH\",\"message\":\"Environment file should not be committed\"}" >> "$FINDINGS_FILE"
  say "Warning. Environment file detected." 2>/dev/null &
fi

exit 0
