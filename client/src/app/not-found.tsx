import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="paper-card p-8">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-paper-300 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-ink-600 rounded-full flex items-center justify-center">
                <Search className="text-paper-50" size={32} />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink-800 mb-4">Page Not Found</h1>
          <p className="text-ink-600 mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="paper-button-primary w-full flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Go to Homepage</span>
            </Link>

            <Link
              href="/community"
              className="paper-button w-full flex items-center justify-center space-x-2"
            >
              <Search size={16} />
              <span>Browse Surveys</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="paper-button w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ink-500 mb-3">Need help? Try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/community" className="text-ink-600 hover:text-ink-800 underline">
              Community
            </Link>
            <Link href="/create" className="text-ink-600 hover:text-ink-800 underline">
              Create Survey
            </Link>
            <Link href="/dashboard" className="text-ink-600 hover:text-ink-800 underline">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}