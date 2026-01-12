# ADR-004: N8n Nerd Process

## Status

Accepted

## Context

Current workflow generation is good but not great. We need a systematic process that produces production-ready n8n workflows, not prototypes.

**Problems with current approach:**

1. No error handling by default
2. No validation before output
3. Node positioning is arbitrary
4. No consideration for execution order
5. Missing edge cases

## Decision

Implement the **N8n Nerd Process** - a 7-step systematic approach for workflow generation.

## The Process

```
┌─────────────────────────────────────────────────────────────┐
│                    N8N NERD PROCESS™                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INTENT          Parse user request into structured goal │
│       ↓                                                     │
│  2. DECOMPOSE       Break into: Trigger → Process → Output  │
│       ↓                                                     │
│  3. NODE SELECT     Best n8n node for each step             │
│       ↓                                                     │
│  4. ERROR ARMOR     Add try/catch, fallbacks (if needed)    │
│       ↓                                                     │
│  5. LAYOUT          Calculate proper node positions         │
│       ↓                                                     │
│  6. VALIDATE        Check JSON, required fields, creds      │
│       ↓                                                     │
│  7. OUTPUT          JSON + explanation + visual preview     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: INTENT

Parse user's natural language into structured intent:

```typescript
interface WorkflowIntent {
  trigger: 'webhook' | 'schedule' | 'manual' | 'event';
  triggerDetails?: string; // "every day at 9am", "when form submitted"
  inputs: string[]; // What data comes in
  transformations: string[]; // What happens to data
  outputs: string[]; // Where data goes
  conditions?: string[]; // Any if/else logic
}
```

**Example:**

- User: "When someone fills out our Typeform, check if they're a good lead, and notify sales on Slack"
- Intent:
  ```json
  {
    "trigger": "event",
    "triggerDetails": "Typeform submission",
    "inputs": ["form response"],
    "transformations": ["evaluate lead quality"],
    "outputs": ["Slack notification"],
    "conditions": ["lead score threshold"]
  }
  ```

### Step 2: DECOMPOSE

Break into the canonical workflow pattern:

```
[TRIGGER] → [TRANSFORM?] → [CONDITION?] → [ACTION] → [OUTPUT?]
```

Rules:

- Every workflow starts with exactly ONE trigger
- Logic nodes (IF, Switch) come before action nodes
- Keep transformations minimal (Set node only when necessary)
- Outputs are final nodes in branches

### Step 3: NODE SELECT

Choose the optimal n8n node for each step:

| Need            | Best Node                    | Avoid                             |
| --------------- | ---------------------------- | --------------------------------- |
| HTTP trigger    | `webhook`                    | ~~`httpRequest` as trigger~~      |
| Time-based      | `schedule` / `cron`          |                                   |
| Check condition | `if`                         | ~~`code` for simple logic~~       |
| Transform data  | `set`                        | ~~`function` for simple mapping~~ |
| Complex logic   | `code`                       | Only when `set` isn't enough      |
| API call        | `httpRequest`                |                                   |
| Send message    | Native node (slack, discord) | ~~`httpRequest` to Slack API~~    |

**Node Preference Hierarchy:**

1. Native integration node (best)
2. HTTP Request with auth (good)
3. Code node (last resort)

### Step 4: ERROR ARMOR

Add resilience based on complexity:

| Complexity         | Error Handling                     |
| ------------------ | ---------------------------------- |
| Simple (2-3 nodes) | None needed                        |
| Medium (4-5 nodes) | Add error output on critical nodes |
| Complex (6+ nodes) | Full try/catch pattern             |

**Try/Catch Pattern:**

```
[Trigger] → [Try Node] → [Action] → [Success Output]
                ↓
           [Catch Node] → [Error Handler (Slack/Log)]
```

**When to add error handling:**

- External API calls (might fail)
- Data transformations (might have bad input)
- Credential-dependent operations

**When NOT to add error handling:**

- Simple webhook → Slack notification
- User explicitly wants minimal workflow

### Step 5: LAYOUT

Calculate proper node positions for visual clarity:

```typescript
const LAYOUT_RULES = {
  startX: 250,
  startY: 300,
  nodeWidth: 200,
  nodeHeight: 80,
  horizontalGap: 200,
  verticalGap: 150,
};

