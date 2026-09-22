import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const config = {
    High: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
      label: 'High Risk',
      icon: '🔴',
    },
    Medium: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Medium Risk',
      icon: '🟡',
    },
    Low: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Low Risk',
      icon: '🟢',
    },
  }[level];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} transition-colors`}
      aria-label={`Risk Level: ${config.label}`}
    >
      {showIcon && <span className="text-[10px] leading-none" aria-hidden="true">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};
