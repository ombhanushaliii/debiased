'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AnimatedButton from '@/components/AnimatedButton';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Search, Shield, Users, Coins, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen bg-white relative">
      <Navbar />

      {/* Hero Section with Background Beams */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 h-[40rem] flex flex-col items-center justify-center antialiased">
        <BackgroundBeams />
        
      <div className="max-w-2xl mx-auto p-4 relative z-10">
        <h1 className="relative z-10 text-lg md:text-7xl text-center font-sans font-bold mb-8 leading-tight">
          <span className="text-white">Anonymous Surveys with</span>
          <span className="block mt-4 bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent leading-normal">
            ZKP Technology
          </span>
        </h1>
        
        <p className="text-white max-w-lg mx-auto text-lg text-center relative z-10 mb-8">
          Create and participate in completely anonymous surveys while earning crypto rewards.
          Your privacy is protected by zero-knowledge proofs.
        </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8 relative z-10">
              <div className="relative rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 p-[2px] animate-pulse">
                <div className="w-full h-full bg-neutral-950 rounded-full relative">
                  <input
                    type="text"
                    placeholder="Search for surveys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-0 focus:ring-0 pl-12 pr-14 py-4 text-lg bg-transparent placeholder:text-neutral-700 text-white"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                   <button
                     type="submit"
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                   >
                     <Search className="text-white" size={18} />
                   </button>
                </div>
              </div>
            </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <AnimatedButton href="/community">
              <span className="flex items-center space-x-2">
                <span>Browse Surveys</span>
                <ArrowRight size={18} />
              </span>
            </AnimatedButton>
            <AnimatedButton href="/create">
              Create Survey
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Complete Anonymity</h3>
                  <p className="text-neutral-400">Zero-knowledge proofs ensure your identity and responses remain completely private.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Fair Rewards</h3>
                  <p className="text-neutral-400">Earn cryptocurrency for your valuable insights and time spent on surveys.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Unbiased Data</h3>
                  <p className="text-neutral-400">Anonymity promotes honest responses, providing creators with high-quality, unbiased data.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Easy to Use</h3>
                  <p className="text-neutral-400">Intuitive interface makes creating and participating in surveys simple and enjoyable.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
                  <p className="text-neutral-400">Survey creators get instant insights with beautiful charts and comprehensive analytics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Secure & Transparent</h3>
                  <p className="text-neutral-400">Built on blockchain technology ensuring transparency and security for all transactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already earning rewards while maintaining their privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton href="/community">
              Start Participating
            </AnimatedButton>
            <AnimatedButton href="/create">
              Create Your First Survey
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  );
}