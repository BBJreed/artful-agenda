\# Quick Start Guide



\## Prerequisites



\- Node.js 18+ installed

\- npm or yarn package manager

\- Modern browser (Chrome, Firefox, Safari, Edge)



\## Initial Setup



1\. \*\*Install Dependencies\*\*

```bash

cd /home/claude/artful-agenda

npm install

```



2\. \*\*Start Development Server\*\*

```bash

npm run dev

```



The application will open at `http://localhost:3000`



\## Key Application Features



\### 1. Calendar Navigation

\- Use \*\*Prev/Next\*\* buttons to navigate months

\- Click date cells to select specific days

\- Events display automatically in their corresponding dates



\### 2. Layer Visibility Controls

Toggle visibility of different rendering layers:

\- \*\*Events\*\*: Calendar appointments and scheduled items

\- \*\*Decorations\*\*: Visual embellishments and stickers

\- \*\*Handwriting\*\*: Hand-drawn notes and sketches

\- \*\*Tasks\*\*: Todo items with checkboxes



\### 3. Visual Themes

Select from predefined themes in the dropdown:

\- \*\*Minimal\*\*: Clean, professional grid layout

\- \*\*Elegant\*\*: Gradient background with subtle patterns

\- \*\*Vibrant\*\*: Colorful dots and energetic styling

\- \*\*Professional\*\*: Business-focused design

\- \*\*Pastel Dreams\*\*: Soft gradients with wave patterns



\### 4. Drawing Tool

\- Click \*\*"Show Drawing"\*\* to open handwriting panel

\- Use color picker to change stroke color

\- Adjust stroke width with slider

\- Draw with mouse or stylus (pressure-sensitive on supported devices)

\- Clear canvas to start over



\### 5. Zoom Control

\- Use zoom slider (50% - 200%)

\- Coordinate-based positioning maintains layout integrity

\- All layers scale proportionally



\### 6. PDF Export

\- Click \*\*"Export PDF"\*\* button

\- Requires premium subscription (demo currently allows access)

\- Generates high-resolution, print-ready PDF with all visible layers



\## Adding Calendar Events



Currently, events can be added programmatically through the store:

```typescript

import { useStore } from './stores/appStore';



const { addEvent } = useStore();



addEvent({

&nbsp; id: 'event-1',

&nbsp; title: 'Team Meeting',

&nbsp; startTime: new Date('2025-11-20T10:00:00'),

&nbsp; endTime: new Date('2025-11-20T11:00:00'),

&nbsp; sourceCalendar: 'native',

&nbsp; color: '#3b82f6',

&nbsp; timestamp: Date.now()

});

```



\## Connecting External Calendars



To enable Google Calendar sync:

```typescript

const config: CalendarSyncConfig = {

&nbsp; provider: 'google',

&nbsp; apiEndpoint: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',

&nbsp; accessToken: 'YOUR\_GOOGLE\_ACCESS\_TOKEN',

&nbsp; refreshToken: 'YOUR\_GOOGLE\_REFRESH\_TOKEN',

&nbsp; conflictResolution: 'timestamp'

};



// Call from App.tsx setupCalendarSync method

await setupCalendarSync(config);

```



\*\*Note\*\*: You'll need to set up OAuth 2.0 credentials in Google Cloud Console to obtain access tokens.



\## Development Tips



\### Hot Module Replacement

Vite provides instant updates during development. Save any file to see changes immediately.



\### TypeScript Errors

Check TypeScript compilation:

```bash

npx tsc --noEmit

```



\### State Debugging

Zustand store can be inspected in React DevTools. All state changes log to console in development mode.



\### Adding Custom Themes



Create a new theme in `themeManager.ts`:

```typescript

const customTheme: VisualTheme = {

&nbsp; id: 'custom-dark',

&nbsp; name: 'Dark Mode',

&nbsp; svgTemplate: `<svg>...</svg>`,

&nbsp; cssVariables: {

&nbsp;   'background-color': '#1f2937',

&nbsp;   'grid-color': '#374151',

&nbsp;   'text-primary': '#f9fafb',

&nbsp;   'text-secondary': '#d1d5db',

&nbsp;   'accent-color': '#60a5fa'

&nbsp; },

&nbsp; fontPairings: {

&nbsp;   header: 'Roboto, sans-serif',

&nbsp;   body: 'Roboto, sans-serif'

&nbsp; }

};

```



\## Building for Production

```bash

npm run build

```



Creates optimized bundle in `dist/` directory.



Preview production build:

```bash

npm run preview

```



\## Common Issues



\### Port Already in Use

If port 3000 is occupied, modify `vite.config.ts`:

```typescript

server: {

&nbsp; port: 3001  // Change to available port

}

```



\### WebSocket Connection Fails

The demo uses a placeholder WebSocket URL. For production, replace with actual sync service endpoint in `App.tsx`:

```typescript

const rtSync = new RealtimeSyncService('wss://your-actual-sync-server.com', token);

```



\### PDF Export Not Working

Ensure jsPDF and svg2pdf.js are properly installed:

```bash

npm install jspdf svg2pdf.js

```



\## Architecture Deep Dive



For detailed architectural explanations, see `README.md` which covers:

\- Rendering pipeline internals

\- State management patterns

\- Synchronization mechanisms

\- Vector path mathematics

\- Theme system design



\## Next Steps



1\. \*\*Implement Event Creation UI\*\*: Add modal or sidebar for creating events through the interface

2\. \*\*Decoration Library\*\*: Build component for browsing and placing stickers/decorations

3\. \*\*Task Management\*\*: Create task input interface with date assignment

4\. \*\*Calendar Integration\*\*: Set up OAuth flows for Google/Apple/Outlook

5\. \*\*Backend Services\*\*: Implement actual sync server with WebSocket support

6\. \*\*Mobile Optimization\*\*: Add touch gestures and responsive layouts

7\. \*\*Offline Support\*\*: Implement service workers for offline-first architecture



\## Support



For questions or issues:

1\. Check inline code comments for implementation details

2\. Review TypeScript type definitions in `src/types/index.ts`

3\. Examine service implementations in `src/services/`

4\. Test features in isolation using React DevTools

