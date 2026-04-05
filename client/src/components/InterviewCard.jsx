import { MdDelete } from "react-icons/md";
import getScoreColor from "../constants/scoreColors.js";

function InterviewCard({ interview, onClick, onDelete }) {
  const date = new Date(interview.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isCompleted = interview.status === "completed";
  const badgeClass = isCompleted
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700";
  const statusLabel = isCompleted ? "Completed" : "In Progress";

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-serif text-lg text-slate-900 m-0 group-hover:text-primary transition-colors">
          {interview.role}
        </h3>
        <span
          className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-[13px] text-slate-500">{date}</span>
        <span className="font-sans text-[13px] text-slate-500">
          {interview.totalQuestions} questions
        </span>
      </div>

      {interview.overallScore !== null &&
        interview.overallScore !== undefined && (
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className="font-sans text-3xl font-bold"
              style={{ color: getScoreColor(interview.overallScore) }}
            >
              {interview.overallScore}
            </span>
            <span className="font-sans text-sm text-slate-400">/100</span>
          </div>
        )}

      <div className="flex justify-end pt-3 border-t border-slate-50 mt-auto">
        <button
          className="flex items-center gap-1 font-sans text-[13px] font-semibold text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(interview._id);
          }}
        >
          <MdDelete className="text-base" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default InterviewCard;
