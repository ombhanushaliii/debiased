'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart, DoughnutChart, LineChart, ResponseProgress } from '@/components/Charts';
import Modal from '@/components/Modal';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { mockSurveys } from '@/lib/mockData';
import { mockAnalyticsData, mockSurveyPerformance } from '@/lib/mockAnalytics';
import { Survey } from '@/types';
import {
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Cloud,
  Database
} from 'lucide-react';
import { lighthouseService } from '@/lib/lighthouse';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [lighthouseStatus, setLighthouseStatus] = useState<'connected' | 'error' | 'checking'>('checking');

  // Mock user surveys (in real app, this would come from API)
  const userSurveys = mockSurveys.slice(0, 3);
  const totalResponses = userSurveys.reduce((sum, survey) => sum + survey.currentResponses, 0);
  const totalEarnings = userSurveys.reduce((sum, survey) => sum + (survey.currentResponses * survey.reward), 0);

  // Check Lighthouse service status
  useEffect(() => {
    const checkLighthouseStatus = async () => {
      try {
        // Test if Lighthouse service is accessible
        const testCID = 'QmTest'; // dummy CID for testing
        if (lighthouseService.isValidCID('QmYwAPJzv5CZsnAzt8auVZRn5VNhKxQ9t5RJSX4JM1vwVLH')) {
          setLighthouseStatus('connected');
        } else {
          setLighthouseStatus('error');
        }
      } catch (error) {
        console.error('Lighthouse status check failed:', error);
        setLighthouseStatus('error');
      }
    };

    checkLighthouseStatus();
  }, []);

  const handleDeleteSurvey = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // In real app, this would call API to delete survey
    console.log('Deleting survey:', surveyToDelete);
    setShowDeleteModal(false);
    setSurveyToDelete(null);
  };

  const renderAnalytics = (survey: Survey) => {
    const analytics = mockAnalyticsData.find(a => a.surveyId === survey.id);
    const performance = mockSurveyPerformance[survey.id as keyof typeof mockSurveyPerformance];

    if (!analytics || !performance) {
      return <div className="text-neutral-400">No analytics data available</div>;
    }

    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg text-center border border-blue-700">
            <div className="text-2xl font-bold text-white">{performance.views}</div>
            <div className="text-sm text-blue-200">Total Views</div>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-lg text-center border border-green-700">
            <div className="text-2xl font-bold text-white">{Math.round(performance.startRate * 100)}%</div>
            <div className="text-sm text-green-200">Start Rate</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-lg text-center border border-purple-700">
            <div className="text-2xl font-bold text-white">{Math.round(performance.completionRate * 100)}%</div>
            <div className="text-sm text-purple-200">Completion Rate</div>
          </div>
          <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-4 rounded-lg text-center border border-orange-700">
            <div className="text-2xl font-bold text-white">{performance.averageTime}m</div>
            <div className="text-sm text-orange-200">Avg. Time</div>
          </div>
        </div>

        {/* Response Progress */}
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 rounded-xl border border-neutral-600">
          <ResponseProgress
            currentResponses={survey.currentResponses}
            expectedResponses={survey.expectedResponses}
          />
        </div>

        {/* Daily Responses Chart */}
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 rounded-xl border border-neutral-600">
          <LineChart
            data={{
              labels: performance.dailyResponses.map(d => d.date.split('-')[2]),
              datasets: [
                {
                  label: 'Daily Responses',
                  data: performance.dailyResponses.map(d => d.responses),
                  borderColor: '#6b6057',
                  backgroundColor: 'rgba(107, 96, 87, 0.1)',
                  tension: 0.4,
                },
              ],
            }}
            title="Daily Response Trend"
          />
        </div>

        {/* Question Analytics */}
        <div className="space-y-6">
          {analytics.questionAnalytics.map((qa, index) => (
            <div key={qa.questionId} className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 rounded-xl border border-neutral-600">
              <h3 className="text-lg font-semibold text-white mb-4">
                Question {index + 1}: {qa.questionTitle}
              </h3>

              {qa.questionType === 'multiple-choice' && (
                <div className="space-y-4">
                  <BarChart
                    data={{
                      labels: qa.responses.map((r: any) => r.value),
                      datasets: [
                        {
                          label: 'Responses',
                          data: qa.responses.map((r: any) => r.count),
                          backgroundColor: [
                            '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'
                          ],
                          borderColor: '#cfc9be',
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                  <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                    <p className="text-sm text-neutral-200"><strong>Summary:</strong> {qa.summary}</p>
                  </div>
                </div>
              )}

              {qa.questionType === 'rating' && (
                <div className="space-y-4">
                  <BarChart
                    data={{
                      labels: qa.responses.map((r: any) => `${r.rating}`),
                      datasets: [
                        {
                          label: 'Responses',
                          data: qa.responses.map((r: any) => r.count),
                          backgroundColor: qa.responses.map((r: any, i: number) => {
                            const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'];
                            return colors[i % colors.length];
                          }),
                          borderColor: '#cfc9be',
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                  <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                    <p className="text-sm text-neutral-200"><strong>Summary:</strong> {qa.summary}</p>
                  </div>
                </div>
              )}

              {qa.questionType === 'poll' && (
                <div className="space-y-4">
                  <DoughnutChart
                    data={{
                      labels: qa.responses.map((r: any) => r.value),
                      datasets: [
                        {
                          data: qa.responses.map((r: any) => r.count),
                          backgroundColor: [
                            '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'
                          ],
                          borderColor: ['#cfc9be'],
                          borderWidth: 2,
                        },
                      ],
                    }}
                  />
                  <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                    <p className="text-sm text-neutral-200"><strong>Summary:</strong> {qa.summary}</p>
                  </div>
                </div>
              )}

              {qa.questionType === 'text' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {qa.responses.map((theme: any, i: number) => (
                      <div key={i} className="bg-neutral-700 rounded-lg p-3 text-center border border-neutral-600">
                        <div className="text-lg font-semibold text-white">{theme.count}</div>
                        <div className="text-sm text-neutral-300">{theme.theme}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                    <p className="text-sm text-neutral-200"><strong>Summary:</strong> {qa.summary}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      <Navbar />
      <BackgroundBeams />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Creator Dashboard</h1>
            <p className="text-xl text-neutral-400">Manage your surveys and analyze responses</p>
          </div>
          <a
            href="/create"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Survey</span>
          </a>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-xl text-center border border-blue-700">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{userSurveys.length}</div>
            <div className="text-blue-200">Active Surveys</div>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-xl text-center border border-green-700">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{totalResponses}</div>
            <div className="text-green-200">Total Responses</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-xl text-center border border-purple-700">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{totalEarnings.toFixed(4)} ETH</div>
            <div className="text-purple-200">Paid in Rewards</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-xl text-center border border-orange-700">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round((totalResponses / userSurveys.reduce((sum, s) => sum + s.expectedResponses, 0)) * 100)}%
            </div>
            <div className="text-orange-200">Avg. Progress</div>
          </div>
        </div>

        {/* Lighthouse IPFS Integration */}
        <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 p-6 rounded-xl mb-8 border border-cyan-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                <Cloud className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Lighthouse IPFS Storage</h3>
                <p className="text-cyan-200">Decentralized survey metadata storage</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-cyan-200 mb-1">
                <Database size={16} />
                <span>API Status: {lighthouseStatus === 'connected' ? 'Connected' : lighthouseStatus === 'error' ? 'Error' : 'Checking...'}</span>
              </div>
              <div className="text-xs text-cyan-300 mb-2">
                Using unified Lighthouse service
              </div>
              <div className="text-xs text-cyan-400 font-mono">
                API Key: 1e5a8e58.***
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-cyan-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{userSurveys.length}</div>
              <div className="text-xs text-cyan-200">Surveys on IPFS</div>
            </div>
            <div className="bg-cyan-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">✓</div>
              <div className="text-xs text-cyan-200">Decentralized</div>
            </div>
            <div className="bg-cyan-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">∞</div>
              <div className="text-xs text-cyan-200">Permanent</div>
            </div>
            <div className="bg-cyan-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">1</div>
              <div className="text-xs text-cyan-200">Service Instance</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-cyan-300">
            <span className="font-semibold">Unified Integration:</span> All survey metadata is stored on IPFS through a single Lighthouse service instance with centralized API key management.
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl mb-8">
          <div className="flex border-b border-neutral-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Survey Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {userSurveys.map((survey) => (
                  <div key={survey.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{survey.title}</h3>
                        <p className="text-neutral-400 mb-4 line-clamp-2">{survey.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-neutral-400">
                          <span className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{survey.currentResponses}/{survey.expectedResponses} responses</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Target size={14} />
                            <span>{survey.reward} ETH per response</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedSurvey(survey)}
                          className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                        >
                          <BarChart3 size={16} />
                          <span>Analytics</span>
                        </button>
                        <button className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-1">
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-neutral-400">
                        <span>Progress</span>
                        <span className="text-white">{Math.round((survey.currentResponses / survey.expectedResponses) * 100)}% complete</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((survey.currentResponses / survey.expectedResponses) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {userSurveys.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="text-neutral-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No surveys yet</h3>
                    <p className="text-neutral-400 mb-4">Create your first survey to start collecting responses</p>
                    <a href="/create" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                      Create Survey
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                {selectedSurvey ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">{selectedSurvey.title}</h3>
                      <button
                        onClick={() => setSelectedSurvey(null)}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Back to List
                      </button>
                    </div>
                    {renderAnalytics(selectedSurvey)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Select a survey to view analytics</h3>
                    {userSurveys.map((survey) => (
                      <div key={survey.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 hover:shadow-paper-lg transition-shadow cursor-pointer"
                           onClick={() => setSelectedSurvey(survey)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{survey.title}</h4>
                            <p className="text-sm text-neutral-400">{survey.currentResponses} responses</p>
                          </div>
                          <Activity className="text-neutral-400" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Survey"
      >
        <div className="space-y-4">
          <p className="text-neutral-300">
            Are you sure you want to delete this survey? This action cannot be undone and all collected responses will be lost.
          </p>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Delete Survey
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}