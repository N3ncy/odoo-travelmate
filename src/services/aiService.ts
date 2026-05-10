// ==========================================
// Traveloop AI Service
// Primary:  OpenRouter → anthropic/claude-opus-4-5
// Fallback: Google Gemini 2.0 Flash (with Google Search grounding)
// ==========================================

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'anthropic/claude-opus-4-5';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getOpenRouterKey(): string {
  return import.meta.env.VITE_OPENROUTER_API_KEY || '';
}
function getGeminiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

// ─── Clean JSON helper ─────────────────────────────────────────────────────
function cleanJSON(raw: string): string {
  return raw
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim();
}

// ─── Types ─────────────────────────────────────────────────────────────────
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── OpenRouter call ────────────────────────────────────────────────────────
async function callOpenRouter(
  messages: Message[],
  systemPrompt?: string,
  maxTokens = 3000
): Promise<string> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error('OPENROUTER_KEY_MISSING');

  const allMessages: Message[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Traveloop',
    },
    body: JSON.stringify({
      model: PRIMARY_MODEL,
      messages: allMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `OpenRouter ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Gemini call (with optional Google Search grounding) ───────────────────
async function callGemini(
  prompt: string,
  useSearch = false,
  maxTokens = 3000
): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('GEMINI_KEY_MISSING');

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  };

  if (useSearch) {
    body.tools = [{ googleSearch: {} }];
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const MASTER_SYSTEM_PROMPT = `
You are Traveloop AI, an India-first, AI-powered travel planning assistant.
Your primary job is to provide real, actionable, INR-based, India-specific travel intelligence.

RULES:
1. All prices MUST be in INR (₹) — never USD or vague terms like "affordable".
2. ALWAYS name real places (e.g., "Cafe Coffee Day, MG Road, Bengaluru" not "a local cafe").
3. NEVER recommend places outside India unless explicitly asked.
4. Budget tiers (strict):
   - Budget: ₹500-1500/day per person
   - Mid-range: ₹1500-4000/day per person
   - Luxury: ₹4000+/day per person
5. Transport: mention IRCTC/trains for long distances, local buses for budget, Ola/Uber for city.
6. ALWAYS include emergency numbers in city guides.
7. Monsoon warnings: flag destinations that are risky Jun-Sep.
8. If real-time data is needed (hotel prices, train availability), estimate accurately.
9. Return STRICT JSON when requested — no markdown wrappers (\`\`\`json), no preamble.
`;

export interface PageContext {
  page: string;
  tripName?: string;
  destination?: string;
  userPrefs?: any;
}

// ─── Smart AI call: OpenRouter first, Gemini fallback ──────────────────────
async function callAI(
  prompt: string,
  systemPrompt?: string,
  useSearch = false,
  maxTokens = 3000,
  context?: PageContext
): Promise<string> {
  const orKey = getOpenRouterKey();
  const gemKey = getGeminiKey();

  let enrichedSystem = `${MASTER_SYSTEM_PROMPT}\n\n${systemPrompt || ''}`;
  
  if (context) {
    enrichedSystem += `
CURRENT CONTEXT:
- Page: ${context.page}
- Trip: ${context.tripName ?? 'none'}
- Destination: ${context.destination ?? 'unknown'}
- User preferences: ${context.userPrefs ? JSON.stringify(context.userPrefs) : 'none'}
- Date: ${new Date().toLocaleDateString('en-IN')}
`;
  }

  if (orKey) {
    try {
      return await callOpenRouter(
        [{ role: 'user', content: prompt }],
        enrichedSystem,
        maxTokens
      );
    } catch (e) {
      console.warn('[AI] OpenRouter failed, switching to Gemini:', e);
    }
  }

  if (gemKey) {
    const fullPrompt = `${enrichedSystem}\n\n${prompt}`;
    return await callGemini(fullPrompt, useSearch, maxTokens);
  }

  throw new Error('No AI API key configured. Add VITE_OPENROUTER_API_KEY or VITE_GEMINI_API_KEY to .env');
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 1 — CITY EXPLORER
// ══════════════════════════════════════════════════════════════════════════════
export interface CityPlace {
  name: string;
  description: string;
  entryFee: string;
  timings: string;
  tip: string;
}
export interface CityFood {
  dish: string;
  where: string;
  price: string;
  mustTry: string;
}
export interface CityActivity {
  name: string;
  duration: string;
  cost: string;
  difficulty: string;
  description: string;
}
export interface CityStay {
  type: string;
  name: string;
  pricePerNight: string;
  pros: string;
}
export interface DayWisePlan {
  day: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  estimatedCost: string;
}
export interface CityGuide {
  overview: string;
  bestTimeToVisit: string;
  howToReach: string;
  places: CityPlace[];
  food: CityFood[];
  activities: CityActivity[];
  stays: CityStay[];
  dayWisePlan: DayWisePlan[];
  totalBudgetEstimate: { days: number; budget: string; breakdown: string };
  localTips: string[];
  emergencyNumbers: { name: string; number: string }[];
}

export async function getCityGuide(
  cityName: string,
  state: string,
  days = 3,
  travelStyle = 'mid-range'
): Promise<CityGuide> {
  const prompt = `You are an expert India travel guide. Create a COMPREHENSIVE travel guide for ${cityName}, ${state} for ${days} days with ${travelStyle} budget.

Return ONLY valid JSON (no markdown, no explanation):
{
  "overview": "2-3 sentence vivid description of ${cityName}",
  "bestTimeToVisit": "Best months and why",
  "howToReach": "Flight/train/bus options from major Indian cities with approximate costs",
  "places": [
    {
      "name": "Place name",
      "description": "What makes it special",
      "entryFee": "₹XX per person or Free",
      "timings": "9 AM - 6 PM",
      "tip": "Insider tip"
    }
  ],
  "food": [
    {
      "dish": "Dish name",
      "where": "Restaurant/area name",
      "price": "₹XX-XX",
      "mustTry": "Why you must try this"
    }
  ],
  "activities": [
    {
      "name": "Activity name",
      "duration": "2-3 hours",
      "cost": "₹XX per person",
      "difficulty": "Easy/Moderate/Hard",
      "description": "What you'll experience"
    }
  ],
  "stays": [
    {
      "type": "Budget/Mid-range/Luxury",
      "name": "Hotel/Hostel name or area",
      "pricePerNight": "₹XX-XX",
      "pros": "Why this is a good choice"
    }
  ],
  "dayWisePlan": [
    {
      "day": 1,
      "theme": "Day theme",
      "morning": "Morning activity with specific place and time",
      "afternoon": "Afternoon plan with food recommendation",
      "evening": "Evening activity and dinner spot",
      "estimatedCost": "₹XXXX for the day"
    }
  ],
  "totalBudgetEstimate": {
    "days": ${days},
    "budget": "₹XXXX - ₹XXXX total",
    "breakdown": "Stay: ₹X, Food: ₹X, Activities: ₹X, Transport: ₹X"
  },
  "localTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "emergencyNumbers": [
    { "name": "Police", "number": "100" },
    { "name": "Local Tourist Helpline", "number": "1800-XXX-XXXX" }
  ]
}

Include exactly 5-6 places, 5 food items, 5 activities, 3 stay options, and ${days} day-wise plans.
Use REAL places, REAL restaurants, and ACCURATE prices for ${cityName}, India.`;

  const raw = await callAI(prompt, undefined, true, 4000);
  return JSON.parse(cleanJSON(raw)) as CityGuide;
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 2 — AI PACKING LIST
// ══════════════════════════════════════════════════════════════════════════════
export interface PackingCategory {
  category: string;
  emoji: string;
  items: { item: string; essential: boolean; reason?: string }[];
}

export async function generateAIPackingList(
  destination: string,
  duration: number,
  season: string,
  activities: string[]
): Promise<PackingCategory[]> {
  const prompt = `Generate a smart packing list for a ${duration}-day trip to ${destination}, India.
Season/Weather: ${season}
Planned activities: ${activities.join(', ')}

Return ONLY valid JSON array (no markdown):
[
  {
    "category": "Clothing",
    "emoji": "👔",
    "items": [
      { "item": "Light cotton t-shirts x4", "essential": true, "reason": "Hot weather" },
      { "item": "Sun hat", "essential": true, "reason": "Strong sun in ${destination}" }
    ]
  },
  {
    "category": "Documents",
    "emoji": "📄",
    "items": [
      { "item": "Aadhaar / Passport", "essential": true },
      { "item": "Hotel booking confirmation", "essential": true }
    ]
  },
  {
    "category": "Electronics",
    "emoji": "📱",
    "items": []
  },
  {
    "category": "Toiletries",
    "emoji": "🧴",
    "items": []
  },
  {
    "category": "Medicine",
    "emoji": "💊",
    "items": []
  },
  {
    "category": "Accessories",
    "emoji": "🎒",
    "items": []
  }
]

Be specific to ${destination}'s climate, culture, and the activities listed.
Mark essential:true for must-haves, false for nice-to-haves.
Add short reason for unusual items.`;

  const raw = await callAI(prompt, undefined, false, 2000);
  return JSON.parse(cleanJSON(raw)) as PackingCategory[];
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 3 — AI BUDGET PLANNER
// ══════════════════════════════════════════════════════════════════════════════
export interface BudgetCategory {
  category: string;
  emoji: string;
  estimated: number;
  breakdown: string;
  savingTip: string;
}
export interface AIBudgetPlan {
  destination: string;
  duration: number;
  travelStyle: string;
  totalMin: number;
  totalMax: number;
  perDayAvg: number;
  categories: BudgetCategory[];
  moneyTips: string[];
  bestValueAreas: string[];
  avoidSplurging: string[];
  upiTip: string;
}

export async function generateAIBudget(
  destination: string,
  duration: number,
  groupSize: number,
  travelStyle: 'budget' | 'mid-range' | 'luxury'
): Promise<AIBudgetPlan> {
  const prompt = `Create a detailed travel budget plan in INR for ${destination}, India.
Trip duration: ${duration} days
Group size: ${groupSize} person(s)
Travel style: ${travelStyle}

Return ONLY valid JSON (no markdown):
{
  "destination": "${destination}",
  "duration": ${duration},
  "travelStyle": "${travelStyle}",
  "totalMin": 25000,
  "totalMax": 35000,
  "perDayAvg": 4000,
  "categories": [
    {
      "category": "Accommodation",
      "emoji": "🏨",
      "estimated": 12000,
      "breakdown": "₹2000/night × ${duration} nights at mid-range hotels in ${destination}",
      "savingTip": "Book Zostel or similar for budget option"
    },
    {
      "category": "Transport",
      "emoji": "🚗",
      "breakdown": "Train fare + local autos/cabs",
      "estimated": 5000,
      "savingTip": "Use shared cabs and local buses"
    },
    {
      "category": "Food",
      "emoji": "🍜",
      "estimated": 4500,
      "breakdown": "₹300-500/day per person for local food",
      "savingTip": "Eat at local dhabas, avoid tourist restaurants"
    },
    {
      "category": "Activities & Entry Fees",
      "emoji": "🎯",
      "estimated": 3500,
      "breakdown": "Key attractions entry fees + guided tours",
      "savingTip": "Book online to get 10-20% off"
    },
    {
      "category": "Shopping",
      "emoji": "🛍️",
      "estimated": 2000,
      "breakdown": "Local handicrafts and souvenirs",
      "savingTip": "Bargain at local markets, avoid airport shops"
    },
    {
      "category": "Miscellaneous",
      "emoji": "💡",
      "estimated": 1500,
      "breakdown": "Tips, emergency, SIM card, water bottles",
      "savingTip": "Keep 10-15% buffer for unexpected expenses"
    }
  ],
  "moneyTips": [
    "Carry both cash and card - many places in ${destination} are cash-only",
    "Use UPI for local payments wherever possible",
    "Book trains on IRCTC 2-3 months in advance for cheapest fares"
  ],
  "bestValueAreas": ["Street food markets", "Local government-run shops for handicrafts"],
  "avoidSplurging": ["Tourist traps near main attractions", "Hotel restaurants"],
  "upiTip": "PhonePe/GPay accepted at 80% of shops in ${destination}"
}

Use REAL, current prices for ${destination}. Be specific and practical.`;

  const raw = await callAI(prompt, undefined, true, 3000);
  return JSON.parse(cleanJSON(raw)) as AIBudgetPlan;
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 4 — TRIP PLANNER
// ══════════════════════════════════════════════════════════════════════════════
export interface TripPlanInput {
  destination: string;
  duration: number;
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

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 5 — AI CHAT ASSISTANT
// ══════════════════════════════════════════════════════════════════════════════
export async function chatWithTraveloopAI(
  messages: Message[],
  tripContext?: string,
  currentPage?: string
): Promise<string> {
  const context: PageContext = {
    page: currentPage || 'Global Chat',
    tripName: tripContext,
  };

  const system = `You are Traveloop AI's interactive chat assistant.
Guidelines:
- Be friendly, enthusiastic, and conversational (like a knowledgeable Indian travel friend)
- Give specific, actionable advice with real places, prices in INR, and practical tips
- For budget questions, always give a range (budget/mid-range/luxury)
- Use emojis naturally to make responses engaging
- Keep responses concise (under 150 words) unless detailed itinerary is requested
- Always mention the best time to visit when discussing destinations
- Format responses cleanly with brief bullet points where necessary.`;

  // We serialize the messages array into a prompt string for callAI.
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

  return await callAI(prompt, system, false, 1500, context);
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 6 — TRIP PLAN GENERATOR (for AIPlannerPage)
// ══════════════════════════════════════════════════════════════════════════════
export async function generateTripPlan(input: TripPlanInput): Promise<AITripPlan> {
  const prompt = `Create a detailed ${input.duration}-day travel itinerary for ${input.destination}, India.
Group size: ${input.groupSize} people
Total budget: ₹${input.budget.toLocaleString()}
Travel style: ${input.travelStyle.join(', ')}
Interests: ${input.interests.join(', ')}

Return ONLY valid JSON (no markdown):
{
  "overview": "2-3 sentence vivid trip overview",
  "days": [
    {
      "day": 1,
      "title": "Arrival & First Impressions",
      "morning": "Specific morning activity with place name",
      "afternoon": "Specific afternoon plan with food recommendation",
      "evening": "Evening activity and dinner suggestion",
      "tips": "Practical insider tip for the day",
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
  "bestTimeToVisit": "Specific months and why"
}`;

  const raw = await callAI(prompt, undefined, false, 4000);
  return JSON.parse(cleanJSON(raw)) as AITripPlan;
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 7 — DESTINATION INSIGHTS (quick cards)
// ══════════════════════════════════════════════════════════════════════════════
export async function getDestinationInsights(destination: string): Promise<{
  highlights: string[];
  safetyTips: string[];
  localCuisine: string[];
  hiddenGems: string[];
  quickFacts: { label: string; value: string }[];
}> {
  const prompt = `Give quick travel insights about ${destination}, India. Return ONLY valid JSON (no markdown):
{
  "highlights": ["highlight1", "highlight2", "highlight3", "highlight4"],
  "safetyTips": ["tip1", "tip2", "tip3"],
  "localCuisine": ["food1 - description", "food2 - description", "food3 - description"],
  "hiddenGems": ["gem1", "gem2", "gem3"],
  "quickFacts": [
    { "label": "Best Time", "value": "October - March" },
    { "label": "Language", "value": "Hindi, Local" },
    { "label": "Currency", "value": "INR" },
    { "label": "Avg Budget/Day", "value": "₹2000-5000" }
  ]
}`;
  const raw = await callAI(prompt, undefined, false, 1500);
  return JSON.parse(cleanJSON(raw));
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 8 — ACTIVITY SUGGESTIONS per day
// ══════════════════════════════════════════════════════════════════════════════
export async function suggestDayActivities(
  destination: string,
  dayNumber: number,
  theme: string,
  budget: number
): Promise<{ morning: string; afternoon: string; evening: string; tips: string; cost: number }> {
  const prompt = `Suggest specific activities for Day ${dayNumber} in ${destination}, India.
Day theme: ${theme}
Daily budget: ₹${budget}

Return ONLY valid JSON (no markdown):
{
  "morning": "Specific morning activity with place name, timing, and what to expect",
  "afternoon": "Specific afternoon plan including lunch recommendation with restaurant name",
  "evening": "Evening activity + dinner suggestion with specific restaurant and dish",
  "tips": "One practical tip for this day",
  "cost": 2500
}`;
  const raw = await callAI(prompt, undefined, false, 800);
  return JSON.parse(cleanJSON(raw));
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 9 — CO-TRAVELER MATCHING (AI suggestions)
// ══════════════════════════════════════════════════════════════════════════════
export async function suggestCoTravelers(tripDescription: string, userProfile: string): Promise<string> {
  const system = 'You are a travel companion matchmaker for Indian travelers. Be specific and practical. Under 150 words.';
  return callAI(
    `Trip: ${tripDescription}\nMy profile: ${userProfile}\nWhat kind of travel buddy should I look for?`,
    system,
    false,
    400
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Legacy export for backward compatibility
// ══════════════════════════════════════════════════════════════════════════════
export const aiTripPlannerService = {
  generateTripPlan,
  chatWithAI: chatWithTraveloopAI,
  getDestinationInsights,
  generatePackingList: async (destination: string, duration: number, activities: string[]) => {
    const result = await generateAIPackingList(destination, duration, 'current season', activities);
    return result.map(cat => ({ category: cat.category, items: cat.items.map(i => i.item) }));
  },
  suggestCoTravelers,
};

export default aiTripPlannerService;
