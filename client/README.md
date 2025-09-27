# Anonymous Survey Platform - Frontend

A Web3 survey platform built with Next.js and Tailwind CSS, featuring anonymous surveys with ZKP technology, papery design aesthetic, and crypto rewards simulation.

##  Features

### Core Functionality
- **Landing Page**: Prominent connect wallet button, how-it-works section, search functionality
- **Community Forum**: Browse surveys with cards showing progress bars, rewards, and real-time stats
- **Survey Creation**: Drag-and-drop form builder with multiple question types
- **Creator Dashboard**: Analytics with Chart.js visualizations and survey management
- **Modal System**: All popups implemented as website modals (no alerts)
- **Simulated Rewards**: Frontend crypto reward simulation upon survey completion

### Design & UX
- **Papery Aesthetic**: Soft edges, subtle shadows, textured backgrounds
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Intuitive UI**: Clean layouts with neutral color palette and gentle typography
- **Progress Tracking**: Real-time progress bars and completion statistics

### Survey Features
- **Multiple Question Types**: Text, multiple-choice, rating scales, polls
- **Dynamic Visualization**: Charts and graphs for survey results
- **Form Builder**: Drag-and-drop interface for creating surveys
- **Analytics Dashboard**: Comprehensive insights and statistics

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom papery design system
- **Visualizations**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout the application

##  Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── community/         # Community forum
│   ├── create/            # Survey creation
│   ├── dashboard/         # Creator dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Charts.tsx         # Chart components
│   ├── FormBuilder.tsx    # Survey form builder
│   ├── Modal.tsx          # Modal system
│   ├── Navbar.tsx         # Navigation
│   └── SurveyCard.tsx     # Survey display cards
├── lib/                   # Utilities and mock data
│   ├── mockData.ts        # Sample survey data
│   └── mockAnalytics.ts   # Sample analytics data
└── types/                 # TypeScript type definitions
    └── index.ts           # Core types
```

##  Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Colors
- **Paper Palette**: Neutral tones from `paper-50` to `paper-900`
- **Ink Palette**: Text colors from `ink-50` to `ink-900`
- **Accent Colors**: Green for success, blue for actions, red for warnings

### Components
- **Paper Cards**: `.paper-card` - Soft shadowed containers
- **Paper Buttons**: `.paper-button` and `.paper-button-primary`
- **Paper Inputs**: `.paper-input` - Consistent form styling
- **Paper Modals**: `.paper-modal` and `.paper-modal-content`

### Typography
- **Primary Font**: Inter (clean, modern)
- **Paper Font**: Georgia (serif for special emphasis)

##  Mock Data

The application includes comprehensive mock data for demonstration:

- **6 Sample Surveys**: Various question types and progress states
- **Analytics Data**: Detailed response analytics with visualizations
- **Performance Metrics**: Views, completion rates, response trends
- **User Statistics**: Earnings, completions, and progress tracking

## 🎯 Key Pages

### Landing Page (`/`)
- Hero section with wallet connection
- How-it-works explanation (4 steps)
- Benefits showcase
- Search functionality
- Call-to-action sections

### Community Forum (`/community`)
- Survey browsing with filtering
- Real-time progress indicators
- Reward display
- Search and sort functionality
- Simulated completion flow

### Survey Creation (`/create`)
- Drag-and-drop form builder
- Multiple question types
- Preview functionality
- Cost estimation
- Publishing workflow

### Creator Dashboard (`/dashboard`)
- Survey management
- Analytics with Chart.js
- Performance metrics
- Response tracking
- Survey editing/deletion

## 🔮 Future Enhancements

When ready to integrate Web3:

1. **Wallet Integration**: Replace mock wallet connection with real Web3 providers
2. **Smart Contracts**: Deploy survey and reward distribution contracts
3. **ZKP Implementation**: Add zero-knowledge proof verification
4. **IPFS Storage**: Store survey data on distributed storage
5. **Token Integration**: Implement actual cryptocurrency rewards
6. **Blockchain Analytics**: Connect analytics to on-chain data

##  Development Notes

- All components are built with TypeScript for type safety
- Responsive design implemented with Tailwind CSS
- Mock data provides realistic demonstration scenarios
- Modal system prevents browser alert usage
- Chart.js integration ready for real data
- Papery design system maintains consistent aesthetics
- Form builder supports extensible question types

##  Color Reference

```css
/* Paper Palette */
paper-50: #fefefe    paper-500: #cfc9be
paper-100: #f8f7f5   paper-600: #b5aca0
paper-200: #f1f0ed   paper-700: #968b7d
paper-300: #e8e6e1   paper-800: #776e63
paper-400: #ddd9d2   paper-900: #5a544d

/* Ink Palette */
ink-50: #f7f7f6      ink-500: #85796d
ink-100: #e8e7e4     ink-600: #6b6057
ink-200: #d1cfca     ink-700: #564c43
ink-300: #b7b3ab     ink-800: #453c35
ink-400: #9c958a     ink-900: #39312b
```

This frontend is ready for Web3 integration and provides a complete user experience for anonymous survey participation with an elegant, papery design aesthetic.