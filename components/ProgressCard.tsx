'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Target } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface ProgressCardProps {
  variant: 'weeklyHours' | 'moodTrend';
  data?: any;
}

export function ProgressCard({ variant, data }: ProgressCardProps) {
  const renderWeeklyHours = () => {
    const totalHours = data?.totalHours || 0;
    const targetHours = data?.targetHours || 112; // 16h * 7 days
    const progress = (totalHours / targetHours) * 100;

    return (
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(totalHours)}h</div>
          <p className="text-xs text-muted-foreground">
            of {Math.round(targetHours)}h target
          </p>
          <Progress value={Math.min(progress, 100)} className="mt-3" />
        </CardContent>
      </Card>
    );
  };

  const renderMoodTrend = () => {
    const avgMood = data?.averageMood || 7;
    const trend = data?.trend || 'stable';
    const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';

    return (
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {avgMood}/10 {trendIcon}
          </div>
          <p className="text-xs text-muted-foreground">
            Average this week
          </p>
          <div className="mt-3">
            <Progress value={avgMood * 10} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return variant === 'weeklyHours' ? renderWeeklyHours() : renderMoodTrend();
}
