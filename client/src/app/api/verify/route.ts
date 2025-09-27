import { NextRequest, NextResponse } from 'next/server'
import { SelfBackendVerifier, DefaultConfigStore, AllIds } from '@selfxyz/core'
import { ethers } from 'ethers'

// Init verifier once (matches contract config)
const configStore = new DefaultConfigStore({
  minimumAge: 18,
  excludedCountries: ['IRN', 'PRK', 'RUS'],  // ISO codes; CUBA not in OFAC but excluded in contract
  ofac: false,  // Disabled to match contract
})

const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || 'proof-of-human',  // Same scope as frontend/contract
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,  // Not used off-chain, but for consistency
  false,  // mockPassport: false for testnet/staging
  AllIds,  // Allow all document types (e.g., Aadhaar, Passport)
  configStore,
  'hex'  // User ID type: hex for EVM address
)

// Contract ABI snippet for verifyUser (add full if needed)
const contractAbi = [
  'function verifyUser(uint256 attestationId, bytes calldata proof, uint256[] calldata pubSignals, bytes32[] calldata validatorParams, bytes calldata userData) external',
]

export async function POST(req: NextRequest) {
  try {
    const { attestationId, proof, publicSignals, userContextData } = await req.json()

    if (!proof || !publicSignals || !attestationId || !userContextData) {
      return NextResponse.json(
        { status: 'error', result: false, reason: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Off-chain ZK proof verification
    const result = await selfBackendVerifier.verify(
      attestationId,  // e.g., AttestationId.Aadhaar or Passport
      proof,  // ZK proof object
      publicSignals,  // Public signals array
      userContextData  // User context (e.g., encoded data)
    )

    const { isValid, isMinimumAgeValid, isOfacValid } = result.isValidDetails

    if (!isValid || !isMinimumAgeValid || !isOfacValid) {
      let reason = 'Verification failed'
      if (!isMinimumAgeValid) reason = 'Minimum age (18+) not met'
      if (!isOfacValid) reason = 'OFAC/sanctions check failed'
      return NextResponse.json(
        { status: 'error', result: false, reason },
        { status: 200 }  // Self SDK expects 200 even on error
      )
    }

    // Step 2: Decode user address from userContextData or pubSignals (assuming it's the userId hex)
    // In Self flow, userContextData often includes the encoded userData; here we extract from request
    // For simplicity, assume userContextData includes { userAddress: '0x...' }; adjust based on Self payload
    let userAddress: string
    try {
      const context = JSON.parse(ethers.toUtf8String(userContextData))  // Adjust decoding if hex
      userAddress = context.userAddress || ethers.getAddress(publicSignals[0])  // Fallback to first signal if address
    } catch {
      return NextResponse.json(
        { status: 'error', result: false, reason: 'Invalid user context' },
        { status: 200 }
      )
    }

    // Step 3: On-chain verification call
    const rpcUrl = process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC!
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      contractAbi,
      wallet
    )

    // Prepare params for verifyUser (from Self protocol)
    // validatorParams: Derived from config (e.g., keccak of forbidden countries, etc.); use a util or hardcode
    // For demo, assume empty or fetch from hub; in prod, compute as per SelfUtils
    const validatorParams: string[] = []  // e.g., [ethers.keccak256(ethers.toUtf8Bytes('IRN'))] – implement properly

    const tx = await contract.verifyUser(
      BigInt(attestationId),
      proof as `0x${string}`,  // Cast proof to hex string
      publicSignals.map((s: any) => BigInt(s)),
      validatorParams.map((p: string) => BigInt(p) as any),
      userContextData  // Or the encoded userData (address)
    )

    const receipt = await tx.wait()
    if (receipt?.status !== 1) {
      throw new Error('On-chain verification failed')
    }

    return NextResponse.json(
      { status: 'success', result: true, txHash: tx.hash },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      {
        status: 'error',
        result: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    )
  }
}