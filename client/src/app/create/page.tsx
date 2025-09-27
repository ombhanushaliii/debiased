'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FormBuilder from '@/components/FormBuilder';
import Modal from '@/components/Modal';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Question, Survey } from '@/types';
import { Save, Eye, Rocket, AlertCircle, Download, Coins, Users, Clock } from 'lucide-react';
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Smart contract ABIs (simplified, replace with actual ABIs)
const PROOF_OF_HUMAN_ABI = [
  "function isUserVerified(address user) external view returns (bool)",
  "function getUserVerificationDetails(address user) external view returns (bool isVerified, uint256 timestamp, string memory nationality)"
];

const ZVASP_ABI = [
  "function createSurveyWithTotalFunding(string memory _title, string memory _description, tuple(string text, string questionType, string[] options, bool isRequired)[] memory _questions, uint256 totalFunding, uint256 maxResponses, bytes32 surveyCID) payable",
  "function verifiedUsers(address) view returns (bool)",
  "function getSurvey(uint256 _surveyId) view returns (tuple(string title, string description, address creator, uint256 totalFunding, uint256 rewardPerResponse, uint256 commission, uint256 availableFunding, uint256 responseCount, uint256 maxResponses, bool isActive, uint256 createdAt, bytes32 surveyCID))"
];

// Contract and configuration addresses
const PROOF_OF_HUMAN_ADDRESS = "0xA91733b5641d627eD461420D0EC1D1277fC7bF37";
const ZVASP_ADDRESS = "0x751A723b1159F448bbD6788524e47AaB858A4E8A";
const TOKEN_CONTRACT_ADDRESS = "0x751A723b1159F448bbD6788524e47AaB858A4E8A";
const RELAY_SERVER_URL = "http://localhost:3001";
const LIGHTHOUSE_API_KEY = "1e5a8e58.476d0812abe5478d81ada0706c11e6ab";

// Survey metadata question type for IPFS
interface SurveyMetadataQuestion {
  text: string;
  questionType: string;
  options: string[];
  isRequired: boolean;
}

