'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BackgroundBeams } from '@/components/ui/background-beams';
import Modal from '@/components/Modal';
import AnimatedButton from '@/components/AnimatedButton';
import { Clock, Users, Coins, ArrowRight, CheckCircle, AlertCircle, Share2, Copy, ExternalLink, Shield } from 'lucide-react';
import { ethers } from 'ethers';
import { lighthouseService } from '@/lib/lighthouse';
import { useWallet } from '@/components/WalletContext';
import Verify from '@/components/Verify';

interface SurveyQuestion {
  text: string;
  questionType: string;
  options: string[];
  isRequired: boolean;
}

interface SurveyMetadata {
  title: string;
  description: string;
  questions: SurveyQuestion[];
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

interface BlockchainSurvey {
  title: string;
  description: string;
  creator: string;
  totalFunding: bigint;
  rewardPerResponse: bigint;
  commission: bigint;
  availableFunding: bigint;
  responseCount: bigint;
  maxResponses: bigint;
  isActive: boolean;
  createdAt: bigint;
  surveyCID: string;
}

// Smart contract ABIs
const ZVASP_ABI = [
  "function getSurvey(uint256 _surveyId) view returns (tuple(string title, string description, address creator, uint256 totalFunding, uint256 rewardPerResponse, uint256 commission, uint256 availableFunding, uint256 responseCount, uint256 maxResponses, bool isActive, uint256 createdAt, bytes32 surveyCID))",
  "function submitResponse(uint256 _surveyId, string[] calldata _answers) external",
  "function getSurveyIdByCID(bytes32 _cid) view returns (uint256)",
  "function verifiedUsers(address) view returns (bool)",
  "function hasUserResponded(uint256 _surveyId, address _user) view returns (bool)",
  "event ResponseSubmitted(uint256 indexed surveyId, address indexed respondent, uint256 rewardAmount)"
];

const ZVASP_ADDRESS = "0x751A723b1159F448bbD6788524e47AaB858A4E8A";

export default function SurveyViewPage() {
  const params = useParams();
  const router = useRouter();
  const { account, isConnected, connectWallet } = useWallet();
  const cid = params?.cid as string;

  // State management
  const [surveyMetadata, setSurveyMetadata] = useState<SurveyMetadata | null>(null);
  const [blockchainSurvey, setBlockchainSurvey] = useState<BlockchainSurvey | null>(null);
  const [surveyId, setSurveyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  // Survey taking state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionIndex: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<string>('0');

  // Initialize Web3 and load survey data
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (account && typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          const signer = await provider.getSigner();
          setSigner(signer);
          
          // Check verification status
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

  // Load survey data
  useEffect(() => {
    const loadSurveyData = async () => {
      if (!cid || !provider) return;
      
      setLoading(true);
      setError(null);

      try {
        // Load metadata from IPFS using Lighthouse service
        const metadata = await lighthouseService.fetchContent(cid);
        setSurveyMetadata(metadata);

        // Get survey from blockchain using CID
        const zvaspContract = new ethers.Contract(ZVASP_ADDRESS, ZVASP_ABI, provider);
        
        try {
          const surveyIdFromCID = await zvaspContract.getSurveyIdByCID(ethers.encodeBytes32String(cid));
          setSurveyId(Number(surveyIdFromCID));

          const blockchainData = await zvaspContract.getSurvey(surveyIdFromCID);
          setBlockchainSurvey({
            title: blockchainData[0],
            description: blockchainData[1],
            creator: blockchainData[2],
            totalFunding: blockchainData[3],
            rewardPerResponse: blockchainData[4],
            commission: blockchainData[5],
            availableFunding: blockchainData[6],
            responseCount: blockchainData[7],
            maxResponses: blockchainData[8],
            isActive: blockchainData[9],
            createdAt: blockchainData[10],
            surveyCID: blockchainData[11]
          });

          // Check if user has already responded
          if (account) {
            const responded = await zvaspContract.hasUserResponded(surveyIdFromCID, account);
            setHasResponded(responded);
          }

        } catch (contractError) {
          console.warn('Survey not found on blockchain or contract error:', contractError);
          // Still show the survey from IPFS even if blockchain data is not available
        }

      } catch (err) {
        console.error('Error loading survey:', err);
        setError('Failed to load survey. Please check the CID and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSurveyData();
  }, [cid, provider, account]);

  // Handle successful verification
  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setShowVerifyModal(false);
  };

  // Handle survey taking
  const handleStartSurvey = () => {
    if (!account) {
      alert('Please connect your wallet to participate');
      return;
    }
    if (!isVerified) {
      setShowVerifyModal(true);
      return;
    }
    if (hasResponded) {
      alert('You have already responded to this survey');
      return;
    }
    if (blockchainSurvey && !blockchainSurvey.isActive) {
      alert('This survey is no longer active');
      return;
    }

    setIsModalOpen(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleNext = () => {
    if (!surveyMetadata) return;
    
    if (currentQuestionIndex < surveyMetadata.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!signer || !surveyMetadata || !surveyId) {
      alert('Unable to submit response. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare answers array
      const answerArray = surveyMetadata.questions.map((_, index) => answers[index] || '');
      
      // Submit to blockchain
      const zvaspContract = new ethers.Contract(ZVASP_ADDRESS, ZVASP_ABI, signer);
      const tx = await zvaspContract.submitResponse(surveyId, answerArray);
      
      // Wait for transaction
      const receipt = await tx.wait();
      
      // Get reward amount from event
      const responseEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = zvaspContract.interface.parseLog(log);
          return parsedLog?.name === 'ResponseSubmitted';
        } catch {
          return false;
        }
      });

      if (responseEvent && blockchainSurvey) {
        const rewardInEth = ethers.formatEther(blockchainSurvey.rewardPerResponse);
        setRewardAmount(rewardInEth);
      }

      setIsModalOpen(false);
      setShowSuccessModal(true);
      setHasResponded(true);

    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const renderQuestion = (question: SurveyQuestion, questionIndex: number) => {
    const currentAnswer = answers[questionIndex];

    switch (question.questionType) {
      case 'Subjective':
        return (
          <textarea
            placeholder="Type your answer here..."
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg p-4 h-32 resize-none focus:outline-none focus:border-purple-500 transition-colors"
          />
        );

      case 'MCQ':
        return (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-neutral-300 group-hover:text-white transition-colors">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'Rating':
        return (
          <div className="flex items-center space-x-2">
            {question.options.map((rating, ratingIndex) => (
              <button
                key={ratingIndex}
                onClick={() => handleAnswerChange(questionIndex, rating)}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 font-medium ${
                  currentAnswer === rating
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                    : 'border-neutral-600 text-neutral-300 hover:border-purple-400 hover:text-white'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      default:
        return (
          <textarea
            placeholder="Type your answer here..."
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg p-4 h-32 resize-none focus:outline-none focus:border-purple-500 transition-colors"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 relative">
        <Navbar />
        <BackgroundBeams />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 relative">
        <Navbar />
        <BackgroundBeams />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Survey Not Found</h2>
            <p className="text-neutral-400 mb-4">{error}</p>
            <AnimatedButton onClick={() => router.push('/community')}>
              Browse Surveys
            </AnimatedButton>
          </div>
        </div>
      </div>
    );
  }

  if (!surveyMetadata) {
    return (
      <div className="min-h-screen bg-neutral-950 relative">
        <Navbar />
        <BackgroundBeams />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Survey Unavailable</h2>
            <p className="text-neutral-400">Unable to load survey metadata.</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = blockchainSurvey 
    ? (Number(blockchainSurvey.responseCount) / Number(blockchainSurvey.maxResponses)) * 100
    : 0;

  const rewardPerResponse = blockchainSurvey 
    ? ethers.formatEther(blockchainSurvey.rewardPerResponse)
    : '0';

  const isCurrentQuestion = surveyMetadata.questions[currentQuestionIndex];
  const canProceed = !isCurrentQuestion?.isRequired || answers[currentQuestionIndex] !== undefined;

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      <Navbar />
      <BackgroundBeams />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Survey Header */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">{surveyMetadata.title}</h1>
            <p className="text-xl text-neutral-300 mb-6">{surveyMetadata.description}</p>
            
            {/* Survey Stats */}
            <div className="flex items-center justify-center space-x-8 text-sm text-neutral-400 mb-6">
              <span className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">{rewardPerResponse} KDA reward</span>
              </span>
              {blockchainSurvey && (
                <>
                  <span className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{Number(blockchainSurvey.responseCount)}/{Number(blockchainSurvey.maxResponses)} responses</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>~{surveyMetadata.questions.length * 2} min</span>
                  </span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {blockchainSurvey && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                  <span>Survey Progress</span>
                  <span>{Math.round(progressPercentage)}% complete</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <AnimatedButton
              onClick={handleStartSurvey}
              disabled={hasResponded || (blockchainSurvey && !blockchainSurvey.isActive) || false}
              className="flex items-center space-x-2"
            >
              {hasResponded ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Already Completed</span>
                </>
              ) : !isVerified ? (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Verify Identity</span>
                </>
              ) : (
                <>
                  <span>Start Survey</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </AnimatedButton>

            {/* Share Button */}
            <button
              onClick={() => copyToClipboard(shareUrl)}
              className="flex items-center space-x-2 px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>Share Survey</span>
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              account 
                ? 'bg-green-900 text-green-200' 
                : 'bg-yellow-900 text-yellow-200'
            }`}>
              {account ? '✓ Wallet Connected' : '⚠ Connect Wallet'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isVerified 
                ? 'bg-green-900 text-green-200' 
                : 'bg-red-900 text-red-200'
            }`}>
              {isVerified ? '✓ Verified' : '✗ Not Verified'}
            </span>
            {blockchainSurvey && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                blockchainSurvey.isActive 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-red-900 text-red-200'
              }`}>
                {blockchainSurvey.isActive ? '✓ Active' : '✗ Inactive'}
              </span>
            )}
          </div>
        </div>

        {/* Survey Details */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Survey Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Questions</h3>
              <div className="space-y-2">
                {surveyMetadata.questions.map((question, index) => (
                  <div key={index} className="bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                    <p className="text-neutral-300 mb-1">
                      {index + 1}. {question.text}
                      {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-neutral-500">Type: {question.questionType}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {blockchainSurvey && (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Creator</h3>
                    <p className="text-neutral-300 font-mono text-sm break-all">
                      {blockchainSurvey.creator}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Survey CID</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-neutral-300 font-mono text-sm break-all flex-1">{cid}</p>
                      <button
                        onClick={() => copyToClipboard(cid)}
                        className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4 text-neutral-300" />
                      </button>
                      <a
                        href={lighthouseService.getIPFSUrl(cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-neutral-300" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Funding</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-neutral-300">
                        Total: {ethers.formatEther(blockchainSurvey.totalFunding)} KDA
                      </p>
                      <p className="text-neutral-300">
                        Available: {ethers.formatEther(blockchainSurvey.availableFunding)} KDA
                      </p>
                      <p className="text-neutral-300">
                        Per Response: {ethers.formatEther(blockchainSurvey.rewardPerResponse)} KDA
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Survey Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={surveyMetadata.title}
          size="lg"
        >
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>Question {currentQuestionIndex + 1} of {surveyMetadata.questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / surveyMetadata.questions.length) * 100)}% complete</span>
            </div>

            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / surveyMetadata.questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            {isCurrentQuestion && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isCurrentQuestion.text}
                    {isCurrentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>

                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
                  {renderQuestion(isCurrentQuestion, currentQuestionIndex)}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : (
                  currentQuestionIndex === surveyMetadata.questions.length - 1 ? 'Submit' : 'Next'
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Survey Completed!"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-white h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
              <p className="text-neutral-300 mb-4">
                You've successfully completed the survey and earned:
              </p>
              <div className="text-3xl font-bold text-green-400 mb-4">
                {rewardAmount} KDA
              </div>
              <p className="text-sm text-neutral-400">
                The reward has been sent to your wallet
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <AnimatedButton onClick={() => setShowSuccessModal(false)}>
                Continue
              </AnimatedButton>
              <button
                onClick={() => router.push('/community')}
                className="px-6 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Browse More Surveys
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
              To participate in surveys, you need to verify your identity first. This ensures only verified humans can respond to surveys and earn rewards.
            </p>
            <Verify onSuccess={handleVerificationSuccess} userAddress={account} />
          </div>
        </Modal>
      </div>
    </div>
  );
}