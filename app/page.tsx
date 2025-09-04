'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { TimerDisplay } from '@/components/TimerDisplay';
import { ChatAgent } from '@/components/ChatAgent';
import { ProgressCard } from '@/components/ProgressCard';
import { ProgressCircle } from '@/components/ProgressCircle';
import { JournalEntryCard } from '@/components/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, UserProfile, FastingSession, JournalEntry } from '@/lib/storage';
import { generateFastingPlan } from '@/lib/openai';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Identity } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { Clock, TrendingUp, BookOpen, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'timer' | 'coach' | 'progress' | 'journal'>('timer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data
    const userData = storage.getUser();
    const currentSessionData = storage.getCurrentSession();
    const entries = storage.getJournalEntries();
    
    setUser(userData);
    setCurrentSession(currentSessionData);
    setJournalEntries(entries);
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = async (data: any) => {
    setIsLoading(true);
    
    // Generate AI fasting plan
    const fastingPlan = await generateFastingPlan(data);
    
    const newUser: UserProfile = {
      userId: address || `user_${Date.now()}`,
      email: undefined,
      createdAt: Date.now(),
      gender: data.gender,
      age: data.age,
      weight: data.weight,
      goal: data.goal,
      preferredWakeTime: data.wakeTime,
      preferredSleepTime: data.sleepTime,
      currentFastingPlan: fastingPlan,
      subscriptionTier: 'free'
    };

    storage.setUser(newUser);
    setUser(newUser);
    setIsLoading(false);
  };

  const handleStartFasting = () => {
    if (!user) return;

    const now = Date.now();
    const plan = user.currentFastingPlan;
    const duration = plan?.fastingHours || 16;
    const endTime = now + (duration * 60 * 60 * 1000);

    const session: FastingSession = {
      sessionId: `session_${now}`,
      userId: user.userId,
      startTime: now,
      plannedWindowStart: now,
      plannedWindowEnd: endTime,
      status: 'active'
    };

    storage.addFastingSession(session);
    setCurrentSession(session);
  };

  const handleStopFasting = () => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      endTime: Date.now(),
      duration: Date.now() - currentSession.startTime,
      status: 'completed' as const
    };

    storage.updateFastingSession(currentSession.sessionId, updatedSession);
    setCurrentSession(null);
  };

  const handleMoodSubmit = (mood: string, energy: number, notes?: string) => {
    if (!user) return;

    const entry: JournalEntry = {
      entryId: `entry_${Date.now()}`,
      userId: user.userId,
      timestamp: Date.now(),
      mood,
      energy,
      notes
    };

    storage.addJournalEntry(entry);
    setJournalEntries(prev => [...prev, entry]);
  };

  const getTimerVariant = () => {
    if (!currentSession) return 'completed';
    return currentSession.status === 'active' ? 'active' : 'paused';
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="text-6xl">⚡</div>
            <h1 className="text-3xl font-bold">FastFlow</h1>
            <p className="text-muted-foreground max-w-sm">
              Your AI-powered companion for personalized intermittent fasting
            </p>
          </motion.div>
          <ConnectWallet />
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <div className="space-y-6">
            <TimerDisplay
              variant={getTimerVariant()}
              startTime={currentSession?.startTime}
              endTime={currentSession?.plannedWindowEnd}
              onStart={handleStartFasting}
              onStop={handleStopFasting}
            />
            
            {user.currentFastingPlan && (
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Your Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.currentFastingPlan.planType} • {user.currentFastingPlan.startTime} - {user.currentFastingPlan.endTime}
                      </p>
                    </div>
                    <ProgressCircle 
                      variant="fasting" 
                      progress={currentSession ? 65 : 0}
                      size={60}
                      strokeWidth={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'coach':
        return <ChatAgent onMoodSubmit={handleMoodSubmit} />;

      case 'progress':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <ProgressCard 
                variant="weeklyHours"
                data={{ totalHours: 89, targetHours: 112 }}
              />
              <ProgressCard 
                variant="moodTrend"
                data={{ averageMood: 7.2, trend: 'up' }}
              />
            </div>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={day} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">{day}</div>
                      <div className={`h-8 rounded ${i < 5 ? 'bg-accent' : 'bg-muted'}`} />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Consistent fasting this week! 🎉
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'journal':
        return (
          <div className="space-y-4">
            {journalEntries.length > 0 ? (
              journalEntries.slice(-10).reverse().map(entry => (
                <JournalEntryCard
                  key={entry.entryId}
                  entry={entry}
                  variant={entry.transcription ? 'voice' : 'text'}
                />
              ))
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No journal entries yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start chatting with your AI coach to create entries
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">FastFlow</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! {user.currentFastingPlan?.planType || '16:8'} Plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Identity address={address} className="text-sm" />
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg">
        {[
          { id: 'timer', label: 'Timer', icon: Clock },
          { id: 'coach', label: 'Coach', icon: TrendingUp },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
          { id: 'journal', label: 'Journal', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 text-xs"
              size="sm"
            >
              <Icon className="w-3 h-3 mr-1" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </AppShell>
  );
}
