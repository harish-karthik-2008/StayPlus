import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-white border border-coral-200 shadow-sm p-1 ${sizeClasses} ${className}`}
    >
      <img
        src="/stayplus-logo.png"
        alt="StayPlus Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};
