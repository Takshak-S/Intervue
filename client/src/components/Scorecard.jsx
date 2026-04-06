import getScoreColor from "../constants/scoreColors.js";
import CircularProgress from "./CircularProgress.jsx";

function ScoreCard({ label, score, comment }) {
  const color = getScoreColor(score);

  return (
    <div className="flex items-start gap-5 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300">
      <div className="shrink-0 transition-transform duration-500">
        <CircularProgress 
          score={score} 
          color={color} 
          size={52} 
          strokeWidth={4} 
        />
      </div>
      
      <div className="flex flex-col gap-1.5 min-w-0 pt-0.5">
        <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        {comment && (
          <p className="font-sans text-[13px] text-slate-600 leading-relaxed m-0 italic">
            {comment}
          </p>
        )}
      </div>
    </div>
  );
}

export default ScoreCard;
