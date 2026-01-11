# F-005: n8n Connection Setup

## Overview

Settings page for users to configure their n8n instance connection.

## Priority

P0 - MVP Required

## User Story

As a user, I want to connect my n8n instance by providing my URL and API key so that the app can create workflows directly in my n8n.

## Acceptance Criteria

- [x] Form to enter n8n instance URL
- [x] Form to enter n8n API key (masked input)
- [x] Test connection button
- [x] Success/failure feedback
- [x] Save credentials securely
- [x] Show connection status in UI
- [x] Instructions for getting API key

## Technical Implementation

### Settings Form

```typescript
// src/app/(dashboard)/settings/page.tsx
export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>n8n Connection</CardTitle>
        <CardDescription>
          Connect your n8n instance to create workflows directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <N8nConnectionForm />
      </CardContent>
    </Card>
  );
}
```

### API Route

```typescript
// src/app/api/settings/n8n/route.ts
export async function PUT(req: Request) {
  const { n8nUrl, n8nApiKey } = await req.json();

  // Validate URL format
  // Test connection to n8n
  // Encrypt and store in Supabase

  return Response.json({ success: true });
}
```

### Connection Test

```typescript
async function testN8nConnection(url: string, apiKey: string) {
  const response = await fetch(`${url}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': apiKey },
  });
  return response.ok;
}
```

## Files to Create/Modify

- `src/app/(dashboard)/settings/page.tsx` - CREATE
- `src/components/settings/n8n-connection-form.tsx` - CREATE
- `src/app/api/settings/n8n/route.ts` - CREATE

## UI Elements

- Input: n8n URL (text, validated)
- Input: API Key (password, masked)
- Button: Test Connection
- Button: Save
- Status: Connected / Not Connected badge
- Help: Link to n8n API documentation

## Validation

- URL must be valid HTTP(S) URL
- API key must not be empty
- Connection test must pass before allowing save
