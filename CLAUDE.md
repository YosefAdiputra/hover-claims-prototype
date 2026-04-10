# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based clickable prototype for "Hover Claims" - an AI-powered insurance claims estimate automation system. The prototype demonstrates how AI can draft Xactimate-ready repair scopes from Hover inspection data with adjuster review workflows.

**Key characteristics:**
- Single-file React application (App.jsx is ~1400 lines)
- Demonstration prototype with mock data and illustrative content
- Focus on UX workflows rather than backend functionality
- Interview exercise for a Principal PM role

## Tech Stack & Architecture

- **Framework:** React 19.2.4 with Vite 8.0.4
- **Styling:** Tailwind CSS 3.4.17 with custom fonts (Instrument Serif, Geist, Geist Mono)
- **Icons:** lucide-react for all iconography
- **State Management:** React useState hooks (no external state library)
- **Build Tool:** Vite with React plugin
- **Code Quality:** ESLint with React hooks and refresh plugins

**Architecture:**
The application is structured as a single-page app with screen-based navigation managed by React state. The main screens are:
1. Dashboard - Claims queue with AI status indicators
2. Summary - Claim overview with AI analysis summary
3. Review - Three-column evidence review interface (core workflow)
4. Approve - Final review and attestation
5. Confirmation - Submission confirmation

The core workflow centers around the Review screen (lines 535-632 in App.jsx) which implements a three-column layout:
- Left: Categorized line items with confidence indicators
- Center: Evidence panel with photos, 3D model, measurements, and notes
- Right: AI confidence scoring and action controls

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Notes
- No test framework is configured - this is a prototype focused on UX demonstration
- No TypeScript - uses plain JavaScript with JSX
- No backend - all data is mock data defined in App.jsx

## Code Structure

**Key files:**
- `src/App.jsx` - Main application component containing all screens and business logic
- `src/main.jsx` - React application entry point
- `src/index.css` - Tailwind imports and any global styles
- `docs/PRD.md` - Comprehensive Product Requirements Document
- `README.md` - Project overview and getting started guide

**Component organization in App.jsx:**
- Mock data definitions (lines 10-106)
- Main app component with state management (lines 120-209)
- TopNav component (lines 212-254)
- Dashboard screen (lines 257-421)
- Summary screen (lines 423-532)
- Review screen with sub-components (lines 535-946)
- Approve and Confirmation screens (lines 1233-1400)

**State management:**
All state is managed through React hooks in the main component:
- `screen` - Current screen navigation
- `lineItems` - Array of scope line items with status tracking
- `selectedItemId` - Currently selected line item in review
- `editingItem` - Line item being edited in drawer
- Various UI state (evidence tabs, photo lightbox, attestation)

## Development Patterns

**Styling approach:**
- Extensive use of Tailwind utility classes
- Custom CSS for font loading (Google Fonts via CDN)
- Consistent design system with stone color palette
- Responsive design with careful attention to spacing and typography

**Data flow:**
- Props drilling for passing data down component tree
- Event handlers passed down for state updates
- Computed values using useMemo for performance (totals calculation)

**Component conventions:**
- Functional components with hooks
- Clear component boundaries with focused responsibilities
- Inline mock data generation (e.g., SVG illustrations for photos)
- Extensive use of conditional rendering for different states

## Working with this Codebase

**When adding features:**
- Follow the existing screen-based navigation pattern
- Add new mock data at the top of App.jsx if needed
- Maintain the consistent styling approach with Tailwind
- Consider the three-column layout pattern for data-heavy interfaces

**When debugging:**
- Most logic is contained in App.jsx - start there
- Check state values in the main component
- Look for event handlers and how they update state
- Verify Tailwind classes are applying correctly

**When styling:**
- Use the established color palette (primarily stone variants)
- Follow the typography patterns (Instrument Serif for display, Geist for UI)
- Maintain the careful spacing and border patterns
- Use the confidence color system for status indicators

This prototype prioritizes demonstrating UX concepts over production concerns like error handling, accessibility, or performance optimization.