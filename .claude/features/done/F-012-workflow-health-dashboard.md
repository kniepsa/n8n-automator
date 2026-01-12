# F-012: My Automations

## Job To Be Done

> "I want to know my automations are working and see the impact they're having - without becoming an n8n expert."

## The Insight (Joe Gebbia Critique)

n8n's execution logs show WHAT happened. We show WHY it matters.

**n8n shows**: "Workflow executed successfully at 14:32"
**We show**: "Slack alert sent - You've automated 47 notifications this week"

## Target User

Sarah, Marketing Manager. Built 3 workflows via chat. Doesn't want to learn n8n's UI. Wants peace of mind that her automations work + evidence they're valuable.

## User Experience Flow

```
[My Automations] (/automations)
     │
     ├── Empty State (new users)
     │   "Your first automation is just a chat away →"
     │   [Start Building] → /chat
     │
     └── Automation Cards (existing users)
         ┌─────────────────────────────────────┐
         │ 📧 New Lead → Slack Alert           │
         │ ✅ Healthy • Last run 2 hours ago   │
         │                                     │
         │ 🎯 IMPACT: 47 alerts sent this week │
         │                                     │
         │ [Pause] [Improve with AI] [→ n8n]   │
         └─────────────────────────────────────┘
```

## Acceptance Criteria

### Must Have (MLP)

- [ ] Page at `/automations` (not "dashboard" - too techy)
- [ ] List workflows with human-friendly names
- [ ] Health status: ✅ Healthy / ⚠️ Needs attention / 🛑 Failing
- [ ] Impact metric per workflow: "X runs this week"
- [ ] Plain English last run: "2 hours ago" not timestamps
- [ ] Empty state with CTA to `/chat`

### Actions (Progressive Disclosure)

- [ ] **Pause/Resume** (not activate/deactivate) with confirmation
- [ ] **View in n8n** link (advanced users)
- [ ] **Improve with AI** → opens chat with workflow context (F-015 prep)

### Error States (Trust Through Transparency)

- [ ] Failing workflow shows WHAT failed in plain English
- [ ] Actionable suggestion: "Your Slack token expired. [Reconnect Slack]"
- [ ] Not: raw error JSON

### Delight Moments

- [ ] First workflow card has subtle celebration styling
- [ ] Weekly impact summary at top: "Your automations ran 127 times this week"
- [ ] "All systems healthy" green banner when everything works

## Technical Approach

### API Endpoints

- `GET /api/automations` - list workflows + execution counts
- `POST /api/automations/[id]/toggle` - pause/resume

### n8n MCP Tools (Existing)

- `list_workflows` - get all workflows
- `get_workflow_executions` - execution history for counts
- `update_workflow` - toggle active state

### Components (Reuse Existing)

- `AutomationCard` - extends existing card pattern from chat
- `HealthBadge` - reuse from workflow-preview validation badges
- `EmptyState` - new, but follows existing empty state patterns

### Data Aggregation

```typescript
// Impact calculation
const weeklyRuns = executions.filter((e) => e.startedAt > weekAgo).length;

// Health determination
const health =
  lastExecution?.status === 'success'
    ? 'healthy'
    : lastExecution?.status === 'error'
      ? 'failing'
      : 'unknown';
```

## What We DON'T Build (KISS)

- ❌ Execution log viewer (use n8n for that)
- ❌ Workflow editing (use chat for modifications)
- ❌ Complex filtering/search (not needed for <20 workflows)
- ❌ Real-time updates (polling on page load is enough)

## Dependencies

- F-005: n8n Connection (required)
- F-002: MCP Client (required)

## Scope

**Small** - 1 page, 1 API route, reuses existing components

## Success Metrics

1. **Engagement**: Users visit `/automations` weekly
2. **Trust**: <10% of users open n8n directly to check status
3. **Retention**: Users with 3+ automations have 2x retention

## Open Questions Resolved

1. ~~Show workflows created outside n8n-automator?~~ → **Yes**, show all (user doesn't care where it came from)
2. ~~How far back execution history?~~ → **7 days** for impact metric
3. ~~Filtering/search?~~ → **No**, KISS for v1

---

_Joe Gebbia Review: 2026-01-12_
_Status: APPROVED for implementation ✅_
