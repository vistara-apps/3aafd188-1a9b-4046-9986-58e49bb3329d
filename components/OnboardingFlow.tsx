'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  age: number;
  gender: string;
  weight: number;
  goal: string;
  wakeTime: string;
  sleepTime: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps = [
    {
      title: "Welcome to FastFlow",
      subtitle: "Let's personalize your fasting journey",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">⚡</div>
          <p className="text-muted-foreground">
            AI-powered intermittent fasting that adapts to your lifestyle
          </p>
        </div>
      )
    },
    {
      title: "Basic Info",
      subtitle: "Help us understand you better",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Age</label>
            <Input
              type="number"
              value={data.age || ''}
              onChange={(e) => setData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              placeholder="25"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Weight (lbs)</label>
            <Input
              type="number"
              value={data.weight || ''}
              onChange={(e) => setData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
              placeholder="150"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Gender</label>
            <div className="flex gap-2 mt-1">
              {['Male', 'Female', 'Other'].map(gender => (
                <Button
                  key={gender}
                  variant={data.gender === gender ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, gender }))}
                  className="flex-1"
                  size="sm"
                >
                  {gender}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Goal",
      subtitle: "What do you want to achieve?",
      content: (
        <div className="space-y-3">
          {[
            { goal: 'Weight Loss', emoji: '🏃‍♀️', desc: 'Lose fat and get lean' },
            { goal: 'Energy Boost', emoji: '⚡', desc: 'Increase daily energy' },
            { goal: 'Gut Health', emoji: '🌱', desc: 'Improve digestion' },
            { goal: 'General Health', emoji: '💪', desc: 'Overall wellness' }
          ].map(item => (
            <Button
              key={item.goal}
              variant={data.goal === item.goal ? 'default' : 'outline'}
              onClick={() => setData(prev => ({ ...prev, goal: item.goal }))}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="text-left">
                  <div className="font-medium">{item.goal}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "Sleep Schedule",
      subtitle: "When do you typically sleep?",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Wake Time</label>
            <Input
              type="time"
              value={data.wakeTime || ''}
              onChange={(e) => setData(prev => ({ ...prev, wakeTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Sleep Time</label>
            <Input
              type="time"
              value={data.sleepTime || ''}
              onChange={(e) => setData(prev => ({ ...prev, sleepTime: e.target.value }))}
            />
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return data.age && data.weight && data.gender;
      case 2: return data.goal;
      case 3: return data.wakeTime && data.sleepTime;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data as OnboardingData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle>{steps[step].title}</CardTitle>
          <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              {steps[step].content}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {step === steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
