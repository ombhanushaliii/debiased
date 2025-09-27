#  Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

##  Project Overview

Your application includes:

**Landing Page** - Hero section with wallet connection
**Community Forum** - Browse surveys with progress tracking
**Survey Creation** - Drag-and-drop form builder
**Creator Dashboard** - Analytics and survey management
**Complete UI System** - Papery design with modals and toasts
**Error Handling** - 404 pages and error boundaries
**Accessibility** - Keyboard navigation and screen reader support
**Form Validation** - Comprehensive validation system
**Mock Data** - Realistic survey and analytics data

##  Key Features Implemented

### Design System
- **Papery Aesthetic**: Soft edges, subtle shadows, textured backgrounds
- **Neutral Color Palette**: Paper and ink color schemes
- **Responsive Layout**: Mobile-first design approach
- **Custom Components**: Buttons, cards, inputs with consistent styling

### Survey Functionality
- **Multiple Question Types**: Text, multiple-choice, rating, polls
- **Drag-and-Drop Builder**: Reorder questions with visual feedback
- **Real-time Preview**: See how surveys look to participants
- **Progress Tracking**: Visual progress bars for survey completion

### Analytics & Visualization
- **Chart.js Integration**: Bar charts, doughnuts, line charts
- **Response Analytics**: Question-by-question insights
- **Performance Metrics**: Views, completion rates, response trends
- **Export Ready**: Structured data for future backend integration

### User Experience
- **Toast Notifications**: Success, error, warning, info messages
- **Loading States**: Spinners and skeleton screens
- **Error Boundaries**: Graceful error handling
- **Modal System**: Accessible popups (no browser alerts)
- **Form Validation**: Real-time validation with helpful error messages

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and announcements
- **Focus Management**: Proper focus trapping in modals
- **Color Contrast**: WCAG compliant color combinations

##  Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

##  File Structure

```
src/
├── app/                 # Next.js 13+ app router
│   ├── page.tsx        # Landing page
│   ├── community/      # Survey browsing
│   ├── create/         # Survey creation
│   ├── dashboard/      # Creator dashboard
│   ├── layout.tsx      # Root layout with providers
│   ├── not-found.tsx   # 404 page
│   └── error.tsx       # Error page
├── components/         # Reusable UI components
│   ├── Accessibility.tsx
│   ├── Charts.tsx
│   ├── ErrorBoundary.tsx
│   ├── FormBuilder.tsx
│   ├── FormField.tsx
│   ├── Loading.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── SurveyCard.tsx
│   └── Toast.tsx
├── lib/               # Utilities and data
│   ├── mockAnalytics.ts
│   ├── mockData.ts
│   ├── utils.ts
│   └── validation.ts
├── types/             # TypeScript definitions
│   └── index.ts
└── styles/            # Global styles
    └── globals.css
```

##  Design Tokens

### Colors
```css
/* Paper Palette - Neutral backgrounds */
paper-50 to paper-900

/* Ink Palette - Text and accents */
ink-50 to ink-900

/* Status Colors */
red-* green-* blue-* yellow-*
```

### Components
```css
.paper-card          # Standard card container
.paper-button        # Secondary button
.paper-button-primary # Primary button
.paper-input         # Form input styling
.paper-modal         # Modal overlay
```

##  Next Steps for Web3 Integration

When ready to add blockchain functionality:

1. **Wallet Integration**
   - Replace mock wallet with Web3Modal or similar
   - Add support for MetaMask, WalletConnect, etc.

2. **Smart Contracts**
   - Deploy survey creation contract
   - Implement reward distribution logic
   - Add ZKP verification contracts

3. **IPFS Storage**
   - Store survey data on distributed storage
   - Pin important content for availability

4. **Real Backend**
   - Replace mock data with API calls
   - Add user authentication
   - Implement real analytics tracking

##  Testing Your Application

### Manual Testing Checklist

- [ ] Landing page loads and displays correctly
- [ ] Wallet connection modal opens (mock functionality)
- [ ] Search functionality works with URL updates
- [ ] Community page displays surveys with progress bars
- [ ] Survey completion flow works with reward simulation
- [ ] Form builder allows creating questions with drag-and-drop
- [ ] Dashboard shows analytics with charts
- [ ] Error pages display when navigating to invalid URLs
- [ ] Mobile responsiveness works across devices
- [ ] Keyboard navigation functions properly

### Common Issues & Solutions

**Charts not displaying?**
- Ensure Chart.js components are properly imported
- Check that data format matches expected structure

**Modal not opening?**
- Verify modal state management is working
- Check for JavaScript errors in console

**Drag-and-drop not working?**
- Ensure HTML5 drag events are properly bound
- Check that drag handlers are correctly implemented

##  Customization Guide

### Updating Colors
1. Edit `tailwind.config.js` color definitions
2. Update CSS custom properties in `globals.css`
3. Regenerate Tailwind classes with `npm run dev`

### Adding New Question Types
1. Update `Question` interface in `types/index.ts`
2. Add rendering logic in `FormBuilder.tsx`
3. Update validation in `validation.ts`
4. Add preview in survey modal

### Modifying Analytics
1. Update mock data in `mockAnalytics.ts`
2. Add new chart types in `Charts.tsx`
3. Update dashboard display logic

##  Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify all dependencies are installed correctly
3. Ensure you're using Node.js 18 or higher
4. Try clearing browser cache and restarting dev server

##  You're All Set!

Your anonymous survey platform is ready for development and testing. The foundation is solid for adding Web3 functionality when you're ready to integrate blockchain features.

Happy coding! 