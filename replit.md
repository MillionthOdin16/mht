# MindTrack - Mental Health Data Tracking PWA

## Overview
A clinical-grade Progressive Web App (PWA) for structured mental health data tracking. The application focuses on data capture, analysis, and export for external AI processing, without providing therapy advice.

## Project Purpose
Enable users to track daily mental health metrics (mood, energy, sleep, medications, suicidal ideation), maintain a diary, log modular data (social interactions, activities, triggers), visualize patterns through analytics dashboards, generate AI-powered summaries via Gemini API, and export comprehensive data in JSON/CSV formats.

## Current State
**Phase:** MVP Complete ✅
- ✅ Data schemas defined for all tracking entities
- ✅ Design tokens configured for clinical dark mode interface
- ✅ All core pages and components built and tested:
  - Daily Entry form with sliders, checkboxes, collapsible SI tracking, auto-save diary
  - Analytics dashboard with line charts, correlation plots, calendar heatmaps, pattern alerts
  - AI Summary page with date range selection and structured output
  - Export interface with format selection (JSON/CSV) and field filtering
- ✅ Sidebar navigation with responsive layout
- ✅ PWA manifest configured
- ✅ Complete backend implementation:
  - All API endpoints (entries, medications, social interactions, activities, triggers)
  - Gemini AI integration for clinical summaries
  - JSON/CSV export functionality
  - In-memory storage (MemStorage)
- ✅ Full integration with TanStack Query
- ✅ End-to-end testing passed

**Known Limitations:**
- ⚠️ Using in-memory storage - data is lost on server restart
- ⚠️ No user authentication - single-user application
- ⚠️ No offline support (service worker not implemented)

**Recommended Next Steps:**
1. **Database Migration:** Replace in-memory storage with PostgreSQL for persistent data
2. **User Authentication:** Add multi-user support with Replit Auth
3. **Service Worker:** Implement offline-first PWA capabilities
4. **Production Deployment:** Publish to production environment

## Recent Changes
- **2024-11-12:** Complete MVP implementation
  - ✅ Created comprehensive data models for all tracking entities
  - ✅ Configured dark mode clinical styling (dark slate #1F2937, blue accent #3B82F6, red warning #EF4444)
  - ✅ Built all frontend pages with accessibility and responsive design
  - ✅ Implemented complete backend with Express API, in-memory storage, and Gemini integration
  - ✅ Connected frontend to backend using TanStack Query
  - ✅ End-to-end testing completed successfully
  - ⚠️ Currently using in-memory storage (data not persisted across restarts)

## User Preferences
- **Design Approach:** Clinical data collection interface inspired by REDCap and medical charting systems
- **Color Scheme:** Dark mode default with high contrast for accessibility
- **Priority:** Functional clarity and data integrity over aesthetic flourishes
- **Features:** Comprehensive tracking with modular system, AI analysis, and data portability

## Project Architecture

### Tech Stack
- **Frontend:** React + TypeScript, Wouter (routing), TanStack Query, Shadcn UI, Tailwind CSS
- **Backend:** Express.js, In-memory storage (MemStorage)
- **AI Integration:** Google Gemini API (gemini-2.5-flash model)
- **Charts:** Recharts for data visualization
- **PWA:** Manifest configured for installable experience

### File Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/ (Shadcn components)
│   │   └── app-sidebar.tsx
│   ├── pages/
│   │   ├── daily-entry.tsx (core metrics, medications, SI tracking, diary, modules)
│   │   ├── analytics.tsx (trends, correlations, heatmaps, alerts)
│   │   ├── ai-summary.tsx (date range selection, AI generation)
│   │   └── export.tsx (format selection, filtering)
│   ├── App.tsx (sidebar layout, routing)
│   └── index.css (clinical dark mode tokens)
├── public/
│   └── manifest.json (PWA configuration)
shared/
└── schema.ts (TypeScript types, Zod schemas for all entities)
server/
├── routes.ts (Complete API endpoints for all CRUD operations)
├── storage.ts (In-memory storage implementation with IStorage interface)
└── gemini.ts (AI clinical summary generation)
```

### Data Model
- **DailyEntry:** Core metrics (mood/energy/sleep 1-10), medications array, SI tracking object, diary text
- **SocialInteraction:** Type, quality rating, notes (linked to daily entry)
- **Activity:** Name, duration, enjoyment rating, notes (linked to daily entry)
- **Trigger:** Name, severity rating, notes (linked to daily entry)
- **Medication:** Master list of available medications

### Design System
- **Colors:** HSL-based with CSS variables for dark mode
  - Background: 222 47% 11% (very dark)
  - Card: 222 47% 14% (dark slate)
  - Primary: 217 91% 60% (blue accent)
  - Destructive: 0 84% 60% (red for warnings/SI)
- **Typography:** Inter font, clear hierarchy (24-32px headers, 14-16px body)
- **Spacing:** Consistent units (p-2, p-4, p-6, p-8)
- **Components:** Shadcn UI with clinical styling, min-h-12 for touch targets

### Key Features Implemented
1. **Daily Entry Form:**
   - 1-10 sliders for mood/energy/sleep with visual feedback
   - Medication checkboxes (grid layout)
   - Collapsible SI section with privacy-first design (destructive color scheme)
   - Auto-saving diary with character count
   - Modular tracking (social, activities, triggers) with add/remove functionality

2. **Analytics Dashboard:**
   - Summary cards with trend indicators
   - Multi-line chart for mood/energy/sleep over time
   - Scatter plot for correlation analysis
   - 35-day calendar heatmap with color intensity
   - Pattern detection alerts

3. **AI Summary:**
   - Date range picker with presets (7/30/90 days)
   - AI generation using Gemini API
   - Structured clinical output format
   - Download capability

4. **Export Interface:**
   - JSON/CSV format selection with descriptions
   - Date range filtering
   - Granular field selection checkboxes
   - All-time export option

## Dependencies
- @google/genai (Gemini API)
- @tanstack/react-query (data fetching)
- @radix-ui/* (UI primitives)
- recharts (data visualization)
- date-fns (date manipulation)
- wouter (routing)
- zod (validation)
- drizzle-orm + drizzle-zod (schema management)

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI summary generation
- `SESSION_SECRET`: Session management (pre-configured)

## Development Notes
- Dark mode is default (class="dark" on html element)
- All interactive elements have data-testid attributes for testing
- Responsive design: mobile-first with breakpoints for desktop
- Accessibility: High contrast (7:1 ratio), keyboard navigation, ARIA labels
- PWA ready: Manifest configured, offline capability pending service worker implementation
