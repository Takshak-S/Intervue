import React from "react";

/**
 * CircularProgress - A premium SVG-based circular progress indicator.
 * 
 * @param {number} score - The score to display (0-100).
 * @param {number} size - The overall size of the component in pixels.
 * @param {number} strokeWidth - The width of the progress path.
 * @param {string} color - The color of the progress path.
 * @param {boolean} showLabel - Whether to show the score/100 label in the center.
 */
function CircularProgress({ 
  score = 0, 
  size = 60, 
  strokeWidth = 5, 
  color = "#3b82f6", 
  showLabel = true 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center select-none" 
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 transition-transform duration-500"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        {/* Progress Path */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          strokeLinecap="round"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline gap-0.5">
            <span 
              className="font-serif font-black leading-none tracking-tight"
              style={{ 
                color,
                fontSize: size * 0.3, // Dynamic font size based on component size
              }}
            >
              {score}
            </span>
          </div>
          <span 
            className="font-sans font-bold text-slate-400 uppercase tracking-tighter"
            style={{ 
              fontSize: size * 0.1, // Dynamic small text size
              marginTop: size * 0.02
            }}
          >
            / 100
          </span>
        </div>
      )}
    </div>
  );
}

export default CircularProgress;
