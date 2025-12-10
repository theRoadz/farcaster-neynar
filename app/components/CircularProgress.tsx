'use client';

interface CircularProgressProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  showPercentage?: boolean;
}

export default function CircularProgress({
  value,
  maxValue,
  size = 100,
  strokeWidth = 8,
  color = '#9b59b6',
  bgColor = 'rgba(255,255,255,0.2)',
  label,
  showPercentage = false,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {showPercentage ? `${Math.round(percentage)}%` : value}
          </span>
          {!showPercentage && (
            <span className="text-xs text-gray-300">/ {maxValue}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="mt-1 text-xs text-gray-300">{label}</span>
      )}
    </div>
  );
}
