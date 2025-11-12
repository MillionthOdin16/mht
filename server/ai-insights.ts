import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface DailyEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleepHours: number;
  sleepQuality: number;
  medications: string[];
  diary: string;
  tags?: string[];
  siTracking?: {
    present: boolean;
    intensity?: number;
  };
}

export async function generateAIInsights(entries: DailyEntry[], type: string) {
  if (!process.env.GEMINI_API_KEY) {
    // Return mock insights when offline
    return getMockInsights(entries, type);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Prepare data summary for AI
    const dataSummary = entries.map(e => ({
      date: e.date,
      mood: e.mood,
      energy: e.energy,
      sleep: e.sleepHours,
      sleepQuality: e.sleepQuality,
      medications: e.medications,
      tags: e.tags || [],
      hasSI: e.siTracking?.present || false,
    }));

    let prompt = "";
    
    switch (type) {
      case "patterns":
        prompt = `Analyze this mental health tracking data and identify 3-5 significant patterns or correlations. Focus on actionable insights.

Data: ${JSON.stringify(dataSummary, null, 2)}

Return ONLY valid JSON in this format:
[
  {
    "type": "pattern" or "trigger",
    "title": "Brief title",
    "description": "Detailed explanation with specific numbers",
    "confidence": 0.0-1.0,
    "actionable": true/false,
    "tags": ["relevant", "tags"]
  }
]`;
        break;
        
      case "predictions":
        prompt = `Based on this mental health data, make 2-3 predictions or recommendations for the upcoming days.

Data: ${JSON.stringify(dataSummary, null, 2)}

Return ONLY valid JSON in this format:
[
  {
    "type": "prediction" or "recommendation",
    "title": "Brief title",
    "description": "Detailed forecast or recommendation",
    "confidence": 0.0-1.0,
    "actionable": true/false,
    "tags": ["relevant", "tags"]
  }
]`;
        break;
        
      default:
        prompt = `Analyze this mental health data for ${type} patterns.

Data: ${JSON.stringify(dataSummary, null, 2)}

Return ONLY valid JSON array of insights.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getMockInsights(entries, type);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return getMockInsights(entries, type);
  }
}

export async function answerDataQuestion(entries: DailyEntry[], question: string) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI analysis unavailable offline. Please add your Gemini API key to enable this feature.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Prepare comprehensive data for AI
    const dataSummary = entries.map(e => ({
      date: e.date,
      mood: e.mood,
      energy: e.energy,
      sleepHours: e.sleepHours,
      sleepQuality: e.sleepQuality,
      medications: e.medications,
      tags: e.tags || [],
      hasSI: e.siTracking?.present || false,
      siIntensity: e.siTracking?.intensity,
      diarySnippet: e.diary?.substring(0, 200), // First 200 chars for context
    }));

    const prompt = `You are analyzing mental health tracking data. Answer this question with specific numbers and insights:

Question: ${question}

Data: ${JSON.stringify(dataSummary, null, 2)}

Provide a direct, data-driven answer. Include:
1. Specific statistics (averages, correlations, frequencies)
2. Observable patterns
3. Actionable insights if relevant

Keep the response concise (2-3 paragraphs max) and clinical in tone.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error answering question:", error);
    return "Unable to analyze data. Please try again or check your API key configuration.";
  }
}

function getMockInsights(entries: DailyEntry[], type: string) {
  // Calculate basic statistics
  const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
  const avgSleep = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;
  
  // Sleep-mood correlation
  const goodSleepDays = entries.filter(e => e.sleepHours >= 7);
  const poorSleepDays = entries.filter(e => e.sleepHours < 7);
  const goodSleepMood = goodSleepDays.length > 0 
    ? goodSleepDays.reduce((sum, e) => sum + e.mood, 0) / goodSleepDays.length 
    : 0;
  const poorSleepMood = poorSleepDays.length > 0
    ? poorSleepDays.reduce((sum, e) => sum + e.mood, 0) / poorSleepDays.length
    : 0;
  
  // Tag analysis
  const tagCounts: Record<string, { count: number; avgMood: number; totalMood: number }> = {};
  entries.forEach(e => {
    e.tags?.forEach(tag => {
      if (!tagCounts[tag]) {
        tagCounts[tag] = { count: 0, avgMood: 0, totalMood: 0 };
      }
      tagCounts[tag].count++;
      tagCounts[tag].totalMood += e.mood;
    });
  });
  
  Object.keys(tagCounts).forEach(tag => {
    tagCounts[tag].avgMood = tagCounts[tag].totalMood / tagCounts[tag].count;
  });
  
  const mostCommonTag = Object.entries(tagCounts)
    .sort((a, b) => b[1].count - a[1].count)[0];

  if (type === "patterns") {
    return [
      {
        type: "pattern",
        title: "Sleep-Mood Connection",
        description: `Your mood averages ${goodSleepMood.toFixed(1)}/10 on days with 7+ hours of sleep, compared to ${poorSleepMood.toFixed(1)}/10 on days with less sleep. That's a ${(goodSleepMood - poorSleepMood).toFixed(1)} point difference.`,
        confidence: 0.85,
        actionable: true,
        tags: ["sleep", "mood"],
      },
      mostCommonTag && {
        type: "trigger",
        title: `"${mostCommonTag[0]}" Pattern`,
        description: `This tag appears ${mostCommonTag[1].count} times in your entries with an average mood of ${mostCommonTag[1].avgMood.toFixed(1)}/10.`,
        confidence: 0.72,
        actionable: true,
        tags: [mostCommonTag[0]],
      },
    ].filter(Boolean);
  }
  
  if (type === "predictions") {
    const recentMoodTrend = entries.slice(-3).reduce((sum, e) => sum + e.mood, 0) / 3;
    const recentSleepTrend = entries.slice(-3).reduce((sum, e) => sum + e.sleepHours, 0) / 3;
    
    return [
      {
        type: "prediction",
        title: recentSleepTrend < 7 ? "Energy Dip Likely" : "Stable Period Ahead",
        description: recentSleepTrend < 7
          ? `Your recent sleep average is ${recentSleepTrend.toFixed(1)}h. Based on patterns, energy levels may decrease in the next 2-3 days. Consider prioritizing rest.`
          : `Recent sleep is adequate (${recentSleepTrend.toFixed(1)}h avg). Your current trajectory suggests stable mood and energy levels ahead.`,
        confidence: 0.68,
        actionable: true,
        tags: ["forecast", "sleep"],
      },
    ];
  }
  
  return [];
}
