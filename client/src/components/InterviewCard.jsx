import { MdDelete, MdPlayArrow, MdVisibility } from "react-icons/md";
import getScoreColor from "../constants/scoreColors.js";
import CircularProgress from "./CircularProgress.jsx";

function InterviewCard({ interview, onClick, onDelete }) {
  const date = new Date(interview.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isCompleted = interview.status === "completed";
  const badgeClass = isCompleted
    ? "bg-emerald-100/50 text-emerald-700 border-emerald-200/50"
    : "bg-amber-100/50 text-amber-700 border-amber-200/50";
  const statusLabel = isCompleted ? "Completed" : "In progress";
  
  const score = interview.overallScore;
  const scoreColor = getScoreColor(score);

  return (
    <div
      className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98]"
      onClick={onClick}
    >
      {/* Selection Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      
      {/* Hover Delete Action */}
      <button
        className="absolute top-4 right-4 p-2.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white z-10 shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(interview._id);
        }}
        title="Delete interview"
      >
        <MdDelete className="text-[20px]" />
      </button>

      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-sans text-[11px] font-bold px-2.5 py-1 rounded-md border ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
          <h3 className="font-serif text-xl text-slate-900 m-0 leading-tight group-hover:text-primary transition-colors truncate">
            {interview.role}
          </h3>
          <span className="font-sans text-sm text-slate-400 font-medium">{date}</span>
        </div>
        {isCompleted && (
          <div className="shrink-0 scale-90 sm:scale-100 mt-10">
            <CircularProgress 
              score={score || 0} 
              color={scoreColor} 
              size={55} 
              strokeWidth={5}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-slate-400 font-bold">
              {interview.totalQuestions} Questions
            </span>
          </div>
          {!isCompleted && (
            <div className="flex items-center gap-2 text-primary font-sans text-sm font-bold">
              <MdPlayArrow className="text-[18px]" />
              <span>Ready to continue</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        {isCompleted ? (
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-sans text-sm font-bold rounded-2xl group-hover:bg-primary transition-all shadow-lg shadow-slate-200">
            <MdVisibility className="text-[18px]" />
            View feedback
          </button>
        ) : (
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-sans text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95">
            <MdPlayArrow className="text-[20px]" />
            Resume interview
          </button>
        )}
      </div>
    </div>
  );
}

export default InterviewCard;
