import { AnalyticsData, QuestionAnalytics } from '@/types';

export const mockAnalyticsData: AnalyticsData[] = [
  {
    surveyId: '1',
    totalResponses: 342,
    questionAnalytics: [
      {
        questionId: 'q1',
        questionTitle: 'How often do you shop online?',
        questionType: 'multiple-choice',
        responses: [
          { value: 'Daily', count: 45 },
          { value: 'Weekly', count: 156 },
          { value: 'Monthly', count: 98 },
          { value: 'Rarely', count: 32 },
          { value: 'Never', count: 11 }
        ],
        summary: 'Most respondents (45.6%) shop online weekly, with only 3.2% never shopping online.'
      },
      {
        questionId: 'q2',
        questionTitle: 'Rate your satisfaction with online shopping experiences',
        questionType: 'rating',
        responses: [
          { rating: 1, count: 12 },
          { rating: 2, count: 23 },
          { rating: 3, count: 89 },
          { rating: 4, count: 156 },
          { rating: 5, count: 62 }
        ],
        summary: 'Average satisfaction rating: 3.7/5. Most users (45.6%) rate their experience as good (4/5).'
      },
      {
        questionId: 'q3',
        questionTitle: 'What factors influence your purchasing decisions the most?',
        questionType: 'text',
        responses: [
          { theme: 'Price', count: 198 },
          { theme: 'Quality', count: 145 },
          { theme: 'Reviews', count: 134 },
          { theme: 'Brand reputation', count: 89 },
          { theme: 'Shipping speed', count: 67 }
        ],
        summary: 'Price is the most mentioned factor (57.9%), followed by quality (42.4%) and reviews (39.2%).'
      }
    ]
  },
  {
    surveyId: '2',
    totalResponses: 87,
    questionAnalytics: [
      {
        questionId: 'q1',
        questionTitle: 'How would you rate your overall mental health?',
        questionType: 'rating',
        responses: [
          { rating: 1, count: 3 },
          { rating: 2, count: 8 },
          { rating: 3, count: 12 },
          { rating: 4, count: 15 },
          { rating: 5, count: 18 },
          { rating: 6, count: 12 },
          { rating: 7, count: 9 },
          { rating: 8, count: 6 },
          { rating: 9, count: 3 },
          { rating: 10, count: 1 }
        ],
        summary: 'Average mental health rating: 5.2/10. Most responses fall in the 4-6 range.'
      },
      {
        questionId: 'q2',
        questionTitle: 'Which wellness activities do you practice?',
        questionType: 'poll',
        responses: [
          { value: 'Exercise', count: 52 },
          { value: 'Meditation', count: 34 },
          { value: 'Nature walks', count: 31 },
          { value: 'Social activities', count: 28 },
          { value: 'Journaling', count: 19 },
          { value: 'Therapy', count: 16 }
        ],
        summary: 'Exercise is the most popular wellness activity (59.8%), followed by meditation (39.1%).'
      }
    ]
  }
];

export const mockSurveyPerformance = {
  '1': {
    views: 1250,
    startRate: 0.68, // 68% of viewers start the survey
    completionRate: 0.85, // 85% of starters complete it
    averageTime: 4.2, // minutes
    dailyResponses: [
      { date: '2024-01-15', responses: 23 },
      { date: '2024-01-16', responses: 31 },
      { date: '2024-01-17', responses: 28 },
      { date: '2024-01-18', responses: 35 },
      { date: '2024-01-19', responses: 42 },
      { date: '2024-01-20', responses: 38 },
      { date: '2024-01-21', responses: 29 }
    ]
  },
  '2': {
    views: 456,
    startRate: 0.72,
    completionRate: 0.79,
    averageTime: 6.1,
    dailyResponses: [
      { date: '2024-01-15', responses: 8 },
      { date: '2024-01-16', responses: 12 },
      { date: '2024-01-17', responses: 15 },
      { date: '2024-01-18', responses: 11 },
      { date: '2024-01-19', responses: 18 },
      { date: '2024-01-20', responses: 14 },
      { date: '2024-01-21', responses: 9 }
    ]
  }
};