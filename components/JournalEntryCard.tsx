'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Mic, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JournalEntry } from '@/lib/storage';

interface JournalEntryCardProps {
  entry: JournalEntry;
  variant: 'voice' | 'text';
}

export function JournalEntryCard({ entry, variant }: JournalEntryCardProps) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            variant === 'voice' ? 'bg-accent' : 'bg-primary'
          } text-white`}>
            {variant === 'voice' ? <Mic className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">{entry.mood}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Energy: {entry.energy}/10
            </div>
            
            {(entry.notes || entry.transcription) && (
              <p className="text-sm text-foreground">
                {entry.transcription || entry.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
