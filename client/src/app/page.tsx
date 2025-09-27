'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Search, Shield, Users, Coins, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation'
import Verify from '@/components/Verify';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [verified, setVerified] = useState(false)
  const router = useRouter()

  const handleVerifySuccess = () => {
    setVerified(true)
    router.push('/verify')
  }

  if (verified) {
    return null  // Redirect handled in layout or use effect
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to community page with search query
    if (searchQuery.trim()) {
      window.location.href = `/community?search=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/community';
    }
  };

  return (
    <div className="min-h-screen bg-paper-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-ink-800 mb-6 leading-tight">
            Anonymous Surveys with
            <span className="text-ink-600 block mt-2">ZKP Technology</span>
          </h1>
          <p className="text-xl text-ink-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create and participate in completely anonymous surveys while earning crypto rewards.
            Your privacy is protected by zero-knowledge proofs.
          </p>

          <Verify onSuccess={handleVerifySuccess} />

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full paper-input pl-12 py-4 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-400" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 paper-button-primary py-2"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/community" className="paper-button-primary text-lg px-8 py-4 flex items-center space-x-2">
              <span>Browse Surveys</span>
              <ArrowRight size={20} />
            </Link>
            <Link href="/create" className="paper-button text-lg px-8 py-4">
              Create Survey
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-paper-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ink-800 mb-4">How It Works</h2>
            <p className="text-xl text-ink-600 max-w-2xl mx-auto">
              Our platform ensures complete anonymity while providing valuable insights and fair rewards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="paper-card p-6 text-center">
              <div className="w-16 h-16 bg-ink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-paper-50" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-ink-800 mb-3">1. Anonymous Connection</h3>
              <p className="text-ink-600 leading-relaxed">
                Connect your wallet anonymously using zero-knowledge proofs. Your identity remains completely private.
              </p>
            </div>

            {/* Step 2 */}
            <div className="paper-card p-6 text-center">
              <div className="w-16 h-16 bg-ink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-paper-50" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-ink-800 mb-3">2. Participate & Respond</h3>
              <p className="text-ink-600 leading-relaxed">
                Browse available surveys and provide honest, unbiased responses. Your answers are encrypted and anonymous.
              </p>
            </div>

            {/* Step 3 */}
            <div className="paper-card p-6 text-center">
              <div className="w-16 h-16 bg-ink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-paper-50" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-ink-800 mb-3">3. Verified Responses</h3>
              <p className="text-ink-600 leading-relaxed">
                All responses are verified for authenticity while maintaining complete anonymity through cryptographic proofs.
              </p>
            </div>

            {/* Step 4 */}
            <div className="paper-card p-6 text-center">
              <div className="w-16 h-16 bg-ink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="text-paper-50" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-ink-800 mb-3">4. Earn Rewards</h3>
              <p className="text-ink-600 leading-relaxed">
                Receive crypto rewards directly to your wallet upon survey completion. Fair compensation for your time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ink-800 mb-4">Why Choose Our Platform?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-800 mb-2">Complete Anonymity</h3>
                  <p className="text-ink-600">Zero-knowledge proofs ensure your identity and responses remain completely private.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-800 mb-2">Fair Rewards</h3>
                  <p className="text-ink-600">Earn cryptocurrency for your valuable insights and time spent on surveys.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-800 mb-2">Unbiased Data</h3>
                  <p className="text-ink-600">Anonymity promotes honest responses, providing creators with high-quality, unbiased data.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-800 mb-2">Easy to Use</h3>
                  <p className="text-ink-600">Intuitive interface makes creating and participating in surveys simple and enjoyable.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-800 mb-2">Real-time Analytics</h3>
                  <p className="text-ink-600">Survey creators get instant insights with beautiful charts and comprehensive analytics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-800 mb-2">Secure & Transparent</h3>
                  <p className="text-ink-600">Built on blockchain technology ensuring transparency and security for all transactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-ink-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-paper-50 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-paper-200 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already earning rewards while maintaining their privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/community" className="bg-paper-50 hover:bg-paper-100 text-ink-800 font-medium py-4 px-8 rounded-paper transition-colors duration-200 text-lg">
              Start Participating
            </Link>
            <Link href="/create" className="border-2 border-paper-50 text-paper-50 hover:bg-paper-50 hover:text-ink-800 font-medium py-4 px-8 rounded-paper transition-colors duration-200 text-lg">
              Create Your First Survey
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}