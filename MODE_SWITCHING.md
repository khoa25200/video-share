# Mode Switching Implementation

## Overview
The website now supports switching between two modes:
- **Phim Girl** (default): Fetches data from the `main` Google Sheet
- **Phim Boy**: Fetches data from the `main_boy` Google Sheet

## Implementation Details

### 1. Mode Context (`lib/mode-context.tsx`)
- Created a React context to manage the current mode state
- Persists mode selection in localStorage
- Provides `mode`, `setMode`, and `modeLabel` to components

### 2. Google Sheets Integration (`lib/google-sheets.ts`)
- Updated all functions to accept an optional `sheetName` parameter
- Functions now support fetching from different sheets based on mode

### 3. API Routes
Updated all API routes to accept a `mode` parameter:
- `/api/movies?mode=girl|boy`
- `/api/highlights?mode=girl|boy`
- `/api/ranking?mode=girl|boy`
- `/api/types?mode=girl|boy`
- `/api/countries?mode=girl|boy`
- `/api/years?mode=girl|boy`
- `/api/movies/[id]?mode=girl|boy`

### 4. Frontend Components
- **Header**: Added mode toggle buttons for both desktop and mobile
- **Movies Page**: Updated to use mode context and pass mode to API calls
- **Movie Detail Page**: Updated to use mode context for fetching movie details

### 5. Sheet Mapping
- **Girl Mode**: Uses `main` sheet for movies, `hight_light` for highlights
- **Boy Mode**: Uses `main_boy` sheet for movies, `hight_light_boy` for highlights

## Usage

### For Users
1. Click the mode toggle buttons in the header
2. Switch between "👩 Phim Girl" and "👨 Phim Boy"
3. The website will automatically fetch data from the appropriate Google Sheet
4. Mode selection is saved in localStorage

### For Developers
```typescript
import { useMode } from '@/lib/mode-context';

function MyComponent() {
  const { mode, setMode, modeLabel } = useMode();
  
  // Use mode in API calls
  const response = await fetch(`/api/movies?mode=${mode}`);
  
  // Switch mode
  setMode('boy'); // or 'girl'
}
```

## Google Sheets Setup
Ensure your Google Sheets has the following sheets:
- `main` - Main movies data for girl mode
- `main_boy` - Main movies data for boy mode  
- `hight_light` - Highlight movies for girl mode
- `hight_light_boy` - Highlight movies for boy mode

All sheets should have the same column structure as the original `main` sheet.