function calculatePosition(nodeIndex: number, branchIndex: number = 0) {
  return {
    x: LAYOUT_RULES.startX + nodeIndex * LAYOUT_RULES.horizontalGap,
    y: LAYOUT_RULES.startY + branchIndex * LAYOUT_RULES.verticalGap,
  };
}
```

**Layout patterns:**

- Linear: Left to right, same Y
- Branching: IF true goes up, IF false goes down
- Merge: Multiple paths converge to single node

### Step 6: VALIDATE

Before outputting, check:

```typescript
interface ValidationChecklist {
  hasOneTrigger: boolean; // Exactly one trigger node
  allNodesConnected: boolean; // No orphan nodes
  credentialsSpecified: boolean; // creds object present where needed
  positionsValid: boolean; // No overlapping nodes
  namesDescriptive: boolean; // Not "IF1", "Set2"
  nodeTypesExist: boolean; // Valid n8n node types
}
```

**Auto-fix common issues:**

- Missing positions → calculate with layout algorithm
- Generic names → generate descriptive names
- Missing credentials object → add placeholder

### Step 7: OUTPUT

Structured output format:

```markdown
## Your Workflow: [Descriptive Name]

[VISUAL PREVIEW - React Flow component]

### What it does:

1. **[Trigger]** - Starts when [event]
2. **[Node 2]** - Does [action]
3. **[Node 3]** - Sends to [destination]

### Credentials needed:

- Slack (OAuth) - for notifications
- Airtable (API key) - for storage

### Ready to deploy?

[Deploy to n8n] button
```

## Prompt Engineering

Add to system prompt:

```
## N8N NERD PROCESS

When generating workflows, follow this process internally:

1. **INTENT**: What does user actually want? (trigger, transform, output)
2. **DECOMPOSE**: Break into Trigger → Process → Output pattern
3. **NODE SELECT**: Choose best n8n node for each step (prefer native nodes)
4. **ERROR ARMOR**: Add error handling for medium/complex workflows
5. **LAYOUT**: Position nodes for visual clarity (left-to-right, branches up/down)
6. **VALIDATE**: Check all nodes connected, credentials specified, positions valid
7. **OUTPUT**: JSON + simple explanation + credential requirements

### Production-Ready Checklist:
- [ ] Exactly one trigger node
- [ ] All nodes have descriptive names (not IF1, Set2)
- [ ] Credentials object present on all integration nodes
- [ ] Positions don't overlap
- [ ] MAX 7 nodes unless user explicitly needs more
```

## Implementation

### Files to Modify

1. **`src/lib/n8n/prompts.ts`** - Add N8n Nerd Process to system prompt
2. **`src/lib/workflow/validator.ts`** - Create validation logic
3. **`src/lib/workflow/layout.ts`** - Create auto-layout algorithm

### New Prompt Section

```typescript
const N8N_NERD_PROCESS = `
## N8N NERD PROCESS (Internal Checklist)

Before outputting ANY workflow JSON, verify:

### Structure
- [ ] Exactly ONE trigger node (webhook, schedule, or event-based)
- [ ] All nodes connected (no orphans)
- [ ] Linear or branching flow (not circular)

### Quality
- [ ] Descriptive node names ("Check Lead Score" not "IF1")
- [ ] Positions calculated (no overlaps, left-to-right flow)
- [ ] MAX 5-7 nodes (ask before exceeding)

### Production-Ready
- [ ] Credentials object on integration nodes
- [ ] Error handling for API calls (medium/complex workflows)
- [ ] Data expressions use correct syntax (={{$json["field"]}})

### Output
- [ ] JSON in code block
- [ ] Simple 1-sentence explanation per node
- [ ] List of required credentials
- [ ] Ask before deploying
`;
```

## Consequences

### Positive

- More consistent workflow quality
- Better user experience (visual preview + validation)
- Fewer "credentials not found" errors
- Workflows work on first deploy more often

### Negative

- Slightly longer generation time
- More complex prompts (token usage)
- Need to maintain validation logic

## Related

- F-010: Visual Workflow Preview
- F-003: Workflow Generation
- ADR-002: Quality Modes
