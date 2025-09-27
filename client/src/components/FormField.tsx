'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, children, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`paper-input ${error ? 'border-red-300 focus:border-red-400' : ''} ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`paper-input resize-none ${error ? 'border-red-300 focus:border-red-400' : ''} ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function Select({ error, options, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`paper-input ${error ? 'border-red-300 focus:border-red-400' : ''} ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export function Checkbox({ label, error, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className={`w-4 h-4 text-ink-600 rounded focus:ring-ink-500 ${error ? 'border-red-300' : 'border-paper-300'}`}
        {...props}
      />
      <span className="text-ink-700">{label}</span>
    </label>
  );
}

interface RadioGroupProps {
  name: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

export function RadioGroup({ name, options, value, onChange, error, className = '' }: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-4 h-4 text-ink-600 focus:ring-ink-500 ${error ? 'border-red-300' : 'border-paper-300'}`}
          />
          <span className="text-ink-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface ValidationSummaryProps {
  errors: Array<{ field: string; message: string }>;
  className?: string;
}

export function ValidationSummary({ errors, className = '' }: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-paper p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface FieldGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({ title, description, children, className = '' }: FieldGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-ink-800">{title}</h3>
        {description && (
          <p className="text-sm text-ink-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}