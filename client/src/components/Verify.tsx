'use client'

import { useEffect, useState } from 'react'
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode'
import { SelfAppBuilder } from '@selfxyz/qrcode'
import { ethers } from 'ethers'

interface VerifyProps {
  onSuccess: () => void
  userAddress?: string 
}

export default function Verify({ onSuccess, userAddress: propUserAddress }: VerifyProps) {
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(propUserAddress || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initSelfApp = async () => {
      try {
        // Auto-connect wallet if not provided
        if (!userAddress) {
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const signer = await provider.getSigner()
            const addr = await signer.getAddress()
            setUserAddress(addr)
          } else {
            setError('Please connect your wallet (MetaMask) to Celo Sepolia.')
            setLoading(false)
            return
          }
        }

        if (!userAddress) return

        const userId = userAddress

        
        const userDataHex = ethers.getBytes(ethers.toBeHex(userAddress, 32))

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
  }, [userAddress])

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
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Verify Your Identity</h1>
      <p className="mb-4">Scan with Self app to prove you're human (18+, not from excluded countries).</p>
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