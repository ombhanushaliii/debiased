'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FormBuilder from '@/components/FormBuilder';
import Modal from '@/components/Modal';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Question } from '@/types';
import { Eye, Rocket, AlertCircle, Coins, Users, Clock, Shield, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { lighthouseService } from '@/lib/lighthouse';
import { useWallet } from '@/components/WalletContext';
import Verify from '@/components/Verify';

// Smart contract ABIs
const ZVASP_ABI = [
  "function createSurveyWithTotalFunding(string memory _title, string memory _description, tuple(string text, string questionType, string[] options, bool isRequired)[] memory _questions, uint256 totalFunding, uint256 maxResponses, bytes32 surveyCID) payable",
  "function verifiedUsers(address) view returns (bool)",
  "function getSurvey(uint256 _surveyId) view returns (tuple(string title, string description, address creator, uint256 totalFunding, uint256 rewardPerResponse, uint256 commission, uint256 availableFunding, uint256 responseCount, uint256 maxResponses, bool isActive, uint256 createdAt, bytes32 surveyCID))",
  "function getSurveyIdByCID(bytes32 _cid) view returns (uint256)",
  "event SurveyCreated(uint256 indexed surveyId, address indexed creator, string title, bytes32 surveyCID)"
];

// Contract addresses
const ZVASP_ADDRESS = "0x751A723b1159F448bbD6788524e47AaB858A4E8A";


interface SurveyMetadataQuestion {
  text: string;
  questionType: string;
  options: string[];
  isRequired: boolean;
}

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
  const { account, isConnected, connectWallet } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedResponses, setExpectedResponses] = useState(100);
  const [reward, setReward] = useState(1.0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [surveyCID, setSurveyCID] = useState<string>('');
  const surveyRef = useRef<HTMLDivElement>(null);

  // Initialize Web3 provider
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (account && typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          const signer = await provider.getSigner();
          setSigner(signer);
          
          // Check verification status directly from contract
          const zvaspContract = new ethers.Contract(ZVASP_ADDRESS, ZVASP_ABI, provider);
          const verified = await zvaspContract.verifiedUsers(account);
          setIsVerified(verified);
        } catch (error) {
          console.error('Error initializing Web3:', error);
        }
      }
    };
    
    initializeWeb3();
  }, [account]);

  // Validate form inputs
  // Handle successful verification
  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setShowVerifyModal(false);
  };

  const isValid = title.trim() && description.trim() && questions.length > 0 &&
    questions.every(q => q.title.trim()) && reward > 0 && expectedResponses > 0;

  // Map UI question types to contract question types
  const mapQuestionType = (uiType: string): string => {
    switch (uiType) {
      case 'text': return 'Subjective';
      case 'multiple-choice': return 'MCQ';
      case 'rating': return 'Rating';
      case 'poll': return 'MCQ';
      default: return 'Subjective';
    }
  };



  const confirmPublish = async () => {
    if (!signer) {
      alert('Please connect your wallet.');
      return;
    }

    if (!isVerified) {
      alert('Please verify your identity first.');
      return;
    }

    setIsPublishing(true);

    try {
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
            contractAddress: ZVASP_ADDRESS,
            minBalance: '10',
          },
          maxResponses: expectedResponses,
          geographicRestrictions: [],
        },
      };

      // Upload to IPFS using Lighthouse service
      const cid = await lighthouseService.uploadJSON(surveyMetadata, 'survey-metadata.json');
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

      // Create survey on blockchain
      const tx = await zvaspContract.createSurveyWithTotalFunding(
        title,
        description,
        contractQuestions,
        totalFundingWei,
        expectedResponses,
        ethers.encodeBytes32String(cid),
        { value: totalFundingWei }
      );

      const receipt = await tx.wait();
      
      // Get survey ID from event
      const surveyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = zvaspContract.interface.parseLog(log);
          return parsedLog?.name === 'SurveyCreated';
        } catch {
          return false;
        }
      });

      let surveyId = null;
      if (surveyCreatedEvent) {
        const parsedLog = zvaspContract.interface.parseLog(surveyCreatedEvent);
        surveyId = parsedLog?.args[0].toString();
      }

      alert(`Survey published successfully! CID: ${cid}`);
      setShowPublishModal(false);
      
      // Redirect to the survey page using CID
      router.push(`/survey/${cid}`);

    } catch (error) {
      console.error('Error publishing survey:', error);
      alert('Failed to publish survey: ' + (error as Error).message);
    } finally {
      setIsPublishing(false);
    }
  };



  const renderPreviewQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            placeholder="Type your answer here..."
            className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg p-3 h-32 resize-none"
            disabled
          />
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name={question.id} className="w-4 h-4 text-purple-600" disabled />
                <span className="text-neutral-300">{option}</span>
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
                className="w-10 h-10 rounded-full border-2 border-neutral-600 text-neutral-300"
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
                <input type="checkbox" className="w-4 h-4 text-purple-600" disabled />
                <span className="text-neutral-300">{option}</span>
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
      <div className="max-w-2xl mx-auto bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8 pb-6 border-b border-neutral-700">
          <h1 className="text-3xl font-bold text-white mb-4">{title || 'Survey Title'}</h1>
          <p className="text-lg text-neutral-300 mb-4">{description || 'Survey description will appear here.'}</p>
          <div className="flex items-center justify-center space-x-6 text-sm text-neutral-400">
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  {index + 1}. {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {question.description && (
                  <p className="text-neutral-300 mb-4">{question.description}</p>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
                {renderPreviewQuestion(question)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-700 text-center">
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
            <p className="text-green-200 font-medium">
              Complete this survey to earn {reward} KDA
            </p>
          </div>
          <p className="text-sm text-neutral-400">
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
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <span className="text-neutral-500">Account: {account || 'Not connected'}</span>
            <span className={`px-2 py-1 rounded text-xs ${isVerified ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
              {isVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>

        {/* Verification Status Card */}
        {account && !isVerified && (
          <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <Shield className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-yellow-100 mb-2">Identity Verification Required</h3>
                <p className="text-yellow-200 mb-4">
                  You need to verify your identity before you can publish surveys. This helps maintain the quality and trustworthiness of our platform.
                </p>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 font-medium"
                >
                  <Shield size={18} />
                  <span>Verify Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message for Verified Users */}
        {account && isVerified && (
          <div className="bg-green-900 border border-green-700 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-100 mb-2">Identity Verified ✓</h3>
                <p className="text-green-200">
                  Great! Your identity has been verified. You can now create and publish surveys on our platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Survey Details Form */}
        <div className={`bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-8 ${!account || !isVerified ? 'opacity-75' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Survey Details</h2>
            {!account || !isVerified ? (
              <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-lg text-sm">
                Verification Required
              </span>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Survey Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={!account || !isVerified ? "Please verify your identity first..." : "Enter a compelling survey title..."}
                disabled={!account || !isVerified}
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={!account || !isVerified ? "Please verify your identity first..." : "Describe your surveys purpose and what participants can expect..."}
                disabled={!account || !isVerified}
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 h-32 resize-none focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                  disabled={!account || !isVerified}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                  disabled={!account || !isVerified}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Form Builder */}
        <div className={`mb-8 ${!account || !isVerified ? 'opacity-75 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Survey Questions</h2>
            {!account || !isVerified ? (
              <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-lg text-sm">
                Verification Required
              </span>
            ) : null}
          </div>
          <FormBuilder questions={questions} onQuestionsChange={setQuestions} />
          {(!account || !isVerified) && (
            <div className="mt-4 text-center">
              <p className="text-neutral-400 mb-4">Complete identity verification to start building your survey</p>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Shield size={18} />
                <span>Verify Identity</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-sm text-neutral-400">
            {questions.length} question{questions.length !== 1 ? 's' : ''} added
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors flex items-center space-x-2"
              disabled={!isValid}
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>

            {/* Show verification first, then publish */}
            {!account ? (
              <button
                onClick={() => alert('Please connect your wallet first.')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                disabled={!isValid}
              >
                <AlertCircle size={16} />
                <span>Connect Wallet</span>
              </button>
            ) : !isVerified ? (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                disabled={!isValid}
              >
                <Shield size={16} />
                <span>Verify Identity First</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                disabled={!isValid}
              >
                <Rocket size={16} />
                <span>Publish Survey</span>
              </button>
            )}
          </div>
        </div>

        {surveyCID && (
          <div className="mt-4 text-neutral-300">
            Survey CID: <a href={lighthouseService.getIPFSUrl(surveyCID)} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">{surveyCID}</a>
          </div>
        )}

        {/* Modals */}
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
            <p className="text-neutral-300">
              Are you ready to publish this survey? Once published, it will be available to the community and you won't be able to make major changes.
            </p>

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Title:</span>
                <span className="font-medium text-white">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Questions:</span>
                <span className="font-medium text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Expected Responses:</span>
                <span className="font-medium text-white">{expectedResponses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Cost:</span>
                <span className="font-medium text-white">{(expectedResponses * reward).toFixed(2)} KDA</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                disabled={isPublishing}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Verification Modal */}
        <Modal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          title="Verify Your Identity"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-neutral-300">
              To publish a survey, you need to verify your identity first. This ensures only verified humans can create surveys.
            </p>
            <Verify onSuccess={handleVerificationSuccess} userAddress={account} />
          </div>
        </Modal>
      </div>
    </div>
  );
}