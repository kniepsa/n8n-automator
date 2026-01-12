'use client';

import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DetailedValidation extends ValidationResult {
  nodeWarnings: Map<string, string[]>;
  credentialGaps: string[];
  complexityScore: number;
}

interface ValidationWarningsProps {
  validation: DetailedValidation;
  className?: string;
}

export function ValidationWarnings({
  validation,
  className,
}: ValidationWarningsProps): React.ReactElement | null {
  const { errors, warnings, credentialGaps } = validation;

  if (errors.length === 0 && warnings.length === 0 && credentialGaps.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-4 space-y-2', className)}>
      {/* Errors (blocking) */}
      {errors.map((error, index) => (
        <div
          key={`error-${index}`}
          className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ))}

      {/* Warnings (non-blocking) */}
      {warnings.map((warning, index) => (
        <div
          key={`warning-${index}`}
          className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{warning}</span>
        </div>
      ))}

      {/* Credential gaps */}
      {credentialGaps.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-600 dark:text-blue-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Credentials needed in n8n: {credentialGaps.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
