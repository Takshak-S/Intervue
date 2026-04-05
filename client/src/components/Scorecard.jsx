import getScoreColor from "../constants/scoreColors.js";

function ScoreCard({ label, score, comment }) {
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col gap-3 p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        <span
          className="font-sans text-sm font-bold whitespace-nowrap"
          style={{ color }}
        >
          {score}/100
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      {comment && (
        <p className="font-sans text-[13px] text-slate-600 leading-relaxed m-0 italic">
          {comment}
        </p>
      )}
    </div>
  );
}

export default ScoreCard;
