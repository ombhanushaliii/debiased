'use client';

import React, { useEffect, useRef } from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-ink-800 text-paper-50 px-4 py-2 rounded-paper z-50"
    >
      {children}
    </a>
  );
}

interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
}

export function FocusTrap({ children, active }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Let parent handle escape
        e.preventDefault();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function LiveAnnouncement({ message, priority = 'polite' }: AnnouncementProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

interface ProgressAnnouncementProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressAnnouncement({ current, total, label = 'Progress' }: ProgressAnnouncementProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <LiveAnnouncement
      message={`${label}: ${current} of ${total}, ${percentage} percent complete`}
      priority="polite"
    />
  );
}

interface KeyboardHelpProps {
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

export function KeyboardHelp({ shortcuts }: KeyboardHelpProps) {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-paper-50 border border-paper-300 rounded-paper p-4 shadow-paper-lg z-50 max-w-sm">
      <h3 className="font-semibold text-ink-800 mb-3">Keyboard Shortcuts</h3>
      <dl className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between text-sm">
            <dt className="font-mono bg-paper-200 px-2 py-1 rounded text-ink-700">
              {shortcut.keys}
            </dt>
            <dd className="text-ink-600 ml-3">{shortcut.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;

      // Create key combination string
      let combination = '';
      if (event.ctrlKey) combination += 'ctrl+';
      if (event.metaKey) combination += 'cmd+';
      if (event.altKey) combination += 'alt+';
      if (event.shiftKey) combination += 'shift+';
      combination += key;

      if (shortcuts[combination]) {
        event.preventDefault();
        shortcuts[combination]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Enhanced button with better accessibility
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary';
}

export function AccessibleButton({
  children,
  loading = false,
  loadingText = 'Loading...',
  variant = 'secondary',
  disabled,
  className = '',
  ...props
}: AccessibleButtonProps) {
  const baseClasses = variant === 'primary' ? 'paper-button-primary' : 'paper-button';
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-describedby={loading ? 'loading-status' : undefined}
      className={`${baseClasses} ${disabledClasses} ${className} focus:ring-2 focus:ring-ink-400 focus:ring-offset-2`}
    >
      {loading ? (
        <>
          <span aria-hidden="true" className="animate-spin">⟳</span>
          <span className="sr-only">{loadingText}</span>
          <span aria-hidden="true">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Enhanced modal with accessibility
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      const previouslyFocused = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Return focus when modal closes
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="paper-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className="paper-modal-content"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="modal-title" className="text-xl font-semibold text-ink-800 mb-4">
            {title}
          </h2>
          {children}
        </div>
      </FocusTrap>
    </div>
  );
}