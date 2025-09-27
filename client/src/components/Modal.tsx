'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="paper-modal" onClick={onClose}>
      <div
        className={`paper-modal-content ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-ink-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-paper-200 rounded-lg transition-colors"
            >
              <X size={20} className="text-ink-600" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}