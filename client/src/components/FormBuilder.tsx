'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { Plus, Trash2, GripVertical, Type, List, Star, BarChart3, X } from 'lucide-react';

interface FormBuilderProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export default function FormBuilder({ questions, onQuestionsChange }: FormBuilderProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const questionTypes = [
    { type: 'text', label: 'Text Answer', icon: Type, description: 'Open-ended text response' },
    { type: 'multiple-choice', label: 'Multiple Choice', icon: List, description: 'Single selection from options' },
    { type: 'rating', label: 'Rating Scale', icon: Star, description: 'Numeric rating scale' },
    { type: 'poll', label: 'Poll', icon: BarChart3, description: 'Multiple selections allowed' },
  ];

  const addQuestionAtPosition = (type: string, index?: number) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: type as Question['type'],
      title: '',
      required: false,
      ...(type === 'multiple-choice' ? { options: [''] } : {}), // Start with empty option for multiple choice
      ...(type === 'poll' ? { options: [''] } : {}), // Start with empty option for poll
      ...(type === 'rating' ? { minRating: 1, maxRating: 5 } : {})
    };

    if (index !== undefined) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 0, newQuestion);
      onQuestionsChange(updatedQuestions);
    } else {
      onQuestionsChange([...questions, newQuestion]);
    }
  };

  const addQuestion = (type: string) => {
    addQuestionAtPosition(type);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    );
    onQuestionsChange(updatedQuestions);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);
    onQuestionsChange(updatedQuestions);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      moveQuestion(draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options) {
      updateQuestion(questionIndex, {
        options: [...question.options, ''] // Always start with empty option
      });
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex];
    if (question.options) {
      const updatedOptions = question.options.map((option, i) =>
        i === optionIndex ? value : option
      );
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options && question.options.length > 1) {
      const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };

  const InlineQuestionAdder = ({ index }: { index?: number }) => (
    <div className="flex items-center justify-center py-2">
      <div className="flex-1 h-px bg-neutral-700"></div>
      <div className="flex items-center space-x-2 mx-4">
        {questionTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <button
              key={type.type}
              onClick={() => addQuestionAtPosition(type.type, index)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-neutral-500 rounded-full text-neutral-300 hover:text-white transition-all duration-200 text-sm"
              title={type.description}
            >
              <IconComponent size={14} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 h-px bg-neutral-700"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Question Types Toolbar - Only show when no questions */}
      {questions.length === 0 && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add Question Types</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {questionTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.type}
                  onClick={() => addQuestion(type.type)}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 p-4 text-left hover:shadow-paper transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent size={20} className="text-neutral-300" />
                    <span className="font-medium text-white">{type.label}</span>
                  </div>
                  <p className="text-sm text-neutral-400">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-neutral-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No questions yet</h3>
            <p className="text-neutral-400">Start building your survey by adding questions above</p>
          </div>
        ) : (
          <>
            {/* Add question at the beginning */}
            <InlineQuestionAdder index={0} />
            
            {questions.map((question, index) => (
              <React.Fragment key={question.id}>
                {/* Add question before each question (except first) */}
                {index > 0 && <InlineQuestionAdder index={index} />}
                
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-neutral-800 border border-neutral-700 rounded-xl p-6 cursor-move hover:shadow-paper-lg transition-shadow duration-200 ${
                    draggedItem === index ? 'opacity-50' : ''
                  }`}
                >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-2">
                  <GripVertical className="text-neutral-400" size={20} />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-300 bg-neutral-700 px-2 py-1 rounded">
                      Question {index + 1} - {question.type.replace('-', ' ')}
                    </span>
                    <button
                      onClick={() => deleteQuestion(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Question Title */}
                  <div>
                    <input
                      type="text"
                      placeholder="Enter your question..."
                      value={question.title}
                      onChange={(e) => updateQuestion(index, { title: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 text-lg font-medium focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500"
                    />
                  </div>

                  {/* Question Description */}
                  <div>
                    <textarea
                      placeholder="Add description (optional)"
                      value={question.description || ''}
                      onChange={(e) => updateQuestion(index, { description: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 h-20 resize-none focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500"
                    />
                  </div>

                  {/* Question-specific settings */}
                  {(question.type === 'multiple-choice' || question.type === 'poll') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">
                        Options <span className="text-red-400">*</span>:
                      </label>
                      {question.options?.map((option, optionIndex) => {
                        const isEmpty = option.trim() === '';
                        return (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              className={`flex-1 bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500 ${isEmpty ? 'border-red-400 focus:border-red-500' : ''}`}
                              placeholder={`Enter option ${optionIndex + 1}...`}
                              required
                            />
                            {question.options && question.options.length > 1 && (
                              <button
                                onClick={() => deleteOption(index, optionIndex)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove option"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <button
                        onClick={() => addOption(index)}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center space-x-1"
                      >
                        <Plus size={16} />
                        <span>Add Option</span>
                      </button>
                      {question.options?.some(opt => opt.trim() === '') && (
                        <p className="text-sm text-red-400 flex items-center space-x-1">
                          <X size={14} />
                          <span>All options must be filled</span>
                        </p>
                      )}
                    </div>
                  )}

                  {question.type === 'rating' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-300 block mb-1">Min Rating:</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={question.minRating || 1}
                          onChange={(e) => updateQuestion(index, { minRating: parseInt(e.target.value) })}
                          className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:border-purple-500 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-300 block mb-1">Max Rating:</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={question.maxRating || 5}
                          onChange={(e) => updateQuestion(index, { maxRating: parseInt(e.target.value) })}
                          className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:border-purple-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Required checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${question.id}`}
                      checked={question.required}
                      onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-neutral-900 border-neutral-700 rounded focus:ring-purple-500"
                    />
                    <label htmlFor={`required-${question.id}`} className="text-sm text-neutral-300">
                      Required question
                    </label>
                  </div>
                </div>
              </div>
            </div>
              </React.Fragment>
            ))}
            
            {/* Add question at the end */}
            <InlineQuestionAdder />
          </>
        )}
      </div>

    </div>
  );
}