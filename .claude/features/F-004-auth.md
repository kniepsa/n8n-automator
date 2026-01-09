# F-004: Authentication

## Overview

User authentication using Supabase Auth with email/password and OAuth providers.

## Priority

P0 - MVP Required

## User Story

As a user, I want to sign up and log in securely so that my workflows and n8n credentials are protected.

## Acceptance Criteria

- [ ] Email/password signup and login
- [ ] Google OAuth login
- [ ] Password reset via email
- [ ] Session persistence (stay logged in)
- [ ] Protected routes (redirect to login if unauthenticated)
- [ ] Logout functionality
- [ ] User profile creation on signup

## Technical Implementation

### Auth Flow

```
1. User visits /login or /signup
2. Enters credentials or clicks OAuth
3. Supabase handles authentication
4. On success: redirect to /chat
5. Session stored in cookies (SSR compatible)
```

### Key Code

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

### Database Trigger

```sql
-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Files to Create/Modify

- `src/lib/supabase/client.ts` - CREATE
- `src/lib/supabase/server.ts` - CREATE
- `src/lib/supabase/middleware.ts` - CREATE
- `src/middleware.ts` - CREATE
- `src/app/(auth)/login/page.tsx` - CREATE
- `src/app/(auth)/signup/page.tsx` - CREATE
- `src/app/(auth)/layout.tsx` - CREATE

## Dependencies

- `@supabase/supabase-js`
- `@supabase/ssr`

## Security Considerations

- Use Supabase RLS for all data access
- Never expose service role key to frontend
- Validate session on every API request
- Use secure, httpOnly cookies for session
