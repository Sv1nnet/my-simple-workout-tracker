# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

My Simple Workout Tracker is a mobile-first workout tracking application built with React and Capacitor. The app supports both online (MongoDB backend) and offline (IndexedDB) modes, allowing users to track workouts without authentication by choosing "Continue without login".

**Tech Stack:**
- **Frontend:** React 18, TypeScript, Vite
- **State Management:** Redux Toolkit with RTK Query
- **UI:** Ant Design 4, Styled Components, D3.js for charts
- **Mobile:** Capacitor 6 (targeting iOS and Android)
- **Storage:** Dual-mode - Express.js/MongoDB backend OR local IndexedDB
- **Testing:** Vitest with jsdom

## Development Commands

### Core Development
```bash
# Web development (gets local IP automatically for mobile testing)
npm run dev

# Platform-specific development
npm run dev-web       # Web-only development
npm run dev-ios       # iOS development
npm run dev-android   # Android development

# Build for production
npm run build

# Preview production build
npm preview
```

### Testing
```bash
# Run all tests with Vitest
npm test
```

### Linting
```bash
# Run ESLint (follows airbnb-typescript rules)
npm run lint
```

### Capacitor Commands
```bash
# Sync web assets to native platforms
npm run cap:sync

# Run on devices
npm run cap:run:android
npm run cap:run:ios

# Open in native IDEs
npm run cap:open:android    # Opens Android Studio
npm run cap:open:ios        # Opens Xcode
```

### Docker (Work in Progress)
```bash
npm run docker-build:prod:local
npm run docker-build:prod
```

## Architecture

### Dual Storage Strategy

The app implements a dual-storage pattern that allows running with or without authentication:

1. **Authenticated Mode:** Data persists to Express.js backend with MongoDB
2. **No-Auth Mode:** Data persists locally to IndexedDB (browser storage)

**Storage abstraction:** `src/app/store/utils/baseQueryWithReauth.ts` intercepts RTK Query requests and routes them to either the backend API or local IndexedDB handlers (in `src/app/store/utils/noAuthHandlers/`) based on `isNoAuthLogin` flag stored in localStorage.

### State Management Architecture

**Store Location:** `src/app/store/`

The Redux store uses a slice-based architecture with RTK Query for API communication:

- **Slices:** `auth`, `profile`, `exercise`, `workout`, `activity`, `muscleGroup`, `settings`, `config`
- Each slice has:
  - State slice file (e.g., `slices/exercise/index.ts`)
  - API slice file (e.g., `slices/exercise/api.ts`) using RTK Query
  - Type definitions (e.g., `slices/exercise/types.ts`)

**Key patterns:**
- All API slices use `getBaseQueryWithReauth()` which handles token refresh and routes requests to backend OR IndexedDB
- Tag-based cache invalidation (e.g., `EXERCISE_TAG_TYPES.EXERCISE_LIST`)
- `keepUnusedDataFor: Infinity` on most API slices for offline-first behavior

### Routing

**Router Location:** `src/router/index.tsx`

Uses React Router v6 with a single `AuthLayout` wrapper. Main routes:
- `/activities` (also root `/`)
- `/workouts`
- `/exercises`
- `/profile`
- `/settings`

**Route helper:** `routes` object provides type-safe route generation, e.g., `routes.exercises.item(exerciseId)()` 

### Path Aliases

The project uses extensive path aliasing (configured in `vite.config.ts` and `vitest.config.ts`):

```typescript
'@'         -> project root
'src'       -> ./src
'app'       -> ./src/app
'pages'     -> ./src/pages
'components' -> ./src/app/components
'layouts'   -> ./src/layouts
'utils'     -> ./src/utils
'store'     -> ./src/app/store
'constants' -> ./src/app/constants
'api'       -> ./src/pages/api
'models'    -> ./src/models
```

Always use these aliases instead of relative imports.

### Component Organization

Components are organized in `src/app/components/` by feature:
- `activity_stopwatch/` - Activity timing UI
- `timer/`, `timer_view/`, `stopwatch/` - Timer components
- `calendar/`, `date_picker/`, `time_picker/` - Date/time inputs
- `virtual_list/`, `endless_scrollable_container/` - List virtualization
- `swipe_actions/`, `swipeable/` - Touch gestures
- `auth_forms/` - Login/signup forms

### Capacitor Plugins

**Plugin Location:** `src/plugins/`

Custom Capacitor plugins provide native functionality:

1. **Activity Plugin** (`activity_plugin/ActivityPlugin.ts`): 
   - Manages foreground service for workout tracking
   - Shows persistent notifications during activities
   - Handles stopwatch/timer for activities, rests, and breaks
   - See `ACTIVITY_SERVICE.MD` for detailed requirements

2. **Timer Plugin** (`timer_plugin/`): Timer utilities

3. **Settings Plugin** (`settings/`): Native settings management

### IndexedDB Layer

**Location:** `src/app/utils/IndexedDBUtils.ts`

Custom IndexedDB wrapper used when running in no-auth mode:
- Tables: `exercises`, `workouts`, `activities`, `config`, `muscleGroups`, `settings`
- Initialized via `src/app/store/utils/BrowserDB/index.ts`
- Can be dropped/reset via `browserDb.dropDB()`

## Code Style Guidelines

**ESLint Configuration:** Follows `airbnb-typescript` preset with modifications:

- **No semicolons:** Code uses semicolon-free style
- **Array spacing:** `[ 1, 2, 3 ]` not `[1, 2, 3]`
- **Max line length:** 200 characters
- **Import extensions:** Never use file extensions in imports
- **Component self-closing:** Always self-close when no children
- **Unused variables:** Must be prefixed with `_` if needed

## Important Constraints

1. **No semicolons:** All code follows semicolon-free style
2. **Path aliases required:** Always use configured path aliases, never relative imports outside same directory
3. **Array bracket spacing:** Always include spaces: `[ item ]` not `[item]`
4. **Capacitor app lifecycle:** The app handles Android back button in `src/App.tsx` - don't override without considering this
5. **Day.js plugins:** The app uses `isoWeek`, `duration`, `utc`, and `timezone` plugins - they're already configured in `App.tsx`
6. **Background service constraints:** The Activity Plugin must maintain foreground service with non-dismissible notifications per Android requirements (see `ACTIVITY_SERVICE.MD`)

## Testing

Tests use Vitest with jsdom environment. Setup file: `setupTests.ts`

**Test location pattern:** Place tests in `__tests__/` subdirectories, e.g., `src/app/hooks/numberInputHooks/__tests__/index.test.ts`

**Running specific tests:**
```bash
npm test -- [pattern]
```

## Environment Setup

1. Copy `EXAMPLE.env.local` to `.env.local`
2. Configure environment variables as needed
3. The app can run without backend configuration if using no-auth mode

## Backend Repository

Backend is separate: https://github.com/Sv1nnet/mswt-server

The app is designed to work standalone without the backend by choosing "Continue without login" which uses IndexedDB.

## Notes

- The project was initially built with Next.js but migrated to Vite for better mobile performance
- Backend code is intentionally less polished as frontend is the primary focus
- Migration to Capacitor is ongoing to overcome browser background work limitations
- The app uses local IP detection (`osascript` on macOS) in dev mode for mobile device testing
