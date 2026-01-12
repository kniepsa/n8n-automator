'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DeployCelebrationProps {
  isOpen: boolean;
  workflowName: string;
  workflowUrl?: string;
  onClose: () => void;
  onBuildAnother: () => void;
}

export function DeployCelebration({
  isOpen,
  workflowName,
  workflowUrl,
  onClose,
  onBuildAnother,
}: DeployCelebrationProps): React.ReactElement | null {
  const fireConfetti = useCallback(() => {
    // Fire confetti from both sides
    const defaults = {
      spread: 60,
      ticks: 100,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#ff6b35', '#f7c59f', '#2ec4b6', '#e71d36', '#011627'],
    };

    // Left side burst
    void confetti({
      ...defaults,
      particleCount: 40,
      origin: { x: 0.2, y: 0.6 },
      angle: 60,
    });

    // Right side burst
    void confetti({
      ...defaults,
      particleCount: 40,
      origin: { x: 0.8, y: 0.6 },
      angle: 120,
    });

    // Center burst with delay
    setTimeout(() => {
      void confetti({
        ...defaults,
        particleCount: 60,
        origin: { x: 0.5, y: 0.7 },
        spread: 100,
      });
    }, 150);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Fire confetti on mount
    fireConfetti();

    // Fire again after a short delay for extra celebration
    const timeout = setTimeout(() => {
      fireConfetti();
    }, 800);

    return () => clearTimeout(timeout);
  }, [isOpen, fireConfetti]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative z-10 mx-4 w-full max-w-md animate-in zoom-in-95 fade-in duration-300 border-2 border-primary/20 bg-card shadow-2xl">
        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="mb-4 text-6xl animate-bounce">🎉</div>

          {/* Headline */}
          <h2 className="mb-2 text-2xl font-bold text-foreground">Your workflow is LIVE!</h2>

          {/* Workflow name */}
          <p className="mb-6 text-lg text-muted-foreground">
            <span className="font-medium text-primary">{workflowName}</span>
            <br />
            <span className="text-sm">has been deployed to n8n</span>
          </p>

          {/* Divider */}
          <div className="mb-6 h-px bg-border" />

          {/* Next steps hint */}
          <p className="mb-6 text-sm text-muted-foreground">
            Remember to <strong>activate</strong> your workflow in n8n to start running it!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {workflowUrl && (
              <Button asChild size="lg" className="w-full">
                <a href={workflowUrl} target="_blank" rel="noopener noreferrer">
                  Open in n8n →
                </a>
              </Button>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={onBuildAnother}>
                Build Another
              </Button>
              <Button variant="ghost" size="lg" className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
