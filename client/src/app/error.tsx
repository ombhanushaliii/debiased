'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-paper-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="paper-card p-8">
          {/* Error Illustration */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-600" size={40} />
          </div>

          <h1 className="text-2xl font-bold text-ink-800 mb-4">Oops! Something went wrong</h1>
          <p className="text-ink-600 mb-8 leading-relaxed">
            We encountered an unexpected error while loading this page. This has been logged and we'll look into it.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="paper-button-primary w-full flex items-center justify-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>

            <a
              href="/"
              className="paper-button w-full flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Go to Homepage</span>
            </a>

            <button
              onClick={() => window.history.back()}
              className="paper-button w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-ink-500 hover:text-ink-700">
                Error details (development only)
              </summary>
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 overflow-auto max-h-40">
                <div className="font-semibold mb-2">Error:</div>
                <pre className="whitespace-pre-wrap">{error.message}</pre>
                {error.digest && (
                  <>
                    <div className="font-semibold mt-3 mb-1">Digest:</div>
                    <code>{error.digest}</code>
                  </>
                )}
                {error.stack && (
                  <>
                    <div className="font-semibold mt-3 mb-1">Stack trace:</div>
                    <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ink-500 mb-3">If this problem persists, try:</p>
          <div className="text-sm text-ink-600 space-y-1">
            <div>• Refreshing your browser</div>
            <div>• Clearing your browser cache</div>
            <div>• Checking your internet connection</div>
          </div>
        </div>
      </div>
    </div>
  );
}