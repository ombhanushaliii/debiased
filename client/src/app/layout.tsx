import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';
import './globals.css';
import { WalletProvider } from '../components/WalletContext';

export const metadata: Metadata = {
  title: 'DeBiased',
  description: 'Create and participate in unbiased surveys with ZKP technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <WalletProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}