'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BackgroundBeams } from '@/components/ui/background-beams';
import SurveyCard from '@/components/SurveyCard';
import { mockSurveys } from '@/lib/mockData';
import { Search, Filter, BarChart3 } from 'lucide-react';

export default function SurveyIndexPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState(mockSurveys);
  const [filteredSurveys, setFilteredSurveys] = useState(mockSurveys);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort surveys
  useEffect(() => {
    let filtered = surveys;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterBy) {
      case 'active':
        filtered = filtered.filter(survey => survey.status === 'active');
        break;
      case 'high-reward':
        filtered = filtered.filter(survey => survey.reward >= 0.001);
        break;
      case 'almost-complete':
        filtered = filtered.filter(survey => {
          const progress = (survey.currentResponses / survey.expectedResponses) * 100;
          return progress >= 80;
        });
        break;
    }

    // Apply sorting
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the actual filtering
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      <Navbar />
      <BackgroundBeams />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Surveys</h1>
          <p className="text-xl text-neutral-400">
            Discover and participate in surveys to earn rewards
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-xl text-center border border-purple-700">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{surveys.length}</div>
            <div className="text-purple-200">Available Surveys</div>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-xl text-center border border-green-700">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">
              {surveys.reduce((total, survey) => total + survey.currentResponses, 0)}
            </div>
            <div className="text-green-200">Total Responses</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-xl text-center border border-blue-700">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">
              {surveys.reduce((total, survey) => total + (survey.reward * survey.expectedResponses), 0).toFixed(3)}
            </div>
            <div className="text-blue-200">Total Rewards (ETH)</div>
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
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-purple-500 transition-colors duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-2 min-w-[160px] focus:outline-none focus:border-purple-500 transition-colors duration-200"
            >
              <option value="all">All Surveys</option>
              <option value="active">Active Only</option>
              <option value="high-reward">High Reward</option>
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
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
                setSortBy('newest');
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}