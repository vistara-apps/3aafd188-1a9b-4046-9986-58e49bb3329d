'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square } from 'lucide-react';
import { formatTime, formatDuration, calculateProgress } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  variant: 'active' | 'paused' | 'completed';
  startTime?: number;
  endTime?: number;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export function TimerDisplay({ 
  variant, 
  startTime, 
  endTime,
  onStart,
  onPause,
  onStop 
}: TimerDisplayProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isActive = variant === 'active';
  const elapsed = startTime ? Math.floor((currentTime - startTime) / 1000) : 0;
  const total = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;
  const progress = total > 0 ? calculateProgress(0, elapsed, total) : 0;

  const renderTimer = () => {
    switch (variant) {
      case 'active':
        return (
          <div className="text-center space-y-4">
            <motion.div 
              className="text-4xl font-bold text-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatTime(elapsed)}
            </motion.div>
            <div className="text-sm text-muted-foreground">
              Fasting • {total > 0 ? formatDuration(Math.floor(total / 60)) : '0m'} planned
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex gap-2 justify-center">
              <Button onClick={onPause} variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button onClick={onStop} variant="destructive" size="sm">
                <Square className="w-4 h-4 mr-1" />
                End Fast
              </Button>
            </div>
          </div>
        );

      case 'paused':
        return (
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-muted-foreground">
              {formatTime(elapsed)}
            </div>
            <div className="text-sm text-muted-foreground">
              Paused • {total > 0 ? formatDuration(Math.floor(total / 60)) : '0m'} planned
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex gap-2 justify-center">
              <Button onClick={onStart} size="sm">
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
              <Button onClick={onStop} variant="destructive" size="sm">
                <Square className="w-4 h-4 mr-1" />
                End Fast
              </Button>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center space-y-4">
            <motion.div 
              className="text-4xl font-bold text-accent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              ✨ {formatTime(elapsed)}
            </motion.div>
            <div className="text-sm text-muted-foreground">
              Fast completed!
            </div>
            <Progress value={100} className="w-full" />
            <Button onClick={onStart} className="w-full">
              Start New Fast
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-muted-foreground">
              00:00
            </div>
            <div className="text-sm text-muted-foreground">
              Ready to start fasting
            </div>
            <Button onClick={onStart} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Fasting
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        {renderTimer()}
      </CardContent>
    </Card>
  );
}
