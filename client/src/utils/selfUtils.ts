import { ethers } from 'ethers'

export const CountryCodes = {
  IRAN: 'IRN',
  NORTH_KOREA: 'PRK',
  RUSSIA: 'RUS',
} as const

export function computeValidatorParams(forbiddenCountries: string[]): string[] {
  return forbiddenCountries.map((country) =>
    ethers.keccak256(ethers.toUtf8Bytes(country))
  )
}


export function encodeUserData(userAddress: string): string {
  return ethers.hexlify(ethers.zeroPadBytes(ethers.getAddress(userAddress), 32))
}

export function decodeUserData(userData: string): string {
  try {
    return ethers.getAddress(ethers.dataSlice(userData, 12, 32))
  } catch {
    throw new Error('Invalid userData format')
  }
}