'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: number;
}

interface ChatAgentProps {
  onMoodSubmit?: (mood: string, energy: number, notes?: string) => void;
}

export function ChatAgent({ onMoodSubmit }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: "Hi! How are you feeling today? Share your mood and energy level (1-10), and I'll help adjust your fasting plan.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simple mood parsing (in real app, use more sophisticated NLP)
    const moodKeywords = {
      great: 9,
      good: 8,
      okay: 6,
      tired: 4,
      bad: 3,
      terrible: 2
    };

    let detectedMood = 'neutral';
    let detectedEnergy = 5;

    Object.entries(moodKeywords).forEach(([mood, energy]) => {
      if (content.toLowerCase().includes(mood)) {
        detectedMood = mood;
        detectedEnergy = energy;
      }
    });

    // Extract numbers for energy level
    const numbers = content.match(/\d+/g);
    if (numbers) {
      const energyLevel = parseInt(numbers[0]);
      if (energyLevel >= 1 && energyLevel <= 10) {
        detectedEnergy = energyLevel;
      }
    }

    // Call callback
    onMoodSubmit?.(detectedMood, detectedEnergy, content);

    // Add agent response
    setTimeout(() => {
      const responses = [
        "Thanks for sharing! Based on your mood, I'll adjust your fasting window slightly.",
        "I understand how you're feeling. Let's optimize your plan for better energy.",
        "Great feedback! Your fasting schedule will be personalized based on this.",
      ];

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // In real app, implement voice recording and transcription
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        handleSubmit("I'm feeling good today, energy level around 7");
      }, 2000);
    }
  };

  return (
    <Card className="shadow-card h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How are you feeling?"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(input)}
              className="flex-1"
            />
            <Button
              onClick={handleVoiceRecord}
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>
            <Button onClick={() => handleSubmit(input)} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
