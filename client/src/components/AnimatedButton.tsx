"use client";
import React from "react";
import Link from "next/link";

interface AnimatedButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function AnimatedButton({ 
  children, 
  href, 
  onClick, 
  className = "", 
  disabled = false 
}: AnimatedButtonProps) {
  const buttonContent = (
    <button
      className={`animated-button ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="animated-button-bg" />
      <span className="animated-button-content">
        {children}
      </span>
    </button>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
