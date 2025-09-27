'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FormBuilder from '@/components/FormBuilder';
import Modal from '@/components/Modal';
import { Question, Survey } from '@/types';
import { Save, Eye, Rocket, AlertCircle, Download } from 'lucide-react';
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
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.color = '#000000';
      
      // Clone the survey content
      const clonedContent = surveyRef.current.cloneNode(true) as HTMLElement;
      
      // Clean up the cloned content for PDF
      const buttons = clonedContent.querySelectorAll('button');
      buttons.forEach(btn => btn.remove());
      
      const inputs = clonedContent.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          const value = input.value || input.placeholder || '';
          const span = document.createElement('span');
          span.textContent = value;
          span.style.display = 'inline-block';
          span.style.padding = '8px';
          span.style.border = '1px solid #ccc';
          span.style.borderRadius = '4px';
          span.style.minHeight = '20px';
          span.style.backgroundColor = '#f9f9f9';
          input.parentNode?.replaceChild(span, input);
        }
      });
      
      // Remove interactive elements
      const interactiveElements = clonedContent.querySelectorAll('[draggable], .cursor-move, .hover\\:shadow-paper-lg');
      interactiveElements.forEach(el => {
        el.removeAttribute('draggable');
        el.classList.remove('cursor-move', 'hover:shadow-paper-lg');
      });
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
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

  return (
    <div className="min-h-screen bg-paper-100">
      <Navbar />

      <div ref={surveyRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ink-800 mb-2">Create Survey</h1>
          <p className="text-xl text-ink-600">Build an engaging survey with our intuitive form builder</p>
        </div>

        {/* Survey Settings */}
        <div className="paper-card p-6 mb-8">
          <h2 className="text-2xl font-semibold text-ink-800 mb-6">Survey Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Survey Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling survey title..."
                className="w-full paper-input text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your survey's purpose and what participants can expect..."
                className="w-full paper-input h-32 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Expected Responses *</label>
                <input
                  type="number"
                  min="1"
                  value={expectedResponses}
                  onChange={(e) => setExpectedResponses(parseInt(e.target.value) || 0)}
                  className="w-full paper-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Reward per Response (ETH) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={reward}
                  onChange={(e) => setReward(parseFloat(e.target.value) || 0)}
                  className="w-full paper-input"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-paper p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-blue-800">
                  <p className="font-medium mb-1">Total Cost Estimate</p>
                  <p className="text-sm">
                    {expectedResponses} responses × {reward} ETH = <strong>{(expectedResponses * reward).toFixed(2)} ETH</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-ink-800 mb-6">Survey Questions</h2>
          <FormBuilder questions={questions} onQuestionsChange={setQuestions} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-sm text-ink-600">
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
        title="Survey Preview"
        size="lg"
      >
        <div className="space-y-6">
          <div className="border-b border-paper-200 pb-4">
            <h3 className="text-xl font-semibold text-ink-800">{title}</h3>
            <p className="text-ink-600 mt-2">{description}</p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-ink-500">
              <span>Reward: {reward} ETH</span>
              <span>Expected: {expectedResponses} responses</span>
            </div>
          </div>

          {questions.length > 0 && (
            <>
              <div className="flex items-center justify-between text-sm text-ink-600">
                <span>Question {currentPreviewIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentPreviewIndex + 1) / questions.length) * 100)}% complete</span>
              </div>

              <div className="w-full bg-paper-300 rounded-full h-2">
                <div
                  className="bg-ink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPreviewIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-ink-800 mb-2">
                    {questions[currentPreviewIndex].title}
                    {questions[currentPreviewIndex].required && <span className="text-red-500 ml-1">*</span>}
                  </h4>
                  {questions[currentPreviewIndex].description && (
                    <p className="text-ink-600 mb-4">{questions[currentPreviewIndex].description}</p>
                  )}
                </div>

                {renderPreviewQuestion(questions[currentPreviewIndex])}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentPreviewIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentPreviewIndex === 0}
                  className="paper-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPreviewIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentPreviewIndex === questions.length - 1}
                  className="paper-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
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