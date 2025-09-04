'use client';

export interface UserProfile {
  userId: string;
  email?: string;
  createdAt: number;
  gender: string;
  age: number;
  weight: number;
  goal: string;
  preferredWakeTime: string;
  preferredSleepTime: string;
  currentFastingPlan?: any;
  subscriptionTier: 'free' | 'pro';
}

export interface FastingSession {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  plannedWindowStart: number;
  plannedWindowEnd: number;
  status: 'active' | 'completed' | 'broken';
}

export interface JournalEntry {
  entryId: string;
  userId: string;
  timestamp: number;
  mood: string;
  energy: number;
  notes?: string;
  voiceRecordingUrl?: string;
  transcription?: string;
}

// Local storage helpers
export const storage = {
  getUser: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('fastflow_user');
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: UserProfile) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('fastflow_user', JSON.stringify(user));
  },

  getFastingSessions: (): FastingSession[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('fastflow_sessions');
    return data ? JSON.parse(data) : [];
  },

  addFastingSession: (session: FastingSession) => {
    if (typeof window === 'undefined') return;
    const sessions = storage.getFastingSessions();
    sessions.push(session);
    localStorage.setItem('fastflow_sessions', JSON.stringify(sessions));
  },

  updateFastingSession: (sessionId: string, updates: Partial<FastingSession>) => {
    if (typeof window === 'undefined') return;
    const sessions = storage.getFastingSessions();
    const index = sessions.findIndex(s => s.sessionId === sessionId);
    if (index >= 0) {
      sessions[index] = { ...sessions[index], ...updates };
      localStorage.setItem('fastflow_sessions', JSON.stringify(sessions));
    }
  },

  getJournalEntries: (): JournalEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('fastflow_journal');
    return data ? JSON.parse(data) : [];
  },

  addJournalEntry: (entry: JournalEntry) => {
    if (typeof window === 'undefined') return;
    const entries = storage.getJournalEntries();
    entries.push(entry);
    localStorage.setItem('fastflow_journal', JSON.stringify(entries));
  },

  getCurrentSession: (): FastingSession | null => {
    const sessions = storage.getFastingSessions();
    return sessions.find(s => s.status === 'active') || null;
  },

  clearData: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('fastflow_user');
    localStorage.removeItem('fastflow_sessions');
    localStorage.removeItem('fastflow_journal');
  }
};
