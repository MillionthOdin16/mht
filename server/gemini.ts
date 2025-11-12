import { GoogleGenAI } from "@google/genai";
import type { CompleteEntry } from "@shared/schema";
import { format } from "date-fns";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateClinicalSummary(
  entries: CompleteEntry[],
  startDate: string,
  endDate: string
): Promise<string> {
  if (entries.length === 0) {
    return "No data available for the selected date range.";
  }

  const dataContext = entries.map(entry => ({
    date: entry.date,
    mood: entry.mood,
    energy: entry.energy,
    sleep: entry.sleep,
    medications: entry.medications,
    siTracking: entry.siTracking,
    diary: entry.diary?.substring(0, 200),
    socialInteractionsCount: entry.socialInteractions.length,
    activitiesCount: entry.activities.length,
    triggersCount: entry.triggers.length,
  }));

  const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
  const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
  const avgSleep = entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length;

  const medicationDays = entries.filter(e => e.medications && e.medications.length > 0).length;
  const adherenceRate = (medicationDays / entries.length) * 100;

  const siPresent = entries.some(e => e.siTracking?.present);

  const prompt = `You are a clinical mental health data analyst. Generate a comprehensive clinical summary report based on the following mental health tracking data.

**Date Range:** ${startDate} to ${endDate}
**Total Days Tracked:** ${entries.length}

**Aggregated Metrics:**
- Average Mood: ${avgMood.toFixed(1)}/10
- Average Energy: ${avgEnergy.toFixed(1)}/10
- Average Sleep Quality: ${avgSleep.toFixed(1)}/10
- Medication Adherence: ${adherenceRate.toFixed(0)}%
- Suicidal Ideation Present: ${siPresent ? "Yes" : "No"}

**Daily Data:**
${JSON.stringify(dataContext, null, 2)}

Generate a structured clinical summary report with the following sections:
1. **Executive Summary** - Brief overview of mental health status
2. **Key Findings** - Main patterns and trends identified
3. **Detailed Analysis** - Breakdown of mood, energy, sleep patterns
4. **Medication Adherence** - Analysis of medication compliance
5. **Risk Assessment** - Any concerning patterns or flags (especially SI)
6. **Social and Activities** - Overview of social engagement and activity levels
7. **Clinical Recommendations** - Actionable suggestions based on data

Keep the tone professional and clinical. Focus on objective observations from the data. Do not provide direct medical advice or diagnoses.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary. Please try again.";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate AI summary. Please check your API key and try again.");
  }
}
