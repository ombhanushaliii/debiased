export interface Survey {
  id: string;
  title: string;
  description: string;
  creator: string;
  expectedResponses: number;
  currentResponses: number;
  reward: number;
  currency: string;
  createdAt: Date;
  status: 'draft' | 'active' | 'completed';
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'text' | 'multiple-choice' | 'rating' | 'poll';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  answers: Answer[];
  submittedAt: Date;
}

export interface Answer {
  questionId: string;
  value: string | number | string[];
}

export interface User {
  id: string;
  address: string;
  isCreator: boolean;
  totalEarned: number;
  surveysCreated: number;
  surveysCompleted: number;
}

export interface AnalyticsData {
  surveyId: string;
  totalResponses: number;
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  responses: any[];
  summary: string;
}