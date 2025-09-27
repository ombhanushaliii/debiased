'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart, DoughnutChart, LineChart, ResponseProgress } from '@/components/Charts';
import Modal from '@/components/Modal';
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
  Target
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);

  // Mock user surveys (in real app, this would come from API)
  const userSurveys = mockSurveys.slice(0, 3);
  const totalResponses = userSurveys.reduce((sum, survey) => sum + survey.currentResponses, 0);
  const totalEarnings = userSurveys.reduce((sum, survey) => sum + (survey.currentResponses * survey.reward), 0);

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
      return <div className="text-ink-600">No analytics data available</div>;
    }

    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="paper-card p-4 text-center">
            <div className="text-2xl font-bold text-ink-800">{performance.views}</div>
            <div className="text-sm text-ink-600">Total Views</div>
          </div>
          <div className="paper-card p-4 text-center">
            <div className="text-2xl font-bold text-ink-800">{Math.round(performance.startRate * 100)}%</div>
            <div className="text-sm text-ink-600">Start Rate</div>
          </div>
          <div className="paper-card p-4 text-center">
            <div className="text-2xl font-bold text-ink-800">{Math.round(performance.completionRate * 100)}%</div>
            <div className="text-sm text-ink-600">Completion Rate</div>
          </div>
          <div className="paper-card p-4 text-center">
            <div className="text-2xl font-bold text-ink-800">{performance.averageTime}m</div>
            <div className="text-sm text-ink-600">Avg. Time</div>
          </div>
        </div>

        {/* Response Progress */}
        <div className="paper-card p-6">
          <ResponseProgress
            currentResponses={survey.currentResponses}
            expectedResponses={survey.expectedResponses}
          />
        </div>

        {/* Daily Responses Chart */}
        <div className="paper-card p-6">
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
            <div key={qa.questionId} className="paper-card p-6">
              <h3 className="text-lg font-semibold text-ink-800 mb-4">
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
                  <div className="bg-paper-200 rounded-paper p-4">
                    <p className="text-sm text-ink-700"><strong>Summary:</strong> {qa.summary}</p>
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
                  <div className="bg-paper-200 rounded-paper p-4">
                    <p className="text-sm text-ink-700"><strong>Summary:</strong> {qa.summary}</p>
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
                          borderColor: '#cfc9be',
                          borderWidth: 2,
                        },
                      ],
                    }}
                  />
                  <div className="bg-paper-200 rounded-paper p-4">
                    <p className="text-sm text-ink-700"><strong>Summary:</strong> {qa.summary}</p>
                  </div>
                </div>
              )}

              {qa.questionType === 'text' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {qa.responses.map((theme: any, i: number) => (
                      <div key={i} className="bg-paper-200 rounded-paper p-3 text-center">
                        <div className="text-lg font-semibold text-ink-800">{theme.count}</div>
                        <div className="text-sm text-ink-600">{theme.theme}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-paper-200 rounded-paper p-4">
                    <p className="text-sm text-ink-700"><strong>Summary:</strong> {qa.summary}</p>
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
    <div className="min-h-screen bg-paper-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-ink-800 mb-2">Creator Dashboard</h1>
            <p className="text-xl text-ink-600">Manage your surveys and analyze responses</p>
          </div>
          <a
            href="/create"
            className="paper-button-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Survey</span>
          </a>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="paper-card p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-paper-50" size={24} />
            </div>
            <div className="text-2xl font-bold text-ink-800">{userSurveys.length}</div>
            <div className="text-ink-600">Active Surveys</div>
          </div>

          <div className="paper-card p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-paper-50" size={24} />
            </div>
            <div className="text-2xl font-bold text-ink-800">{totalResponses}</div>
            <div className="text-ink-600">Total Responses</div>
          </div>

          <div className="paper-card p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="text-paper-50" size={24} />
            </div>
            <div className="text-2xl font-bold text-ink-800">{totalEarnings.toFixed(2)} ETH</div>
            <div className="text-ink-600">Paid in Rewards</div>
          </div>

          <div className="paper-card p-6 text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-paper-50" size={24} />
            </div>
            <div className="text-2xl font-bold text-ink-800">
              {Math.round((totalResponses / userSurveys.reduce((sum, s) => sum + s.expectedResponses, 0)) * 100)}%
            </div>
            <div className="text-ink-600">Avg. Progress</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="paper-card mb-8">
          <div className="flex border-b border-paper-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-ink-800 border-b-2 border-ink-600'
                  : 'text-ink-600 hover:text-ink-800'
              }`}
            >
              Survey Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-ink-800 border-b-2 border-ink-600'
                  : 'text-ink-600 hover:text-ink-800'
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {userSurveys.map((survey) => (
                  <div key={survey.id} className="paper-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-ink-800 mb-2">{survey.title}</h3>
                        <p className="text-ink-600 mb-4 line-clamp-2">{survey.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-ink-600">
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
                          className="paper-button flex items-center space-x-1"
                        >
                          <BarChart3 size={16} />
                          <span>Analytics</span>
                        </button>
                        <button className="paper-button flex items-center space-x-1">
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-ink-600">
                        <span>Progress</span>
                        <span>{Math.round((survey.currentResponses / survey.expectedResponses) * 100)}% complete</span>
                      </div>
                      <div className="w-full bg-paper-300 rounded-full h-2">
                        <div
                          className="bg-ink-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((survey.currentResponses / survey.expectedResponses) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {userSurveys.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-paper-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="text-ink-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-ink-800 mb-2">No surveys yet</h3>
                    <p className="text-ink-600 mb-4">Create your first survey to start collecting responses</p>
                    <a href="/create" className="paper-button-primary">
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
                      <h3 className="text-2xl font-semibold text-ink-800">{selectedSurvey.title}</h3>
                      <button
                        onClick={() => setSelectedSurvey(null)}
                        className="paper-button"
                      >
                        Back to List
                      </button>
                    </div>
                    {renderAnalytics(selectedSurvey)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-ink-800 mb-4">Select a survey to view analytics</h3>
                    {userSurveys.map((survey) => (
                      <div key={survey.id} className="paper-card p-4 hover:shadow-paper-lg transition-shadow cursor-pointer"
                           onClick={() => setSelectedSurvey(survey)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-ink-800">{survey.title}</h4>
                            <p className="text-sm text-ink-600">{survey.currentResponses} responses</p>
                          </div>
                          <Activity className="text-ink-400" size={20} />
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
          <p className="text-ink-600">
            Are you sure you want to delete this survey? This action cannot be undone and all collected responses will be lost.
          </p>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 paper-button"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-paper transition-colors duration-200"
            >
              Delete Survey
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}