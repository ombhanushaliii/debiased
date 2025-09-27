'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2
      className={`animate-spin text-ink-600 ${sizeClasses[size]} ${className}`}
    />
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-paper-300 rounded animate-pulse h-4"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function SurveyCardSkeleton() {
  return (
    <div className="paper-card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton lines={1} className="mb-2 h-6" />
          <Skeleton lines={2} className="mb-4" />
        </div>
        <div className="ml-4">
          <div className="bg-paper-300 rounded h-6 w-16"></div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Skeleton lines={1} className="h-4 w-32" />
          <Skeleton lines={1} className="h-4 w-16" />
        </div>
        <div className="w-full bg-paper-300 rounded-full h-2"></div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton lines={1} className="h-4 w-24" />
        <div className="bg-paper-300 rounded h-8 w-24"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="paper-card p-6 animate-pulse">
            <div className="w-12 h-12 bg-paper-300 rounded-full mx-auto mb-3"></div>
            <Skeleton lines={1} className="h-6 mb-2" />
            <Skeleton lines={1} className="h-4" />
          </div>
        ))}
      </div>

      {/* Survey List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="paper-card p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Skeleton lines={1} className="h-6 mb-2" />
                <Skeleton lines={2} className="mb-4" />
                <Skeleton lines={1} className="h-4" />
              </div>
              <div className="flex space-x-2">
                <div className="bg-paper-300 rounded h-8 w-20"></div>
                <div className="bg-paper-300 rounded h-8 w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton lines={1} className="h-4 w-16" />
                <Skeleton lines={1} className="h-4 w-20" />
              </div>
              <div className="w-full bg-paper-300 rounded-full h-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormBuilderSkeleton() {
  return (
    <div className="space-y-6">
      {/* Question Types Toolbar Skeleton */}
      <div className="paper-card p-6 animate-pulse">
        <Skeleton lines={1} className="h-6 mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-paper-300 rounded p-4 h-20"></div>
          ))}
        </div>
      </div>

      {/* Questions Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="paper-card p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-5 h-5 bg-paper-300 rounded mt-2"></div>
              <div className="flex-1 space-y-4">
                <Skeleton lines={1} className="h-6" />
                <Skeleton lines={1} className="h-10" />
                <Skeleton lines={2} className="h-20" />
                <div className="space-y-2">
                  <Skeleton lines={1} className="h-8" />
                  <Skeleton lines={1} className="h-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-paper-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-ink-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ButtonLoading({
  children,
  loading = false,
  disabled = false,
  className = '',
  onClick
}: ButtonLoadingProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}