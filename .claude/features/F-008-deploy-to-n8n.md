# F-008: Deploy to n8n

## Overview

One-click deployment of generated workflows to user's n8n instance.

## Priority

P1 - MVP Should Have

## User Story

As a user, I want to deploy the generated workflow to my n8n with one click so I can start using it immediately.

## Acceptance Criteria

- [ ] Deploy button in workflow preview
- [ ] Confirm deployment dialog
- [ ] Show deployment progress
- [ ] Success message with link to workflow in n8n
- [ ] Error handling with retry option
- [ ] Save workflow metadata to database
- [ ] Mark workflow as deployed

## Technical Implementation

### Deploy Action

```typescript
// src/lib/n8n/actions.ts
export async function deployWorkflow(workflow: N8nWorkflow, n8nUrl: string, apiKey: string) {
  const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
    },
    body: JSON.stringify(workflow),
  });

  if (!response.ok) {
    throw new Error('Failed to deploy workflow');
  }

  return response.json();
}
```

### API Route

```typescript
// src/app/api/workflows/deploy/route.ts
export async function POST(req: Request) {
  const { workflowId } = await req.json();

  // Get workflow from database
  // Get user's n8n credentials
  // Deploy to n8n
  // Update workflow record with n8n_workflow_id
  // Mark as deployed

  return Response.json({ success: true, n8nWorkflowId });
}
```

### Deploy Button Component

```typescript
// src/components/chat/deploy-button.tsx
export function DeployButton({ workflowId }: { workflowId: string }) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const result = await deployWorkflow(workflowId);
      toast.success('Workflow deployed!');
      // Open n8n in new tab
      window.open(`${n8nUrl}/workflow/${result.n8nWorkflowId}`, '_blank');
    } catch (error) {
      toast.error('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Button onClick={handleDeploy} disabled={isDeploying}>
      {isDeploying ? 'Deploying...' : 'Deploy to n8n'}
    </Button>
  );
}
```

## Files to Create/Modify

- `src/lib/n8n/actions.ts` - CREATE
- `src/components/chat/deploy-button.tsx` - CREATE
- `src/app/api/workflows/deploy/route.ts` - CREATE

## User Flow

1. User sees workflow preview
2. Clicks "Deploy to n8n"
3. Confirmation dialog appears
4. User confirms
5. Loading spinner shows
6. Success toast with "Open in n8n" link
7. Workflow marked as deployed in database

## Error Handling

- Connection error: "Could not reach n8n. Check your connection."
- Auth error: "Invalid API key. Update in Settings."
- Validation error: "Workflow validation failed: [details]"
- Retry option on all errors
