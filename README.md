# Mental Health Data Tracker

This is a structured mental health data tracking web app — a **PWA** focused on **capture, analysis, and export** for external AI processing. **No therapy, no advice, no positivity.** Just **data**.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Gemini API Key Setup

This application uses the Gemini API for the AI Summary feature. To use this feature, you will need to provide your own API key.

1. Create a `.env.local` file in the root of the project.
2. Add your API key to the file as follows:

   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

   **Note:** The API key is stored locally and is never hardcoded into the application.

## PWA Installation

This application is a Progressive Web App (PWA) and can be installed on your device for offline use.

- **On Desktop:** Look for the install icon in your browser's address bar.
- **On Mobile:** Use the "Add to Home Screen" feature in your browser's menu.

## Export Format Specs

The application allows you to export your data in two formats:

- **JSON:** A structured format that is ideal for use with AI and other data analysis tools.
- **CSV:** A standard spreadsheet format that can be opened with any spreadsheet software.

---

## Disclaimer

This tool logs data only. It is not a substitute for professional care. In crisis, contact a hotline or professional immediately.
