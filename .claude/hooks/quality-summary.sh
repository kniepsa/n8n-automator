#!/bin/bash
# Quality Summary - runs on session Stop
# Summarizes findings and cleans up state

STATE_DIR="$HOME/.claude/quality-state"
FINDINGS_FILE="$STATE_DIR/findings.jsonl"

# Exit if no findings file
[ ! -f "$FINDINGS_FILE" ] && exit 0

# Count findings by severity
CRITICAL=$(grep -c '"severity":"critical"' "$FINDINGS_FILE" 2>/dev/null || echo 0)
HIGH=$(grep -c '"severity":"high"' "$FINDINGS_FILE" 2>/dev/null || echo 0)
MEDIUM=$(grep -c '"severity":"medium"' "$FINDINGS_FILE" 2>/dev/null || echo 0)

# TTS summary if issues found
if [ "$CRITICAL" -gt 0 ]; then
  say "$CRITICAL critical quality issues found." 2>/dev/null &
elif [ "$HIGH" -gt 0 ]; then
  say "$HIGH quality warnings to review." 2>/dev/null &
fi

# Clean up session files (keep findings for /quality-check)
rm -f "$STATE_DIR/edit-count" 2>/dev/null
rm -f "$STATE_DIR/session-files" 2>/dev/null
rm -f "$STATE_DIR/announced" 2>/dev/null

exit 0
