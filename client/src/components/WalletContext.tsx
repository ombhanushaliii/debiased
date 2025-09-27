'use client';

// Add global declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  isConnected: boolean;
  account: string;
  balance: string;
  connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);

        const result = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        });
        const wei = parseInt(result, 16);
        const ethBalance = wei / (10 ** 18);
        setBalance(ethBalance.toFixed(4));
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    // Optional: Restore state from localStorage if needed
    const savedAccount = localStorage.getItem('walletAccount');
    const savedIsConnected = localStorage.getItem('walletConnected');
    if (savedAccount && savedIsConnected === 'true') {
      setAccount(savedAccount);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      localStorage.setItem('walletAccount', account);
      localStorage.setItem('walletConnected', 'true');
    } else {
      localStorage.removeItem('walletAccount');
      localStorage.removeItem('walletConnected');
    }
  }, [isConnected, account]);

  return (
    <WalletContext.Provider value={{ isConnected, account, balance, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};