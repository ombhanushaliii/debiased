'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Survey } from '@/types';
import { Clock, Users, Coins, ArrowRight, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import AnimatedButton from './AnimatedButton';

interface SurveyCardProps {
  survey: Survey;
  onComplete?: (surveyId: string, reward: number) => void;
}

export default function SurveyCard({ survey, onComplete }: SurveyCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});

  const progressPercentage = (survey.currentResponses / survey.expectedResponses) * 100;

  const handleStartSurvey = () => {
    // If survey has CID, navigate to dedicated survey page
    if (survey.cid) {
      router.push(`/survey/${survey.cid}`);
    } else {
      // Fallback to modal for surveys without CID (legacy support)
      setIsModalOpen(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsModalOpen(false);
    onComplete?.(survey.id, survey.reward);
  };

  const currentQuestion = survey.questions[currentQuestionIndex];
  const canProceed = currentQuestion && answers[currentQuestion.id] !== undefined;

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            placeholder="Type your answer here..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full paper-input h-32 resize-none"
          />
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-ink-600"
                />
                <span className="text-ink-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {Array.from({ length: question.maxRating || 5 }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-10 h-10 rounded-full border-2 transition-colors ${
                  answers[question.id] === rating
                    ? 'bg-ink-600 border-ink-600 text-paper-50'
                    : 'border-paper-300 text-ink-600 hover:border-ink-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = answers[question.id] || [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentValues, option]);
                    } else {
                      handleAnswerChange(question.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-ink-600"
                />
                <span className="text-ink-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:shadow-paper-lg transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{survey.title}</h3>
            <p className="text-neutral-400 mb-4 line-clamp-3">{survey.description}</p>
          </div>
          <div className="ml-4 text-right">
            <div className="flex items-center space-x-1 text-green-400 font-semibold">
              <Coins size={16} />
              <span>{survey.reward} {survey.currency}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{survey.currentResponses}/{survey.expectedResponses} responses</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock size={14} />
                <span>~5 min</span>
              </span>
            </div>
            <span className="font-medium text-white">{Math.round(progressPercentage)}% complete</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Created by {survey.creator}
          </div>
          <div className="flex gap-2">
            {survey.cid && (
              <button
                onClick={() => router.push(`/survey/${survey.cid}`)}
                className="px-3 py-2 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 hover:text-white transition-colors text-sm flex items-center space-x-1"
              >
                <ExternalLink size={14} />
                <span>View</span>
              </button>
            )}
            <AnimatedButton
              onClick={handleStartSurvey}
              className="text-sm"
            >
              <span className="flex items-center space-x-2">
                <span>{survey.cid ? 'Take Survey' : 'Start Survey'}</span>
                <ArrowRight size={14} />
              </span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Survey Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={survey.title}
        size="lg"
      >
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-ink-600">
            <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / survey.questions.length) * 100)}% complete</span>
          </div>

          <div className="w-full bg-paper-300 rounded-full h-2">
            <div
              className="bg-ink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          {currentQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-800 mb-2">
                  {currentQuestion.title}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {currentQuestion.description && (
                  <p className="text-ink-600 mb-4">{currentQuestion.description}</p>
                )}
              </div>

              {renderQuestion(currentQuestion)}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <AnimatedButton
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </AnimatedButton>
            <AnimatedButton
              onClick={handleNext}
              disabled={!canProceed}
            >
              {currentQuestionIndex === survey.questions.length - 1 ? 'Complete' : 'Next'}
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </>
  );
}