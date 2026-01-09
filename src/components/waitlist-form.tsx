'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function WaitlistForm(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    // TODO: Implement actual waitlist signup
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  if (status === 'success') {
    return (
      <div className="text-center">
        <p className="text-green-500">Thanks! We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </Button>
    </form>
  );
}
