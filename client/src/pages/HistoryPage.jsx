import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/historyService.js";
import InterviewCard from "../components/InterviewCard.jsx";
import Modal from "../components/Modal.jsx";
import { MdDeleteSweep, MdHistory } from "react-icons/md";
import { BsClipboardData, BsFilter } from "react-icons/bs";
import toast from "react-hot-toast";

function HistoryPage() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getHistory(page, ITEMS_PER_PAGE, status);
        setInterviews(data.entries);
        setTotalPages(data.totalPages);
        setTotalEntries(data.totalEntries);
      } catch (error) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [page, status]);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setInterviews((prev) => prev.filter((item) => item._id !== id));
      setTotalEntries((prev) => prev - 1);
      toast.success("Interview deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory();
      setInterviews([]);
      setTotalEntries(0);
      setIsModalOpen(false);
      toast.success("All history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const handleCardClick = (interview) => {
    if (interview.status === "completed") {
      navigate(`/feedback/${interview._id}`);
    } else {
      navigate(`/interview/${interview._id}`);
    }
  };

  const tabs = [
    { id: "all", label: "All Interviews" },
    { id: "completed", label: "Completed" },
    { id: "in-progress", label: "In Progress" },
  ];

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MdHistory className="text-2xl text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-slate-900 m-0">
                Interview History
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-0.5">
                Review and manage your past mock interview sessions
              </p>
            </div>
          </div>
          {interviews.length > 0 && (
            <button
              className="flex items-center gap-2 font-sans text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-5 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm bg-white"
              onClick={() => setIsModalOpen(true)}
            >
              <MdDeleteSweep className="text-[20px]" />
              Clear all history
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatus(tab.id);
                  setPage(1);
                }}
                className={`flex-1 sm:flex-none px-6 py-2.5 font-sans text-sm font-bold rounded-xl transition-all ${
                  status === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
            <span className="font-sans text-xs font-bold text-slate-400">
              {totalEntries} total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"
              role="status"
            />
            <p className="font-sans text-base text-slate-500 m-0 animate-pulse">
              Syncing your history...
            </p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-8 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center rotate-3 border border-slate-100 shadow-sm">
                <BsClipboardData className="text-5xl text-slate-200" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white">
                <BsFilter className="text-primary" />
              </div>
            </div>
            <div className="flex flex-col gap-2 max-w-sm">
              <h3 className="font-serif text-2xl text-slate-900 m-0">
                {status === "all" ? "No interviews yet" : `No ${status} interviews`}
              </h3>
              <p className="font-sans text-[15px] text-slate-500 leading-relaxed m-0">
                {status === "all" 
                  ? "Start your first mock interview to get detailed feedback and track your progress over time."
                  : `You don't have any interviews with status "${status}" at the moment.`}
              </p>
            </div>
            <button
              className="flex items-center gap-3 font-sans text-base font-bold px-10 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:scale-[1.03] active:scale-[0.98] mt-2"
              onClick={() => navigate("/setup")}
            >
              Start New Interview
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  onClick={() => handleCardClick(interview)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-8 mt-10 pt-10 border-t border-slate-200">
                <button
                  className={`px-8 py-3 bg-white border-2 rounded-2xl font-sans text-sm font-bold transition-all shadow-sm ${
                    page === 1
                      ? "text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                      : "text-slate-700 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95"
                  }`}
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm text-slate-400">Page</span>
                  <span className="font-mono text-base font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-inner">
                    {page}
                  </span>
                  <span className="font-sans text-sm text-slate-400">of {totalPages}</span>
                </div>
                <button
                  className={`px-8 py-3 bg-white border-2 rounded-2xl font-sans text-sm font-bold transition-all shadow-sm ${
                    page === totalPages
                      ? "text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                      : "text-slate-700 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95"
                  }`}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All History"
        message="Are you sure you want to delete all interview history? This action is permanent and cannot be undone."
        confirmText="Yes, delete everything"
        type="danger"
      />
    </div>
  );
}

export default HistoryPage;
