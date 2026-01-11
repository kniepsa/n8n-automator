import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';

export async function Header(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          n8n Automator
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/templates"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Templates
              </Link>
              <Link
                href="/chat"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Chat
              </Link>
              <UserMenu
                email={user.email || ''}
                avatarUrl={user.user_metadata?.avatar_url as string | null}
              />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
