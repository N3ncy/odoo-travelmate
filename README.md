# TravelMate — AI-Powered Trip Planning & Co-Travel Platform

TravelMate is a full-stack React + TypeScript travel app that lets you **plan itineraries with AI**, track budgets, manage packing lists, and optionally find verified co-travelers for your trip.

---

## ✨ Key Features

### 🤖 AI Trip Planner (Claude via OpenRouter)
Generate complete day-by-day itineraries in seconds. Just enter your destination, duration, budget, and travel style — Claude produces morning/afternoon/evening plans, insider tips, packing suggestions, and a budget breakdown.

### 🗺️ Itinerary & Trip Management
Create and manage trips with full itinerary support, OTP-verified trip starts, real-time location sharing, and group coordination.

### 💸 Budget Tracker
Visual pie and bar charts (Recharts) show expense breakdown by category, per-day planned vs actual spending, and over-budget alerts.

### 🎒 Packing Checklist
Organized by category with check/uncheck, shared item tagging, and add/delete — embedded in each trip's detail page.

### 🔗 Public Trip Share
Share any trip via `/trip-share/:tripId` — read-only beautiful itinerary view, no login required.

### 👥 Find Co-Travelers (Secondary Feature)
Already have your trip planned? Match with verified travelers heading to the same destination.

### 📊 Admin Analytics Dashboard
User growth, trips created, top destinations, travel style distribution — all visualized with Recharts.

---

## 🚀 Setup

```bash
pnpm install
```

### AI Features (OpenRouter)

Create a `.env` file in the project root:

```env
VITE_OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxx
```

Get your key at https://openrouter.ai/keys — uses Claude 3.5 Sonnet.

```bash
pnpm dev
```

---

## 🛣️ Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Home feed | ✅ |
| `/ai-planner` | AI trip planner (Claude) | ✅ |
| `/trips/:id` | Trip detail + packing checklist | ✅ |
| `/budget/:tripId` | Budget tracker with charts | ✅ |
| `/trip-share/:tripId` | Public read-only trip view | ❌ Public |
| `/admin/analytics` | Admin analytics dashboard | ✅ |

---

## 🧱 Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · Recharts · Claude (OpenRouter) · Supabase
