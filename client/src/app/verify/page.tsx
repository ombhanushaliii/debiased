import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Verification Successful!</h1>
      <p>You are now verified on-chain.</p>
      <Link href="/" className="mt-4 text-blue-500">Back to Home</Link>
    </div>
  )
}