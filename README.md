
# GoalSectors 🚀

**Turn Goals into Daily Wins with AI Agents.**

GoalSectors is a productivity PWA that uses structured AI agents to plan your day, build habits, and track progress. Unlike generic chat bots, GoalSectors' AI coach takes direct action on your database—creating tasks, habits, and milestones with strict JSON outputs.

Built for the **AI Agents Hackathon**, focusing on Observability & Reliability.

## 🧐 Problem
Most AI productivity tools are just chat interfaces that give advice but don't *do* anything. They hallucinate, forget context, and require you to copy-paste tasks into a real todo app.

## 💡 Solution
GoalSectors integrates an AI Coach directly into the data layer.
- **Structured Output**: The AI speaks strict JSON, not just text.
- **Direct Action**: It creates tasks, habits, and goals directly in your dashboard.
- **Reliable**: Every run is evaluated for schema validity and sector compliance.
- **Observable**: Full tracing with **Opik** to monitor latency, scores, and helpfulness.

## ✨ Features
- **Daily Check-in**: Track energy, blockers, and priorities.
- **AI Coach**: "Plan my day", "Break down this goal", "Create a reading habit".
- **Product Loop**: Daily usage → Feedback → Better AI suggestions.
- **Ops Dashboard**: Real-time metrics on AI performance (Success Rate, Latency, Helpful %).
- **PWA**: Installable on mobile (iOS/Android) with offline support.
- **Demo Mode**: One-click data seeding for hackathon judges.

## 🏗 Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
- **Data Layer**: Dual-Store Pattern.
  - `LocalStore`: For offline-first/demo speed (localStorage).
  - `SupabaseStore`: For persistent cloud sync (Supabase).
- **AI**: OpenAI GPT-4o-mini (via Vercel AI SDK).
- **Observability**: **Opik** (Comet) for tracing and evaluation.
- **Deployment**: Vercel.

## 🤖 AI Reliability & Opik
We don't trust the LLM blindly.
1. **Strict JSON Schema**: The prompt enforces a rigorous schema for actions (`CREATE_TASK`, `CREATE_HABIT`, etc.).
2. **Guardrails**:
   - `dedupe`: Prevents duplicate tasks.
   - `action_limit`: Caps actions per run to prevent flooding.
   - `clarify`: Asks questions if the request is ambiguous.
3. **Evaluation**: Every run is scored (0-100) based on:
   - Schema Validity (25pts)
   - Sector Compliance (25pts)
   - Usefulness (50pts)
4. **Opik Tracing**: All runs, scores, and user feedback are logged to Opik for analysis.

## 🗺️ Roadmap
See our [detailed roadmap](./ROADMAP.md) for the path to production, including monetization and legal compliance.

## 🚀 How to Run Locally

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/goalsectors.git
   cd goalsectors
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   OPIK_API_KEY=...       # Optional: for tracing
   OPIK_WORKSPACE=...     # Optional
   OPIK_ENABLED=true      # Set to false to disable tracing
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 🎮 Demo Steps (2 Minutes)

1. **Landing**: Visit `/` to see the pitch. Click **Start App**.
2. **Onboarding**: Choose "Productivity" and "Habits" sectors.
3. **Demo Mode**: Go to **Settings** (top right gear) → Click **"Enable Demo Mode"**.
   - *This instantly populates tasks, habits, and AI history.*
4. **Dashboard**:
   - Check off a task.
   - Mark a habit as done (watch streak update).
   - Save a "Daily Check-in".
5. **AI Coach**:
   - Go to **Chat** (bottom nav).
   - Tap "Plan my day" or type "I want to run a 5k".
   - Watch it reply AND create real items (Green "Done: X actions" badge).
6. **Ops Dashboard**:
   - Go to `/ops`.
   - See real-time "System Health" and success rates.
   - Toggle "Ver A" vs "Ver B" to see A/B testing support.
   - Click **Download CSV** to export run data.

## 📱 Mobile Install (PWA)
- **iOS**: Share → Add to Home Screen.
- **Android**: Chrome Menu → Install App.
- Looks and feels like a native app (no browser bar).

---
*Built with ❤️ for the Encode AI Hackathon.*
