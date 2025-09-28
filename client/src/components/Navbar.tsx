'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, Menu, X } from 'lucide-react';
import Modal from './Modal';
import AnimatedButton from './AnimatedButton';
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
      <nav className="bg-neutral-950 border-b border-neutral-800 shadow-paper sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                DeBiased
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/community" className="text-neutral-300 hover:text-white transition-colors">
                Community
              </Link>
              <Link href="/create" className="text-neutral-300 hover:text-white transition-colors">
                Create Survey
              </Link>
              <Link href="/dashboard" className="text-neutral-300 hover:text-white transition-colors">
                Dashboard
              </Link>

              {isConnected ? (
                <div className="flex items-center space-x-2 bg-green-900 text-green-100 px-3 py-2 rounded-lg border border-green-700">
                  <Wallet size={16} />
                  <span className="text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                  {balance && <span className="text-sm ml-2">{balance} ETH</span>}
                </div>
              ) : (
                <AnimatedButton
                  onClick={() => setIsWalletModalOpen(true)}
                  className="text-sm"
                >
                  <span className="flex items-center space-x-2">
                    <Wallet size={14} />
                    <span>Connect Wallet</span>
                  </span>
                </AnimatedButton>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-neutral-800 transition-colors text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-800">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/community" className="text-neutral-300 hover:text-white transition-colors">
                  Community
                </Link>
                <Link href="/create" className="text-neutral-300 hover:text-white transition-colors">
                  Create Survey
                </Link>
                <Link href="/dashboard" className="text-neutral-300 hover:text-white transition-colors">
                  Dashboard
                </Link>

                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-green-900 text-green-100 px-3 py-2 rounded-lg border border-green-700 w-fit">
                    <Wallet size={16} />
                    <span className="text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                    {balance && <span className="text-sm ml-2">{balance} ETH</span>}
                  </div>
                ) : (
                  <AnimatedButton
                    onClick={() => setIsWalletModalOpen(true)}
                    className="w-fit text-sm"
                  >
                    <span className="flex items-center space-x-2">
                      <Wallet size={14} />
                      <span>Connect Wallet</span>
                    </span>
                  </AnimatedButton>
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
          <p className="text-neutral-300">
            Connect your Web3 wallet to participate in surveys and earn rewards.
          </p>
          <div className="space-y-2">
            <AnimatedButton
              onClick={handleConnectWallet}
              className="w-full"
            >
              MetaMask
            </AnimatedButton>
            <AnimatedButton
              onClick={handleConnectWallet}
              className="w-full"
            >
              WalletConnect
            </AnimatedButton>
            <AnimatedButton
              onClick={handleConnectWallet}
              className="w-full"
            >
              Coinbase Wallet
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </>
  );
}