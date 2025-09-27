'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  title?: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
          color: '#564c43',
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: '600',
        },
        color: '#564c43',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#564c43',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: '#e8e6e1',
        },
      },
      y: {
        ticks: {
          color: '#564c43',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: '#e8e6e1',
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }>;
  };
  title?: string;
}

export function DoughnutChart({ data, title }: DoughnutChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
          color: '#564c43',
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: '600',
        },
        color: '#564c43',
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor?: string;
      tension?: number;
    }>;
  };
  title?: string;
}

export function LineChart({ data, title }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
          color: '#564c43',
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: '600',
        },
        color: '#564c43',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#564c43',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: '#e8e6e1',
        },
      },
      y: {
        ticks: {
          color: '#564c43',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: '#e8e6e1',
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

interface RatingVisualizationProps {
  ratings: number[];
  maxRating: number;
}

export function RatingVisualization({ ratings, maxRating }: RatingVisualizationProps) {
  const ratingCounts = Array(maxRating).fill(0);
  ratings.forEach(rating => {
    if (rating >= 1 && rating <= maxRating) {
      ratingCounts[rating - 1]++;
    }
  });

  const data = {
    labels: Array.from({ length: maxRating }, (_, i) => `${i + 1} Star${i === 0 ? '' : 's'}`),
    datasets: [
      {
        label: 'Responses',
        data: ratingCounts,
        backgroundColor: [
          '#ef4444', // red-500
          '#f97316', // orange-500
          '#eab308', // yellow-500
          '#22c55e', // green-500
          '#3b82f6', // blue-500
          '#8b5cf6', // violet-500
          '#ec4899', // pink-500
          '#06b6d4', // cyan-500
          '#84cc16', // lime-500
          '#f59e0b', // amber-500
        ].slice(0, maxRating),
        borderColor: '#cfc9be',
        borderWidth: 1,
      },
    ],
  };

  return <BarChart data={data} title="Rating Distribution" />;
}

interface ResponseProgressProps {
  currentResponses: number;
  expectedResponses: number;
}

export function ResponseProgress({ currentResponses, expectedResponses }: ResponseProgressProps) {
  const progressPercentage = (currentResponses / expectedResponses) * 100;

  const data = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [currentResponses, Math.max(0, expectedResponses - currentResponses)],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderColor: ['#16a34a', '#d1d5db'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-ink-800">Response Progress</span>
        <span className="text-sm text-ink-600">
          {currentResponses} / {expectedResponses} ({Math.round(progressPercentage)}%)
        </span>
      </div>
      <DoughnutChart data={data} />
    </div>
  );
}