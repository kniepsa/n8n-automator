# Technical Debt

## High Priority

## Medium Priority

- **Google OAuth credentials**: Need to configure in Supabase Dashboard (Authentication → Providers → Google) with Google Cloud Console credentials

## Low Priority

- **Next.js middleware deprecation**: `middleware.ts` shows warning to migrate to "proxy" pattern (still works for now)
- **"Join 0 others" on homepage**: Hide waitlist counter until > 10 signups
- **No "Forgot password" link**: Add password reset flow
- **No loading state on auth forms**: Add spinner to buttons during submit
- **No live test run from UI**: Can't trigger and see workflow execution from app (deferred to v2)
- **No session memory for chat**: Can't return and continue previous conversation
- **MCP list_credentials**: Confirmed NOT supported by n8n-builder MCP (error -32601: Unknown tool). Flow handles gracefully with "Continue anyway" button

---

_Last updated: 2026-01-12_
