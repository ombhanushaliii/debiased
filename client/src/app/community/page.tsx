'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SurveyCard from '@/components/SurveyCard';
import Modal from '@/components/Modal';
import AnimatedButton from '@/components/AnimatedButton';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { mockSurveys } from '@/lib/mockData';
import { Survey } from '@/types';
import { Search, Filter, Coins, Trophy, BarChart3 } from 'lucide-react';

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>(mockSurveys);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    let filtered = [...surveys];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'high-reward':
          filtered = filtered.filter(survey => survey.reward >= 0.001);
          break;
        case 'quick':
          filtered = filtered.filter(survey => survey.questions.length <= 3);
          break;
        case 'almost-complete':
          filtered = filtered.filter(survey => {
            const progress = (survey.currentResponses / survey.expectedResponses) * 100;
            return progress >= 75;
          });
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'reward-high':
        filtered.sort((a, b) => b.reward - a.reward);
        break;
      case 'reward-low':
        filtered.sort((a, b) => a.reward - b.reward);
        break;
      case 'progress':
        filtered.sort((a, b) => {
          const progressA = (a.currentResponses / a.expectedResponses) * 100;
          const progressB = (b.currentResponses / b.expectedResponses) * 100;
          return progressB - progressA;
        });
        break;
    }

    setFilteredSurveys(filtered);
  }, [surveys, searchQuery, filterBy, sortBy]);

  const handleSurveyComplete = (surveyId: string, reward: number) => {
    // Update survey response count
    setSurveys(prev => prev.map(survey =>
      survey.id === surveyId
        ? { ...survey, currentResponses: survey.currentResponses + 1 }
        : survey
    ));

    // Show reward modal
    setRewardAmount(reward);
    setTotalEarned(prev => prev + reward);
    setShowRewardModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search params
    const url = new URL(window.location.href);
    if (searchQuery.trim()) {
      url.searchParams.set('search', searchQuery);
    } else {
      url.searchParams.delete('search');
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      <Navbar />
      <BackgroundBeams />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Community Surveys</h1>
          <p className="text-xl text-neutral-400">Participate in surveys and earn rewards while maintaining your anonymity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{surveys.length}</div>
            <div className="text-neutral-400">Active Surveys</div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Coins className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{totalEarned.toFixed(4)} ETH</div>
            <div className="text-neutral-400">Total Earned</div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">
              {surveys.reduce((total, survey) => total + survey.currentResponses, 0)}
            </div>
            <div className="text-neutral-400">Total Responses</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-purple-500 transition-colors duration-200 placeholder:text-neutral-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            <div className="flex gap-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 min-w-[140px] focus:outline-none focus:border-purple-500 transition-colors duration-200"
              >
                <option value="all">All Surveys</option>
                <option value="high-reward">High Reward (0.001+ ETH)</option>
                <option value="quick">Quick (≤3 questions)</option>
                <option value="almost-complete">Almost Complete</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 min-w-[140px] focus:outline-none focus:border-purple-500 transition-colors duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="reward-high">Highest Reward</option>
                <option value="reward-low">Lowest Reward</option>
                <option value="progress">Most Progress</option>
              </select>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-neutral-400">
            Showing {filteredSurveys.length} of {surveys.length} surveys
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Survey Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onComplete={handleSurveyComplete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-neutral-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No surveys found</h3>
            <p className="text-neutral-400 mb-4">
              {searchQuery
                ? `No surveys match your search for "${searchQuery}"`
                : 'No surveys match your current filters'
              }
            </p>
            <AnimatedButton
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
                setSortBy('newest');
              }}
            >
              Clear filters
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Reward Modal */}
      <Modal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        title="Survey Completed!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <Coins className="text-white" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-ink-800 mb-2">Congratulations!</h3>
            <p className="text-ink-600 mb-4">
              You&apos;ve successfully completed the survey and earned:
            </p>
            <div className="text-3xl font-bold text-green-600 mb-4">
              {rewardAmount} ETH
            </div>
            <p className="text-sm text-ink-500">
              Reward has been sent to your wallet
            </p>
          </div>
          <AnimatedButton
            onClick={() => setShowRewardModal(false)}
            className="w-full"
          >
            Continue Exploring
          </AnimatedButton>
        </div>
      </Modal>
    </div>
  );
}