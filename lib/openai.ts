import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export async function generateFastingPlan(userProfile: {
  age: number;
  gender: string;
  weight: number;
  goal: string;
  wakeTime: string;
  sleepTime: string;
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `You are an expert intermittent fasting coach. Create a personalized fasting schedule based on user profile. Return only a JSON object with:
          {
            "fastingHours": number (12-24),
            "eatingHours": number (8-12),
            "startTime": "HH:MM",
            "endTime": "HH:MM",
            "planType": "16:8" | "14:10" | "18:6" | "OMAD",
            "reasoning": "brief explanation"
          }`
        },
        {
          role: "user",
          content: `Create a fasting plan for: Age ${userProfile.age}, ${userProfile.gender}, ${userProfile.weight}lbs, Goal: ${userProfile.goal}, Wakes at ${userProfile.wakeTime}, Sleeps at ${userProfile.sleepTime}`
        }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating fasting plan:', error);
    // Fallback plan
    return {
      fastingHours: 16,
      eatingHours: 8,
      startTime: "12:00",
      endTime: "20:00",
      planType: "16:8",
      reasoning: "Standard 16:8 plan - great for beginners"
    };
  }
}

export async function getCoachingAdvice(moodData: {
  mood: string;
  energy: number;
  notes?: string;
  currentPlan: any;
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `You are a supportive intermittent fasting coach. Provide brief, encouraging advice based on user's mood and energy. Keep responses under 150 words and be empathetic.`
        },
        {
          role: "user",
          content: `Current mood: ${moodData.mood}, Energy level: ${moodData.energy}/10, Notes: ${moodData.notes || 'None'}, Current plan: ${moodData.currentPlan.planType}`
        }
      ],
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || "Keep going! You're doing great with your fasting journey.";
  } catch (error) {
    console.error('Error getting coaching advice:', error);
    return "Keep going! You're doing great with your fasting journey.";
  }
}

export async function transcribeVoice(audioBlob: Blob) {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Error transcribing voice:', error);
    return '';
  }
}
