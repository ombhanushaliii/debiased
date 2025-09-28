'use client'

import { useEffect, useState } from 'react'
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode'
import { SelfAppBuilder } from '@selfxyz/qrcode'
import { ethers } from 'ethers'
import { useWallet } from './WalletContext'

interface VerifyProps {
  onSuccess: () => void
  userAddress?: string 
}

export default function Verify({ onSuccess, userAddress: propUserAddress }: VerifyProps) {
  const { account, isConnected, connectWallet } = useWallet()
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(propUserAddress || account || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initSelfApp = async () => {
      try {
        // Use wallet context address or prompt to connect
        const activeAddress = propUserAddress || account
        if (!activeAddress) {
          if (!isConnected) {
            setError('Please connect your wallet first.')
            setLoading(false)
            return
          }
        }

        const finalAddress = activeAddress || account
        if (!finalAddress) return
        
        setUserAddress(finalAddress)

        const userId = finalAddress
        const userDataHex = ethers.getBytes(ethers.toBeHex(finalAddress, 32))

        const app = new SelfAppBuilder({
          version: 2,
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Proof of Human',
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'proof-of-human',
          endpoint: "0xA91733b5641d627eD461420D0EC1D1277fC7bF37".toLowerCase(),
          logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
          userId,
          endpointType: 'staging_celo',  // Key: On-chain verification
          userIdType: 'hex',  // EVM address
          userDefinedData: String(userDataHex),  // Encoded user address for contract's userData
          disclosures: {
            // Match contract config
            minimumAge: 18,
            excludedCountries: [ countries.IRAN, countries.NORTH_KOREA, countries.RUSSIA],
            nationality: true,
            gender: true,
          },
        }).build()

        setSelfApp(app)
      } catch (err) {
        setError('Failed to initialize verification.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    initSelfApp()
  }, [account, isConnected, propUserAddress])

  const handleSuccessfulVerification = async () => {
    // Optional: Poll contract for verification status or listen to events
    onSuccess()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading verification...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-red-500">{error}</p>
        {!isConnected && (
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Verify Your Identity</h1>
      <p className="mb-4">Scan with Self app to prove you&apos;re human (18+, not from excluded countries).</p>
      <p className="mb-4 text-sm text-gray-600">User: {userAddress}</p>
      {selfApp ? (
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={(err) => {
            console.error('Verification error:', err)
            setError('Verification failed. Try again.')
          }}
          size={300}
        />
      ) : (
        <p>Failed to load QR code.</p>
      )}
    </div>
  )
}