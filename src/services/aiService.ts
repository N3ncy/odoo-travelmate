// ==========================================
// OpenRouter AI Service
// Uses Claude via OpenRouter API
// ==========================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-sonnet'; // Claude via OpenRouter

// Get API key from env
function getApiKey(): string {
  return import.meta.env.VITE_OPENROUTER_API_KEY || '';
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callOpenRouter(messages: Message[], systemPrompt?: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  const allMessages: Message[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Traveloop App',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: allMessages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `OpenRouter error: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ==========================================
// AI Features
// ==========================================

export interface TripPlanInput {
  destination: string;
  duration: number; // days
  budget: number;
  travelStyle: string[];
  interests: string[];
  groupSize: number;
}

export interface DayPlan {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  tips: string;
  estimatedCost: number;
}

export interface AITripPlan {
  overview: string;
  days: DayPlan[];
  packingTips: string[];
  budgetBreakdown: { category: string; amount: number }[];
  bestTimeToVisit: string;
}

export const aiTripPlannerService = {
  async generateTripPlan(input: TripPlanInput): Promise<AITripPlan> {
    const prompt = `Create a detailed ${input.duration}-day travel itinerary for ${input.destination}.
Group size: ${input.groupSize} people
Total budget: ₹${input.budget.toLocaleString()}
Travel style: ${input.travelStyle.join(', ')}
Interests: ${input.interests.join(', ')}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "overview": "2-3 sentence trip overview",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "tips": "Local tip or insider advice",
      "estimatedCost": 2500
    }
  ],
  "packingTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "budgetBreakdown": [
    { "category": "Accommodation", "amount": 5000 },
    { "category": "Food", "amount": 3000 },
    { "category": "Transport", "amount": 4000 },
    { "category": "Activities", "amount": 3000 },
    { "category": "Shopping", "amount": 2000 },
    { "category": "Miscellaneous", "amount": 1000 }
  ],
  "bestTimeToVisit": "Best time to visit note"
}`;

    const raw = await callOpenRouter([{ role: 'user', content: prompt }]);
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as AITripPlan;
  },

  async chatWithAI(messages: Message[], tripContext?: string): Promise<string> {
    const system = `You are Traveloop AI, an expert travel assistant for India and worldwide destinations. 
${tripContext ? `Current trip context: ${tripContext}` : ''}
Be helpful, concise, and friendly. Focus on practical travel advice, safety tips, local customs, and budget tips. 
Keep responses under 200 words unless detailed itinerary is requested.`;
    return callOpenRouter(messages, system);
  },

  async getDestinationInsights(destination: string): Promise<{
    highlights: string[];
    safetyTips: string[];
    localCuisine: string[];
    hiddenGems: string[];
  }> {
    const prompt = `Give me quick insights about ${destination} for a traveler. Return ONLY valid JSON (no markdown):
{
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "safetyTips": ["tip1", "tip2", "tip3"],
  "localCuisine": ["food1", "food2", "food3"],
  "hiddenGems": ["gem1", "gem2", "gem3"]
}`;
    const raw = await callOpenRouter([{ role: 'user', content: prompt }]);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  },

  async generatePackingList(destination: string, duration: number, activities: string[]): Promise<{
    category: string;
    items: string[];
  }[]> {
    const prompt = `Generate a packing list for a ${duration}-day trip to ${destination} with activities: ${activities.join(', ')}.
Return ONLY valid JSON (no markdown):
[
  { "category": "Clothing", "items": ["item1", "item2"] },
  { "category": "Documents", "items": ["item1", "item2"] },
  { "category": "Electronics", "items": ["item1", "item2"] },
  { "category": "Toiletries", "items": ["item1", "item2"] },
  { "category": "Medicine", "items": ["item1", "item2"] }
]`;
    const raw = await callOpenRouter([{ role: 'user', content: prompt }]);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  },

  async suggestCoTravelers(tripDescription: string, userProfile: string): Promise<string> {
    const system = 'You are a travel companion matchmaker. Suggest what kind of co-traveler would be ideal based on the trip and user profile. Be specific and practical. Keep under 150 words.';
    return callOpenRouter([
      { role: 'user', content: `Trip: ${tripDescription}\nMy profile: ${userProfile}\nWhat kind of travel buddy should I look for?` }
    ], system);
  },
};

export default aiTripPlannerService;
