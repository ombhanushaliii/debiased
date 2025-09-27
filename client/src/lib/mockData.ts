import { Survey } from '@/types';

export const mockSurveys: Survey[] = [
  {
    id: '1',
    title: 'Consumer Shopping Habits 2024',
    description: 'Help us understand modern shopping behaviors and preferences. Your insights will contribute to better product recommendations and user experiences.',
    creator: 'RetailResearch',
    expectedResponses: 500,
    currentResponses: 342,
    reward: 2.5,
    currency: 'ETH',
    createdAt: new Date('2024-01-15'),
    status: 'active',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        title: 'How often do you shop online?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: 'q2',
        type: 'rating',
        title: 'Rate your satisfaction with online shopping experiences',
        required: true,
        minRating: 1,
        maxRating: 5
      },
      {
        id: 'q3',
        type: 'text',
        title: 'What factors influence your purchasing decisions the most?',
        description: 'Please describe the main considerations when making a purchase',
        required: false
      }
    ]
  },
  {
    id: '2',
    title: 'Mental Health & Wellness Survey',
    description: 'Anonymous survey about mental health awareness and wellness practices. Your responses help improve mental health resources and support systems.',
    creator: 'WellnessInstitute',
    expectedResponses: 200,
    currentResponses: 87,
    reward: 1.8,
    currency: 'ETH',
    createdAt: new Date('2024-01-10'),
    status: 'active',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        title: 'How would you rate your overall mental health?',
        required: true,
        minRating: 1,
        maxRating: 10
      },
      {
        id: 'q2',
        type: 'poll',
        title: 'Which wellness activities do you practice? (Select all that apply)',
        required: false,
        options: ['Meditation', 'Exercise', 'Therapy', 'Journaling', 'Nature walks', 'Social activities']
      },
      {
        id: 'q3',
        type: 'text',
        title: 'What mental health resources would be most helpful to you?',
        required: false
      }
    ]
  },
  {
    id: '3',
    title: 'Crypto Investment Behavior Study',
    description: 'Understanding investment patterns and risk tolerance in the cryptocurrency market. Results will be shared with the community.',
    creator: 'CryptoAnalytics',
    expectedResponses: 1000,
    currentResponses: 756,
    reward: 3.2,
    currency: 'ETH',
    createdAt: new Date('2024-01-08'),
    status: 'active',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        title: 'How long have you been investing in crypto?',
        required: true,
        options: ['Less than 1 year', '1-2 years', '3-5 years', '5+ years', 'Not investing']
      },
      {
        id: 'q2',
        type: 'rating',
        title: 'Rate your risk tolerance (1 = very conservative, 10 = very aggressive)',
        required: true,
        minRating: 1,
        maxRating: 10
      },
      {
        id: 'q3',
        type: 'poll',
        title: 'Which factors influence your investment decisions? (Select all that apply)',
        required: false,
        options: ['Technical analysis', 'Social media sentiment', 'News and media', 'Expert recommendations', 'Community discussions', 'Personal research']
      }
    ]
  },
  {
    id: '4',
    title: 'Remote Work Productivity Survey',
    description: 'Share your remote work experiences and productivity insights. Help shape the future of flexible work environments.',
    creator: 'FutureWork',
    expectedResponses: 300,
    currentResponses: 123,
    reward: 1.5,
    currency: 'ETH',
    createdAt: new Date('2024-01-12'),
    status: 'active',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        title: 'What is your current work arrangement?',
        required: true,
        options: ['Fully remote', 'Hybrid (2-3 days office)', 'Mostly office-based', 'Freelance/contract', 'Student']
      },
      {
        id: 'q2',
        type: 'rating',
        title: 'How productive do you feel working remotely?',
        required: true,
        minRating: 1,
        maxRating: 5
      },
      {
        id: 'q3',
        type: 'text',
        title: 'What tools or strategies help you stay productive while working remotely?',
        required: false
      }
    ]
  },
  {
    id: '5',
    title: 'Sustainable Living Practices',
    description: 'Exploring environmental consciousness and sustainable lifestyle choices. Your input helps promote eco-friendly initiatives.',
    creator: 'EcoFuture',
    expectedResponses: 400,
    currentResponses: 89,
    reward: 2.0,
    currency: 'ETH',
    createdAt: new Date('2024-01-14'),
    status: 'active',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        title: 'How important is environmental sustainability to you?',
        required: true,
        minRating: 1,
        maxRating: 5
      },
      {
        id: 'q2',
        type: 'poll',
        title: 'Which sustainable practices do you currently follow? (Select all that apply)',
        required: false,
        options: ['Recycling', 'Using renewable energy', 'Reducing meat consumption', 'Public transportation', 'Composting', 'Buying eco-friendly products']
      },
      {
        id: 'q3',
        type: 'text',
        title: 'What barriers prevent you from adopting more sustainable practices?',
        required: false
      }
    ]
  },
  {
    id: '6',
    title: 'Educational Technology Impact',
    description: 'Understanding how technology has transformed learning experiences. Contribute to improving educational tools and platforms.',
    creator: 'EdTechLab',
    expectedResponses: 250,
    currentResponses: 198,
    reward: 1.7,
    currency: 'ETH',
    createdAt: new Date('2024-01-05'),
    status: 'active',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        title: 'What is your primary role in education?',
        required: true,
        options: ['Student', 'Teacher/Educator', 'Administrator', 'Parent', 'Other']
      },
      {
        id: 'q2',
        type: 'rating',
        title: 'How effective do you find online learning compared to traditional methods?',
        required: true,
        minRating: 1,
        maxRating: 5
      },
      {
        id: 'q3',
        type: 'text',
        title: 'What educational technologies have been most beneficial in your experience?',
        required: false
      }
    ]
  }
];