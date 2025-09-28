# Anonymous Survey Platform with Zero-Knowledge Proofs

A decentralized survey platform enabling anonymous data collection using zero-knowledge proof technology. Users can create surveys, participate anonymously, and earn cryptocurrency rewards while maintaining complete privacy through ZKP verification.

## Key Features

- **Complete Anonymity**: Zero-knowledge proofs ensure user identity remains private
- **Cryptocurrency Rewards**: Earn ETH/KDA for survey participation
- **Real-time Analytics**: Comprehensive data visualization and insights
- **Multiple Question Types**: Text, multiple choice, rating scales, and polls
- **Responsive Design**: Modern UI with dark theme and smooth animations
- **Web3 Integration**: Wallet connection and blockchain transactions

## Technology Stack

### Frontend
- Next.js 15.5.4 with React 18
- TypeScript
- Tailwind CSS with custom design system
- Chart.js with react-chartjs-2
- Ethers.js for Web3 integration

### Server
- Express.js
- Basic REST API endpoints
- Survey data handling
- Web3 service integration

### Smart Contracts
- Solidity ^0.8.20
- Hardhat
- Self Protocol
- Kadena Network

## Project Structure

```
freeman/
├── client/                  # Next.js frontend
│   ├── src/
│   │   ├── app/            # Pages and routes
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
├── server/                 # Express server
│   └── server.js          # Server implementation
├── contracts/              # Smart contracts
│   ├── ZVASP.sol          # Main contract
│   └── ProofOfHuman.sol   # ZKP verification
└── README.md
```

## Quick Start

1. Clone and install:
```bash
git clone https://github.com/ombhanushaliii/debiased.git
cd debiased
npm install
```

2. Start development:
```bash
# Start frontend
cd client
npm run dev

# Start server
cd server
node server.js
```

## Smart Contract Features

### ZVASP.sol
- Survey creation and management
- Anonymous response submission
- Reward distribution
- Analytics tracking

### ProofOfHuman.sol
- ZKP verification integration
- Identity verification
- Age and nationality restrictions
- Verification statistics

## Frontend Components

### Key Pages
- **Landing Page**: Platform introduction and features
- **Create Survey**: Dynamic form builder with multiple question types
- **Community**: Browse and participate in surveys
- **Dashboard**: Analytics and survey management

### Core Features
- **Survey Creation**: Dynamic form builder with multiple question types
- **Anonymous Responses**: ZKP-verified submissions
- **Analytics**: Real-time data visualization
- **Wallet Integration**: Web3 wallet connection and transactions

## Survey Features

### Question Types
- **Multiple Choice**
  - Single selection options
  - Multiple selection allowed
  - Custom "Other" option support
  - Option randomization

- **Text Responses**
  - Short answer fields
  - Long-form paragraphs
  - Input validation rules
  - Character limits

- **Rating Scales**
  - 1-5 star ratings
  - 1-10 numeric scales
  - Custom scale ranges
  - Emoji reactions

- **Matrix Questions**
  - Grid-style responses
  - Likert scales
  - Multiple criteria evaluation
  - Row/column customization

### Form Builder Features
- **Drag-and-Drop Interface**
  - Reorder questions
  - Section organization
  - Question grouping
  - Layout customization

- **Conditional Logic**
  - Skip logic based on answers
  - Question branching
  - Custom validation rules
  - Required field logic

- **Survey Settings**
  - Response limits
  - Reward configuration
  - Privacy settings

### Response Collection
- **Anonymous Submission**
  - ZKP verification process
  - No personal data storage

- **Real-time Validation**
  - Input format checking
  - Required field validation
  - Custom validation rules
  - Error messaging

### Analytics Dashboard
- **Response Visualization**
  - Bar/pie charts
  - Timeline views
  - Word clouds
  - Cross-tabulation

- **Export Options**  
  - Raw data access
  - Custom report builder

## Survey Features

### Question Types
- **Multiple Choice**
  - Single selection options
  - Multiple selection allowed
  - Custom "Other" option support
  - Option randomization

- **Text Responses**
  - Short answer fields
  - Long-form paragraphs
  - Input validation rules
  - Character limits

- **Rating Scales**
  - 1-5 star ratings
  - 1-10 numeric scales
  - Custom scale ranges
  - Emoji reactions

### Form Builder Features

- **Drag-and-Drop Interface**
  - Reorder questions
  - Section organization
  - Question grouping
  - Layout customization

- **Conditional Logic**
  - Skip logic based on answers
  - Question branching
  - Custom validation rules
  - Required field logic

- **Survey Settings**
  - Response limits
  - Time restrictions
  - Reward configuration
  - Privacy settings

### Response Collection
- **Anonymous Submission**
  - ZKP verification process
  - No personal data storage
  - Encrypted responses
  - Secure data handling

- **Real-time Validation**
  - Input format checking
  - Required field validation
  - Custom validation rules
  - Error messaging

### Analytics Dashboard
- **Response Visualization**
  - Bar/pie charts
  - Timeline views
  - Word clouds
  - Cross-tabulation

- **Export Options**
  - CSV/Excel download
  - PDF reports
  - Raw data access
  - Custom report builder


## License

MIT License