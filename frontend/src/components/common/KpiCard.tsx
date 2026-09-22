import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  numericTarget?: number;
  prefix?: string;
  suffix?: string;
  changeText?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  numericTarget,
  prefix = '',
  suffix = '',
  changeText,
  changeType = 'neutral',
  icon: Icon,
  iconBgColor = 'bg-coral-100',
  iconColor = 'text-coral-600',
  tooltip,
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof numericTarget === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof numericTarget === 'number') {
      let start = 0;
      const end = numericTarget;
      const duration = 900;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = end / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [numericTarget, value]);

  const changeClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    negative: 'bg-coral-50 text-coral-700 border-coral-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  }[changeType];

  const formattedDisplay =
    typeof displayValue === 'number'
      ? displayValue.toLocaleString('en-IN')
      : displayValue;

  return (
    <div
      className="card-coral p-4 sm:p-5 relative overflow-hidden group"
      title={tooltip}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-0.5 mt-1 min-w-0">
            <span className="text-xl sm:text-2xl font-extrabold text-[#252525] tracking-tight truncate leading-tight">
              {prefix}{formattedDisplay}{suffix}
            </span>
          </div>
        </div>
        <div
          className={`p-2 sm:p-2.5 rounded-xl ${iconBgColor} ${iconColor} transition-transform duration-300 group-hover:scale-110 shadow-sm shrink-0`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {changeText && (
        <div className="mt-2.5 sm:mt-3">
          <span
            className={`inline-flex items-center text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-semibold border ${changeClasses} truncate max-w-full`}
          >
            {changeText}
          </span>
        </div>
      )}

      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-coral-400 via-coral-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
