# Mental Health PWA Design Guidelines

## Design Approach
**Reference-Based Approach**: Clinical data collection interfaces (REDCap, medical charting systems)
- Prioritize functional clarity and data integrity over aesthetic flourishes
- Clinical-grade usability with focus on efficiency and accuracy
- Clear information hierarchy for quick daily logging

## Color System
- **Primary**: #1F2937 (dark slate) - Main UI elements, headers
- **Secondary**: #374151 (medium grey) - Secondary containers, dividers
- **Background**: #111827 (very dark) - Page background
- **Text**: #F9FAFB (off-white) - Primary text
- **Accent**: #3B82F6 (blue) - Interactive elements, links, primary actions
- **Warning**: #EF4444 (red) - Alerts, SI tracking, destructive actions

## Typography
- **Font Family**: Inter (with system font stack fallback)
- **Hierarchy**:
  - Headers: 24px-32px, font-weight 600-700
  - Section titles: 18px-20px, font-weight 600
  - Body text: 14px-16px, font-weight 400
  - Form labels: 14px, font-weight 500
  - Small text/metadata: 12px-13px, font-weight 400

## Layout System
- **Spacing Units**: Tailwind units of 2, 4, 6, and 8 (p-2, p-4, p-6, p-8)
- **Container widths**: max-w-4xl for forms, max-w-7xl for dashboards
- **Mobile-first**: Base styles for mobile, breakpoints for tablet/desktop
- **Grid**: 1 column mobile, 2-3 columns desktop for analytics cards

## Core Components

### Daily Entry Form
- Vertical layout with grouped sections
- **Mood/Energy/Sleep Sliders**: 1-10 scale with numerical display, large touch targets (min-h-12)
- **Medication Checkboxes**: Grid layout (2 columns mobile, 3-4 desktop), clear check states
- **Collapsible SI Section**: Warning color header (#EF4444), expandable accordion with privacy-first design
- **Rich Text Diary**: Full-width textarea, min-h-32, auto-save indicator, character count
- **Auto-save indicator**: Small floating badge showing last saved timestamp

### Analytics Dashboard
- **Card-based layout**: Dark cards (#1F2937) on darker background (#111827) with subtle borders
- **Line Charts**: Clean minimal axes, accent color (#3B82F6) for primary data, grid lines in #374151
- **Calendar Heatmap**: Month grid view with color intensity representing mood levels
- **Pattern Alerts**: Bordered notification boxes with warning icons, placed prominently at top
- **Correlation Plots**: Scatter plots with trend lines, clear axis labels

### Navigation
- **Bottom Tab Bar** (mobile): 4-5 icons (Entry, Analytics, Export, Settings)
- **Sidebar** (desktop): Persistent left sidebar with icon + label navigation
- **Header**: Minimal top bar with app name, date selector for views

### Modular Tracking Components
- **Add Module Button**: Prominent "+" button with descriptive label
- **Module Cards**: Expandable sections for social/activities/triggers
- **Custom Fields**: Dynamic form inputs with add/remove capability

### Export Interface
- **Format Selection**: Large radio buttons for JSON/CSV with descriptions
- **Date Range Picker**: Calendar interface with preset options (7 days, 30 days, all time)
- **Filter Checkboxes**: Clear list of exportable data types
- **Export Button**: Large, accent-colored with download icon

## Interactions & States
- **Minimal Animations**: Fade transitions (150-200ms), no elaborate effects
- **Focus States**: High contrast blue outline (ring-2 ring-blue-500)
- **Hover States**: Subtle background lightening (#374151 on hover)
- **Loading States**: Spinner or skeleton screens, no progress bars
- **Touch Targets**: Minimum 44px height for all interactive elements

## Accessibility
- **High Contrast**: Minimum 7:1 ratio for all text
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader**: Proper ARIA labels, semantic HTML structure
- **Color Independence**: Icons and text support color-coded elements

## PWA-Specific Elements
- **Install Prompt**: Subtle banner at top on first visit
- **Offline Indicator**: Small badge showing connection status
- **Sync Status**: Visual feedback when syncing data

## Images
No hero images or decorative imagery. This is a clinical data application prioritizing function over visual aesthetics. Use icons sparingly from a library like Heroicons for:
- Navigation icons
- Module type indicators
- Export format icons
- Alert/warning indicators