// Survey metadata interface for IPFS
interface SurveyMetadata {
  title: string;
  description: string;
  questions: SurveyMetadataQuestion[];
  restrictions: {
    tokenGating: {
      type: string;
      contractAddress: string;
      minBalance: string;
    };
    maxResponses: number;
    geographicRestrictions: string[];
  };
}

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
  const [account, setAccount] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [surveyCID, setSurveyCID] = useState<string>('');
  const surveyRef = useRef<HTMLDivElement>(null);

  // Initialize Web3 provider and check verification status
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      provider.getSigner().then(setSigner).catch(console.error);
      window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => {
        setAccount(accounts[0]);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (account) {
      fetch(`${RELAY_SERVER_URL}/verify-status/${account}`)
        .then(res => res.json())
        .then(data => {
          setIsVerified(data.verified || data.pending);
        })
        .catch(console.error);
    }
  }, [account]);

  // Validate form inputs
  const isValid = title.trim() && description.trim() && questions.length > 0 &&
    questions.every(q => q.title.trim()) && reward > 0 && expectedResponses > 0;

  // Map UI question types to contract question types
  const mapQuestionType = (uiType: string): string => {
    switch (uiType) {
      case 'text': return 'Subjective';
      case 'multiple-choice': return 'MCQ';
      case 'rating': return 'Rating';
      case 'poll': return 'MCQ'; // Treat poll as MCQ for contract compatibility
      default: return 'Subjective';
    }
  };

  const handleSaveDraft = async () => {
    if (!isValid) {
      alert('Please fill in all required fields and add at least one question.');
      return;
    }

    // Prepare survey metadata for IPFS
    const surveyMetadata: SurveyMetadata = {
      title,
      description,
      questions: questions.map(q => ({
        text: q.title,
        questionType: mapQuestionType(q.type),
        options: q.options || (q.type === 'rating' ? Array.from({ length: (q.maxRating || 5) - (q.minRating || 1) + 1 }, (_, i) => String(i + (q.minRating || 1))) : []),
        isRequired: q.required || false,
      })),
      restrictions: {
        tokenGating: {
          type: 'ERC20',
          contractAddress: TOKEN_CONTRACT_ADDRESS,
          minBalance: '10',
        },
        maxResponses: expectedResponses,
        geographicRestrictions: [],
      },
    };

    // Create a File object instead of a Blob
    const surveyFile = new File(
      [JSON.stringify(surveyMetadata)],
      'survey-metadata.json',
      { type: 'application/json' }
    );

    // Upload to IPFS via Lighthouse
    try {
      const uploadResponse = await lighthouse.upload(
        [surveyFile], // Pass as array of files
        LIGHTHOUSE_API_KEY
      );
      const cid = uploadResponse.data.Hash;
      setSurveyCID(cid);
      alert(`Survey draft saved! CID: ${cid}`);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const generatePDF = async () => {
    if (!surveyRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      const titleText = title.trim() || 'Survey Draft';
      pdf.text(titleText, margin, yPosition);
      yPosition += 15;
      
      if (description.trim()) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        const descriptionLines = pdf.splitTextToSize(description, contentWidth);
        pdf.text(descriptionLines, margin, yPosition);
        yPosition += descriptionLines.length * 6 + 10;
      }
      
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
      pdf.text(`Reward per Response: ${reward} KDA`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Total Cost: ${(expectedResponses * reward).toFixed(4)} KDA`, margin, yPosition);
      yPosition += 15;
      
      if (questions.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Questions', margin, yPosition);
        yPosition += 12;
        
        questions.forEach((question, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(40, 40, 40);
          pdf.text(`${index + 1}. ${question.title}${question.required ? ' *' : ''}`, margin, yPosition);
          yPosition += 8;
          
          if (question.description) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(80, 80, 80);
            const descLines = pdf.splitTextToSize(question.description, contentWidth);
            pdf.text(descLines, margin, yPosition);
            yPosition += descLines.length * 5 + 5;
          }
          
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
            case 'poll':
              pdf.text(`Type: ${question.type === 'poll' ? 'Multiple Selection' : 'Multiple Choice'}`, margin, yPosition);
              yPosition += 6;
              if (question.options) {
                question.options.forEach((option, optIndex) => {
                  pdf.text(`  ${question.type === 'poll' ? '□' : String.fromCharCode(97 + optIndex)}. ${option}`, margin, yPosition);
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
          }
          
          yPosition += 8;
        });
      }
      
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
    if (!isVerified) {
      alert('Please verify your identity using Self Protocol.');
      return;
    }
    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    if (!signer) {
      alert('Please connect your wallet.');
      return;
    }

    // Prepare survey metadata for IPFS
    const surveyMetadata: SurveyMetadata = {
      title,
      description,
      questions: questions.map(q => ({
        text: q.title,
        questionType: mapQuestionType(q.type),
        options: q.options || (q.type === 'rating' ? Array.from({ length: (q.maxRating || 5) - (q.minRating || 1) + 1 }, (_, i) => String(i + (q.minRating || 1))) : []),
        isRequired: q.required || false,
      })),
      restrictions: {
        tokenGating: {
          type: 'ERC20',
          contractAddress: TOKEN_CONTRACT_ADDRESS,
          minBalance: '10', // Example: 10 tokens
        },
        maxResponses: expectedResponses,
        geographicRestrictions: [], // Add if needed
      },
    };

    // Upload to IPFS via Lighthouse
    try {
      const uploadResponse = await lighthouse.upload(
        new Blob([JSON.stringify(surveyMetadata)], { type: 'application/json' }),
        LIGHTHOUSE_API_KEY
      );
      const cid = uploadResponse.data.Hash;
      setSurveyCID(cid);

      // Interact with ZVASP contract
      const zvaspContract = new ethers.Contract(ZVASP_ADDRESS, ZVASP_ABI, signer);
      const totalFunding = expectedResponses * reward;
      const totalFundingWei = ethers.parseEther(totalFunding.toString());
      const contractQuestions = surveyMetadata.questions.map(q => ({
        text: q.text,
        questionType: q.questionType,
        options: q.options,
        isRequired: q.isRequired,
      }));
      const tx = await zvaspContract.createSurveyWithTotalFunding(
        title,
        description,
        contractQuestions,
        totalFundingWei,
        expectedResponses,
        ethers.encodeBytes32String(cid),
        { value: totalFundingWei }
      );
      await tx.wait();
      alert(`Survey published! CID: ${cid}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error publishing survey:', error);
      alert('Failed to publish survey');
    }
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
            {Array.from({ length: (question.maxRating || 5) - (question.minRating || 1) + 1 }, (_, i) => i + (question.minRating || 1)).map((rating) => (
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
        <div className="text-center mb-8 pb-6 border-b border-paper-200">
          <h1 className="text-3xl font-bold text-ink-800 mb-4">{title || 'Survey Title'}</h1>
          <p className="text-lg text-ink-600 mb-4">{description || 'Survey description will appear here.'}</p>
          <div className="flex items-center justify-center space-x-6 text-sm text-ink-500">
            <span className="flex items-center space-x-1">
              <Coins size={16} />
              <span>{reward} KDA reward</span>
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

        <div className="mt-8 pt-6 border-t border-paper-200 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">
              Complete this survey to earn {reward} KDA
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Survey</h1>
          <p className="text-xl text-neutral-400">Build an engaging survey with our intuitive form builder</p>
          <p className="text-sm text-neutral-500 mt-2">Account: {account || 'Not connected'} | Verification Status: {isVerified ? 'Verified' : 'Not Verified'}</p>
        </div>

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
                <label className="block text-sm font-medium text-neutral-300 mb-2">Reward per Response (KDA) *</label>
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
                    {expectedResponses} responses × {reward} KDA = <strong>{(expectedResponses * reward).toFixed(4)} KDA</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Survey Questions</h2>
          <FormBuilder questions={questions} onQuestionsChange={setQuestions} />
        </div>

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
              disabled={!isValid || !isVerified}
            >
              <Rocket size={16} />
              <span>Publish Survey</span>
            </button>
          </div>
        </div>

        {surveyCID && (
          <div className="mt-4 text-neutral-300">
            Survey CID: <a href={`https://ipfs.io/ipfs/${surveyCID}`} target="_blank" className="text-purple-500">{surveyCID}</a>
          </div>
        )}

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
                <span className="font-medium">{(expectedResponses * reward).toFixed(2)} KDA</span>
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
    </div>
  );
}