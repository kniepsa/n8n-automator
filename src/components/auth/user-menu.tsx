'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface UserMenuProps {
  email: string;
  avatarUrl?: string | null;
}

export function UserMenu({ email, avatarUrl }: UserMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={email} className="h-9 w-9 rounded-full" />
        ) : (
          <span className="text-sm font-medium">{initials}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-background shadow-lg">
            <div className="border-b p-3">
              <p className="truncate text-sm font-medium">{email}</p>
            </div>
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
