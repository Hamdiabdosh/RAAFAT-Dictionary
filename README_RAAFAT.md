# RAAFAT Dictionary - Harari Language PWA

A beautiful, modern Progressive Web Application (PWA) for exploring and contributing to the Harari language dictionary. Built with Next.js 16, React 19, and Tailwind CSS.

## Features

### Core Dictionary Features
- **Advanced Search**: Search by Harari words, English translations, Amharic, or Arabic
- **Smart Filtering**: Filter by language and part of speech
- **Entry Details**: View comprehensive word information including translations, examples, and etymology
- **Community Voting**: Upvote helpful entries and suggestions

### Community & Contribution
- **Add New Words**: Contribute new Harari words with multilingual translations
- **Suggest Corrections**: Propose improvements to existing entries
- **Review Queue**: Moderators can review and approve community contributions
- **Diff View**: See exactly what changes are being proposed

### User Experience
- **Dark Mode**: Full dark mode support with automatic theme detection
- **Responsive Design**: Fully responsive on mobile, tablet, and desktop
- **Offline Support**: PWA manifest for potential offline functionality
- **Accessible**: Semantic HTML with proper ARIA roles and labels

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database**: Mock data in `lib/types.ts` (ready for real integration)
- **Deployment**: Vercel-ready

## Project Structure

```
/app
  /entry/[id]          - Entry detail page
  /login               - Login page
  /register            - Registration page
  /review              - Review queue page
  /about               - About page
  /contribute          - Contribution form page
  layout.tsx           - Root layout with dark mode support
  page.tsx             - Home/search page
  globals.css          - Global styles with design tokens

/components
  /layout
    Shell.tsx          - Main layout wrapper with sidebar navigation
  /dictionary
    EntryCard.tsx      - Dictionary entry card component
  /pages
    SearchPage.tsx     - Search and filter interface
    EntryDetailPage.tsx - Detailed entry view
    ReviewQueuePage.tsx - Moderation interface
    LoginPage.tsx      - Authentication form
    RegisterPage.tsx   - Registration form

/lib
  types.ts            - TypeScript types and mock data
  /utils
    search.ts         - Search and filtering utilities

/public
  manifest.json       - PWA manifest
```

## Design System

### Colors
- **Primary**: Gold/Orange (`#d4a574`) - Reflects Ethiopian heritage
- **Secondary**: Deep Blue (`#4a3fb5`)
- **Background**: Dark (`#1a1a1a`) in dark mode, Light (`#f9f9f9`) in light mode
- **Accent**: Warm orange for CTAs and highlights

### Typography
- **Headings**: Geist Sans (bold weights)
- **Body**: Geist Sans (regular weight)
- **Monospace**: Geist Mono (for code/data display)

## Getting Started

### Development
```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

### Building
```bash
pnpm build
pnpm start
```

## Features Overview

### Home Page
- Search dictionary with real-time filtering
- Filter by language (English, Amharic, Arabic, Harari)
- Filter by part of speech (noun, verb, adjective, etc.)
- View statistics on total words, contributors, and verified entries

### Entry Detail Page
- Comprehensive entry information
- Translations in multiple languages with copy buttons
- Usage examples
- Etymology (when available)
- Community voting and feedback
- Inline correction submission form

### Review Queue
- View pending, approved, and rejected suggestions
- Side-by-side diff view of proposed changes
- Approve/reject with community voting system
- Filter by suggestion status

### Contribute
- **Add New Word**: Submit new Harari words with translations
- **Suggest Corrections**: Propose fixes to existing entries
- **Follow Guidelines**: Clear contribution guidelines for quality

### Authentication Pages
- Login with email/password (mock implementation)
- Register with password strength indicator
- OAuth options (Google, GitHub - UI ready)
- Remember me functionality

## Future Enhancements

- [ ] Real database integration (Neon/Supabase)
- [ ] Actual authentication with Better Auth or similar
- [ ] User profiles and contribution history
- [ ] Audio pronunciation guides
- [ ] Advanced analytics for moderators
- [ ] API for external integration
- [ ] Mobile app wrapper for app stores
- [ ] Offline mode with service workers
- [ ] Full-text search optimization
- [ ] Export/import functionality

## Data Structure

### Dictionary Entry
```typescript
{
  id: string
  headword: string           // Harari word in Ethiopic script
  partOfSpeech: string      // noun, verb, adjective, etc.
  translations: Translation[] // Multilingual translations
  examples: Example[]        // Usage examples
  etymology?: string        // Word origin and history
  status: 'verified' | 'unreviewed' | 'flagged'
  votes: number            // Community support
  createdAt: Date
  updatedAt: Date
}
```

### Suggestion
```typescript
{
  id: string
  entryId: string
  type: 'translation' | 'example' | 'etymology' | 'correction'
  oldValue: any
  newValue: any
  submittedBy: string
  status: 'pending' | 'approved' | 'rejected'
  votes: number
  createdAt: Date
}
```

## Contributing

This PWA is designed to showcase a modern dictionary platform. To extend it:

1. Replace mock data in `lib/types.ts` with real database calls
2. Implement authentication routes
3. Add database schema and migrations
4. Create API routes for CRUD operations
5. Add testing with Jest/Vitest

## License

Built as a demonstration of modern PWA patterns with Next.js 16.

---

**Note**: This is a mock implementation with local data. For production use, integrate with a real database and authentication provider.
