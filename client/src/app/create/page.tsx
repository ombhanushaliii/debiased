'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FormBuilder from '@/components/FormBuilder';
import Modal from '@/components/Modal';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Question, Survey } from '@/types';
import { Save, Eye, Rocket, AlertCircle, Download, Coins, Users, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedResponses, setExpectedResponses] = useState(100);
  const [reward, setReward] = useState(1.0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const surveyRef = useRef<HTMLDivElement>(null);

  const isValid = title.trim() && description.trim() && questions.length > 0 &&
    questions.every(q => q.title.trim()) && reward > 0 && expectedResponses > 0;

  const handleSaveDraft = () => {
    // In a real app, this would save to backend
    alert('Survey saved as draft!');
  };

  const generatePDF = async () => {
    if (!surveyRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      // Create a high-quality PDF using jsPDF directly
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;
      
      // Add header with title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      const titleText = title.trim() || 'Survey Draft';
      pdf.text(titleText, margin, yPosition);
      yPosition += 15;
      
      // Add description
      if (description.trim()) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        const descriptionLines = pdf.splitTextToSize(description, contentWidth);
        pdf.text(descriptionLines, margin, yPosition);
        yPosition += descriptionLines.length * 6 + 10;
      }
      
      // Add survey details
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('Survey Details', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Expected Responses: ${expectedResponses}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Reward per Response: ${reward} ETH`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Total Cost: ${(expectedResponses * reward).toFixed(4)} ETH`, margin, yPosition);
      yPosition += 15;
      
      // Add questions
      if (questions.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Questions', margin, yPosition);
        yPosition += 12;
        
        questions.forEach((question, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Question number and title
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(40, 40, 40);
          pdf.text(`${index + 1}. ${question.title}${question.required ? ' *' : ''}`, margin, yPosition);
          yPosition += 8;
          
          // Question description if exists
          if (question.description) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(80, 80, 80);
            const descLines = pdf.splitTextToSize(question.description, contentWidth);
            pdf.text(descLines, margin, yPosition);
            yPosition += descLines.length * 5 + 5;
          }
          
          // Question type and options
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60);
          
          switch (question.type) {
            case 'text':
              pdf.text('Type: Text Response', margin, yPosition);
              yPosition += 6;
              pdf.text('Answer: [Text input field]', margin, yPosition);
              yPosition += 8;
              break;
              
            case 'multiple-choice':
              pdf.text('Type: Multiple Choice', margin, yPosition);
              yPosition += 6;
              if (question.options) {
                question.options.forEach((option, optIndex) => {
                  pdf.text(`  ${String.fromCharCode(97 + optIndex)}. ${option}`, margin, yPosition);
                  yPosition += 5;
                });
              }
              yPosition += 3;
              break;
              
            case 'rating':
              pdf.text('Type: Rating Scale', margin, yPosition);
              yPosition += 6;
              pdf.text(`Scale: ${question.minRating || 1} to ${question.maxRating || 5}`, margin, yPosition);
              yPosition += 8;
              break;
              
            case 'poll':
              pdf.text('Type: Multiple Selection', margin, yPosition);
              yPosition += 6;
              if (question.options) {
                question.options.forEach((option, optIndex) => {
                  pdf.text(`  □ ${option}`, margin, yPosition);
                  yPosition += 5;
                });
              }
              yPosition += 3;
              break;
          }
          
          yPosition += 8;
        });
      }
      
      // Add footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      }
      
      const fileName = title.trim() ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_survey.pdf` : 'survey_draft.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreview = () => {
    if (!isValid) {
      alert('Please fill in all required fields and add at least one question.');
      return;
    }
    setCurrentPreviewIndex(0);
    setShowPreviewModal(true);
  };

  const handlePublish = () => {
    if (!isValid) {
      alert('Please fill in all required fields and add at least one question.');
      return;
    }
    setShowPublishModal(true);
  };

  const confirmPublish = () => {
    // In a real app, this would save to backend and deploy
    alert('Survey published successfully!');
    router.push('/dashboard');
  };

  const renderPreviewQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            placeholder="Type your answer here..."
            className="w-full paper-input h-32 resize-none"
            disabled
          />
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name={question.id} className="w-4 h-4 text-ink-600" disabled />
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
                disabled
                className="w-10 h-10 rounded-full border-2 border-paper-300 text-ink-600"
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-ink-600" disabled />
                <span className="text-ink-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderActualSurveyView = () => {
    return (
      <div className="max-w-2xl mx-auto bg-paper-50 rounded-xl shadow-paper-lg p-8">
        {/* Survey Header */}
        <div className="text-center mb-8 pb-6 border-b border-paper-200">
          <h1 className="text-3xl font-bold text-ink-800 mb-4">{title || 'Survey Title'}</h1>
          <p className="text-lg text-ink-600 mb-4">{description || 'Survey description will appear here.'}</p>
          <div className="flex items-center justify-center space-x-6 text-sm text-ink-500">
            <span className="flex items-center space-x-1">
              <Coins size={16} />
              <span>{reward} ETH reward</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users size={16} />
              <span>{expectedResponses} responses needed</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock size={16} />
              <span>~{questions.length * 2} min</span>
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-ink-800 mb-2">
                  {index + 1}. {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {question.description && (
                  <p className="text-ink-600 mb-4">{question.description}</p>
                )}
              </div>

              <div className="bg-paper-100 rounded-lg p-4">
                {renderPreviewQuestion(question)}
              </div>
            </div>
          ))}
        </div>

        {/* Survey Footer */}
        <div className="mt-8 pt-6 border-t border-paper-200 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">
              Complete this survey to earn {reward} ETH
            </p>
          </div>
          <p className="text-sm text-ink-500">
            Your responses are completely anonymous and protected by zero-knowledge proofs
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      <Navbar />
      <BackgroundBeams />

      <div ref={surveyRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Survey</h1>
          <p className="text-xl text-neutral-400">Build an engaging survey with our intuitive form builder</p>
        </div>

        {/* Survey Settings */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Survey Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Survey Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling survey title..."
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your survey's purpose and what participants can expect..."
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 h-32 resize-none focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Expected Responses *</label>
                <input
                  type="number"
                  min="1"
                  value={expectedResponses}
                  onChange={(e) => setExpectedResponses(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Reward per Response (ETH) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={reward}
                  onChange={(e) => setReward(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                />
              </div>
            </div>

            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-blue-200">
                  <p className="font-medium mb-1">Total Cost Estimate</p>
                  <p className="text-sm">
                    {expectedResponses} responses × {reward} ETH = <strong>{(expectedResponses * reward).toFixed(4)} ETH</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Survey Questions</h2>
          <FormBuilder questions={questions} onQuestionsChange={setQuestions} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-sm text-neutral-400">
            {questions.length} question{questions.length !== 1 ? 's' : ''} added
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveDraft}
              className="paper-button flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Draft</span>
            </button>

            <button
              onClick={generatePDF}
              className="paper-button flex items-center space-x-2"
              disabled={isGeneratingPDF || questions.length === 0}
            >
              <Download size={16} />
              <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePreview}
              className="paper-button flex items-center space-x-2"
              disabled={!isValid}
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>

            <button
              onClick={handlePublish}
              className="paper-button-primary flex items-center space-x-2"
              disabled={!isValid}
            >
              <Rocket size={16} />
              <span>Publish Survey</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Survey Preview - How Users Will See It"
        size="2xl"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {renderActualSurveyView()}
        </div>
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Publish Survey"
      >
        <div className="space-y-4">
          <p className="text-ink-600">
            Are you ready to publish this survey? Once published, it will be available to the community and you won't be able to make major changes.
          </p>

          <div className="bg-paper-200 rounded-paper p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Title:</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between">
              <span>Questions:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Expected Responses:</span>
              <span className="font-medium">{expectedResponses}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Cost:</span>
              <span className="font-medium">{(expectedResponses * reward).toFixed(2)} ETH</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowPublishModal(false)}
              className="flex-1 paper-button"
            >
              Cancel
            </button>
            <button
              onClick={confirmPublish}
              className="flex-1 paper-button-primary"
            >
              Confirm & Publish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}