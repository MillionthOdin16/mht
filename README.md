# MindTrack - Mental Health Data Tracking PWA

A clinical-grade Progressive Web App (PWA) for structured mental health data tracking. Focused on **data capture, analysis, and export** for external AI processing. **No therapy, no advice, no positivity.** Just **data**.

## 🚨 Important Disclaimer

**This tool logs data only. It is not a substitute for professional care.**

MindTrack is designed to help you track mental health metrics for personal awareness and to facilitate discussions with healthcare providers. This application:
- Does NOT provide medical advice, diagnosis, or treatment
- Does NOT replace therapy or professional mental health care
- Is NOT monitored by healthcare professionals

### In Crisis or Emergency
If you are experiencing a mental health crisis or having thoughts of self-harm or suicide, please:
- Call emergency services: **911**
- Call the National Suicide Prevention Lifeline: **988**
- Contact a mental health professional immediately

## ✨ Features

### Daily Entry (Fast, Auto-Saving)
- **Core Metrics** - Mood, energy (1-10 sliders), sleep hours (0-24) and quality (1-10)
- **Medications** - Checkboxes for Bupropion 300mg, Venlafaxine 225mg, Adderall 30mg XR
- **Suicidal Ideation (SI)** - Privacy-first collapsed section with intensity tracking
- **Diary** - Unlimited rich text with character count
- **Modular Tracking** - Social interactions, activities, anxiety triggers

### Visualization Dashboard
- **Line Charts** - Mood, energy, sleep trends over time
- **Correlation Scatter Plots** - Mood vs sleep hours relationship
- **Calendar Heatmap** - 35-day mood intensity visualization
- **Pattern Alerts** - Automated detection of concerning trends

### AI Summary (Gemini API)
- Generate clinical summaries for custom date ranges
- Structured output format with key metrics
- Copy-to-clipboard functionality
- Graceful offline degradation

### Export System
- **Formats** - JSON (structured, AI-ready) and CSV
- **Filtering** - Date range selection, field inclusion/exclusion
- **Comprehensive** - All metrics, diary entries, and modular data

### PWA Capabilities
- **Installable** - Add to home screen on mobile/desktop
- **Offline Support** - Service worker for cached functionality
- **Dark Mode** - Clinical dark theme by default
- **Mobile-First** - Responsive design, <2s load time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key (optional, for AI summaries)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mht
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file (see .env.example for template)
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI summary generation
GEMINI_API_KEY=your_gemini_api_key_here

# Session management (auto-generated if not provided)
SESSION_SECRET=your_secret_key_here

# Optional: Production settings
NODE_ENV=production
PORT=5000
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

**Note:** AI summaries will gracefully fail if no API key is provided, but all other features will work normally.

## 🏗️ Tech Stack

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Shadcn UI** + **Tailwind CSS** - Component library and styling
- **Recharts** - Data visualization
- **React Hook Form** + **Zod** - Form management and validation

### Backend
- **Express.js** - API server
- **In-memory storage** - Lightweight data storage (demo mode)
- **Google Gemini AI** - Clinical summary generation

### PWA
- **Vite PWA Plugin** - Service worker generation
- **Workbox** - Offline caching strategies
- **Web App Manifest** - Installable app configuration

## 📊 Data Model

### Daily Entry
```typescript
{
  date: string;           // YYYY-MM-DD
  mood: number;           // 1-10 scale
  energy: number;         // 1-10 scale
  sleepHours: number;     // 0-24 hours
  sleepQuality: number;   // 1-10 scale
  medications: string[];  // Array of medication names
  siTracking: {
    present: boolean;
    intensity?: number;   // 1-10 if present
    thoughts?: string;
  };
  diary: string;
}
```

### Export Formats

**JSON Example:**
```json
{
  "entries": [
    {
      "date": "2025-11-12",
      "mood": 6,
      "energy": 7,
      "sleepHours": 7.5,
      "sleepQuality": 6,
      "medications": ["Bupropion 300mg", "Venlafaxine 225mg"],
      "siTracking": { "present": false },
      "diary": "Good day overall..."
    }
  ]
}
```

**CSV Format:** Flat structure with core metrics and diary text

## 🎨 Design System

### Color Palette
- **Background:** `#111827` (very dark)
- **Card:** `#1F2937` (dark slate)
- **Primary/Accent:** `#3B82F6` (blue)
- **Destructive/Warning:** `#EF4444` (red, for SI tracking)
- **Text:** `#F9FAFB` (off-white)

### Typography
- **Font:** Inter with system font fallback
- **Headers:** 24-32px, weight 600-700
- **Body:** 14-16px, weight 400
- **Small/Meta:** 12-13px, weight 400

### Accessibility
- High contrast (7:1 ratio minimum)
- Keyboard navigation support
- ARIA labels for screen readers
- Minimum 44px touch targets

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share/menu button
3. Select "Add to Home Screen"
4. Confirm installation

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install" or use the browser menu
3. The app will open in its own window

## 🔒 Privacy & Data

### Data Storage
- **Local Storage:** Used for disclaimer acceptance and settings
- **In-Memory:** Current demo uses in-memory storage (data lost on restart)
- **Future:** IndexedDB for persistent local storage (no server storage)

### No Tracking
- No analytics or telemetry
- No data sent to external servers (except AI summaries via Gemini API)
- No user authentication required

### Optional Features (Not Yet Implemented)
- **PIN Lock:** 4-6 digit PIN on app open
- **Encrypted Backup:** AES-256 encryption with user-provided passphrase

## 🛠️ Development

### Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main app pages
│   │   ├── lib/            # Utilities and helpers
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Root component
│   └── public/             # Static assets
├── server/
│   ├── index.ts           # Express server entry
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage layer
│   └── gemini.ts          # AI integration
├── shared/
│   └── schema.ts          # TypeScript types and Zod schemas
└── vite.config.ts         # Build configuration
```

### Available Scripts

```bash
# Development
npm run dev           # Start dev server with hot reload

# Production
npm run build         # Build for production
npm start             # Start production server

# Type Checking
npm run check         # Run TypeScript compiler

# Database (for future use)
npm run db:push       # Push schema changes to database
```

## 🐛 Known Limitations

- **In-Memory Storage:** Data is lost on server restart (demo mode)
- **No User Authentication:** Single-user application
- **No Multi-Device Sync:** Data stays on one device
- **Basic Pattern Detection:** Alerts use simple heuristics

## 🚧 Roadmap

### Planned Features
- [ ] IndexedDB for persistent client-side storage
- [ ] Enhanced pattern detection algorithms
- [ ] Word cloud visualization for diary entries
- [ ] PIN lock for app privacy
- [ ] Encrypted backup/export
- [ ] Custom field definitions
- [ ] Multi-user support with authentication
- [ ] Database persistence (PostgreSQL)

## 🤝 Contributing

This is a personal mental health tracking tool. For feature requests or bug reports, please:
1. Open an issue describing the problem or suggestion
2. Include screenshots if relevant
3. Specify your device/browser if reporting bugs

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support Resources

### Crisis Support
- **National Suicide Prevention Lifeline:** 988 or 1-800-273-8255
- **Crisis Text Line:** Text HOME to 741741
- **International:** [Find a Helpline](https://findahelpline.com/)

### Mental Health Resources
- **NAMI** (National Alliance on Mental Illness): https://www.nami.org
- **MentalHealth.gov:** https://www.mentalhealth.gov
- **SAMHSA National Helpline:** 1-800-662-4357

---

**Remember:** This tool is designed to support your mental health journey, not replace professional care. Always consult with qualified healthcare providers for medical advice and treatment.
