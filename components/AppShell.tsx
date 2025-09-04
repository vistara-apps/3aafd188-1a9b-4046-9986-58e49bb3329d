'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <div className="container max-w-md mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
