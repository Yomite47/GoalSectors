# Product Roadmap: GoalSectors

This document outlines the path from Hackathon MVP to a scalable, production-ready product.

## ✅ Phase 1: MVP Core (Completed)
- [x] **Core Features**: Daily Check-ins, Task Management, Habit Tracking.
- [x] **AI Coach Integration**: Structural JSON output, direct database actions.
- [x] **Local-First Architecture**: Works offline with `localStorage`.
- [x] **Observability**: Opik integration for tracing and evaluation.
- [x] **PWA Support**: Installable on mobile devices.

## 🚧 Phase 2: Production Readiness (Current Focus)
Goal: Make the app secure, monetizable, and legally compliant.

### 1. Monetization ($1/mo Premium)
- [x] **UI/UX**: Premium Modal and Upgrade entry points.
- [ ] **Stripe Integration**:
  - Set up Stripe Customer Portal.
  - Implement Webhooks for subscription status updates.
  - Replace mock `isPremium` logic with real DB field synced from Stripe.
- [ ] **Gate Features**:
  - Restrict AI Coach to 5 messages/day for free users.
  - Restrict "Advanced Analytics" to Premium.

### 2. Authentication & Persistence
- [ ] **Supabase Auth**: Replace simple ID generation with real Email/Google Auth.
- [ ] **Cloud Sync**: Ensure `SupabaseStore` is fully robust and syncs with `LocalStore` (conflict resolution).
- [ ] **User Data Protection**: Ensure RLS (Row Level Security) policies are strict.

### 3. Legal & Compliance
- [ ] **Privacy Policy**: Draft and publish (required for App Store/Auth).
- [ ] **Terms of Service**: Define usage rights and AI disclaimers.
- [ ] **Cookie Consent**: Simple banner if tracking scripts are added.

### 4. Infrastructure
- [x] **Type Safety**: Fix all `npm run build` TypeScript errors.
- [ ] **CI/CD**: Automated build and test on PRs.
- [ ] **Error Monitoring**: Sentry integration for frontend errors.

## 🚀 Phase 3: Growth & Features
- [ ] **Social Features**: "Sectors" (Groups) to share goals with friends.
- [ ] **Email/Push Notifications**: Reminders for check-ins and habit streaks.
- [ ] **Advanced AI**:
  - Voice Mode (speak to coach).
  - Weekly Review generation.
- [ ] **Marketing**: Landing page with SEO optimization.

## 📅 Timeline
- **Week 1**: Fix Types, Add Legal Pages, Mock Payments (Done).
- **Week 2**: Stripe Integration & Supabase Auth.
- **Week 3**: Beta Launch to 50 users.
