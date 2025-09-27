'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, Menu, X } from 'lucide-react';
import Modal from './Modal';
import { useWallet } from '@/components/WalletContext'; // Adjust the path

export default function Navbar() {
  const { isConnected, account, balance, connectWallet } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleConnectWallet = () => {
    setIsWalletModalOpen(false);
    connectWallet();
  };

  return (
    <>
      <nav className="bg-paper-50 border-b border-paper-200 shadow-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-ink-800">
                SurveyZK
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-ink-600 hover:text-ink-800 transition-colors">
                Home
              </Link>
              <Link href="/community" className="text-ink-600 hover:text-ink-800 transition-colors">
                Community
              </Link>
              <Link href="/create" className="text-ink-600 hover:text-ink-800 transition-colors">
                Create Survey
              </Link>
              <Link href="/dashboard" className="text-ink-600 hover:text-ink-800 transition-colors">
                Dashboard
              </Link>

              {isConnected ? (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-paper">
                  <Wallet size={16} />
                  <span className="text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                  {balance && <span className="text-sm ml-2">{balance} ETH</span>}
                </div>
              ) : (
                <button
                  id="connect-button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="paper-button-primary flex items-center space-x-2"
                >
                  <Wallet size={16} />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-paper-200 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-paper-200">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-ink-600 hover:text-ink-800 transition-colors">
                  Home
                </Link>
                <Link href="/community" className="text-ink-600 hover:text-ink-800 transition-colors">
                  Community
                </Link>
                <Link href="/create" className="text-ink-600 hover:text-ink-800 transition-colors">
                  Create Survey
                </Link>
                <Link href="/dashboard" className="text-ink-600 hover:text-ink-800 transition-colors">
                  Dashboard
                </Link>

                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-paper w-fit">
                    <Wallet size={16} />
                    <span className="text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                    {balance && <span className="text-sm ml-2">{balance} ETH</span>}
                  </div>
                ) : (
                  <button
                    id="connect-button"
                    onClick={() => setIsWalletModalOpen(true)}
                    className="paper-button-primary flex items-center space-x-2 w-fit"
                  >
                    <Wallet size={16} />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Wallet Connection Modal */}
      <Modal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title="Connect Your Wallet"
      >
        <div className="space-y-4">
          <p className="text-ink-600">
            Connect your Web3 wallet to participate in surveys and earn rewards.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleConnectWallet}
              className="w-full paper-button-primary"
            >
              MetaMask
            </button>
            <button
              onClick={handleConnectWallet}
              className="w-full paper-button"
            >
              WalletConnect
            </button>
            <button
              onClick={handleConnectWallet}
              className="w-full paper-button"
            >
              Coinbase Wallet
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}