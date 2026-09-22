import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  previousScore?: number;
  showDelta?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 180,
  label = 'Churn Risk Probability',
  previousScore,
  showDelta = false,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 68;
  const circumference = Math.PI * radius; // Half circle circumference
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#10B981'; // Green
  let riskStatus = 'Low Risk';

  if (clampedScore >= 65) {
    strokeColor = '#E96B6B'; // Dark Coral / Red
    riskStatus = 'High Risk';
  } else if (clampedScore >= 35) {
    strokeColor = '#F59E0B'; // Amber
    riskStatus = 'Medium Risk';
  }

  const delta = previousScore !== undefined ? clampedScore - previousScore : 0;

  // Proportional SVG height
  const svgHeight = size * 0.64;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center select-none"
        style={{ width: size, height: svgHeight }}
      >
        <svg
          width={size}
          height={svgHeight}
          viewBox="0 0 180 115"
          className="overflow-visible"
        >
          {/* Background track */}
          <path
            d="M 22 100 A 68 68 0 0 1 158 100"
            fill="none"
            stroke="#F0DADA"
            strokeWidth="13"
            strokeLinecap="round"
          />
          {/* Animated Value Arc */}
          <path
            d="M 22 100 A 68 68 0 0 1 158 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="13"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Number Value rendered in SVG vector coordinates to ensure it NEVER overlaps */}
          <text
            x="90"
            y="76"
            textAnchor="middle"
            fill="#252525"
            fontSize="32"
            fontWeight="900"
            letterSpacing="-0.5px"
          >
            {clampedScore}%
          </text>

          {/* Status Label in SVG vector coordinates */}
          <text
            x="90"
            y="96"
            textAnchor="middle"
            fill={strokeColor}
            fontSize="12"
            fontWeight="700"
            letterSpacing="0.4px"
            className="uppercase"
          >
            {riskStatus}
          </text>
        </svg>
      </div>

      {label && (
        <p className="text-xs text-gray-500 font-medium mt-1 text-center">{label}</p>
      )}

      {showDelta && previousScore !== undefined && delta !== 0 && (
        <div className="mt-2 text-xs font-medium flex items-center gap-1.5">
          <span className="text-gray-400">Baseline: {previousScore}%</span>
          <span>→</span>
          <span className={delta < 0 ? 'text-emerald-600 font-bold' : 'text-coral-600 font-bold'}>
            {delta < 0 ? `${Math.abs(delta)}% reduction` : `+${delta}% increase`}
          </span>
        </div>
      )}
    </div>
  );
};
