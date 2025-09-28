'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service in production
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-paper-100 flex items-center justify-center p-4">
          <div className="paper-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>

            <h1 className="text-2xl font-bold text-ink-800 mb-4">Something went wrong</h1>
            <p className="text-ink-600 mb-6">
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="paper-button-primary w-full flex items-center justify-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Try again</span>
              </button>

              <Link
                href="/"
                className="paper-button w-full flex items-center justify-center space-x-2"
              >
                <Home size={16} />
                <span>Go home</span>
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-ink-500 hover:text-ink-700">
                  Error details (development only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded border overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again."
}: ErrorFallbackProps) {
  return (
    <div className="paper-card p-6 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="text-red-600" size={24} />
      </div>

      <h3 className="text-lg font-semibold text-ink-800 mb-2">{title}</h3>
      <p className="text-ink-600 mb-4">{message}</p>

      {resetError && (
        <button
          onClick={resetError}
          className="paper-button flex items-center space-x-2 mx-auto"
        >
          <RefreshCw size={16} />
          <span>Try again</span>
        </button>
      )}

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-ink-500">
            Error details
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border overflow-auto max-h-32">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
}