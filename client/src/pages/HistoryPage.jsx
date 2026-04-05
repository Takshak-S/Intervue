import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/historyService.js";
import InterviewCard from "../components/InterviewCard.jsx";
import { MdDeleteSweep } from "react-icons/md";
import { BsClipboardData } from "react-icons/bs";
import toast from "react-hot-toast";

function HistoryPage() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getHistory(page, ITEMS_PER_PAGE);
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
  }, [page]);

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
    if (!window.confirm("Are you sure you want to delete all interviews?"))
      return;

    try {
      await clearHistory();
      setInterviews([]);
      setTotalEntries(0);
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-3xl text-slate-900 m-0">
              Interview History
            </h1>
            <span className="px-3 py-1 bg-slate-200 text-slate-700 font-sans text-xs font-bold rounded-full">
              {totalEntries} interview{totalEntries !== 1 ? "s" : ""}
            </span>
          </div>
          {interviews.length > 0 && (
            <button
              className="flex items-center gap-2 font-sans text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
              onClick={handleClearAll}
            >
              <MdDeleteSweep className="text-xl" />
              Clear All History
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"
              role="status"
            />
            <p className="font-sans text-base text-slate-500 m-0">
              Loading history...
            </p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
              <BsClipboardData className="text-4xl text-slate-300" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-serif text-xl text-slate-900 m-0">
                No interviews yet
              </h3>
              <p className="font-sans text-sm text-slate-500 max-w-xs m-0">
                Complete your first mock interview to see your detailed history
                and feedback here.
              </p>
            </div>
            <button
              className="flex items-center gap-2 font-sans text-sm font-bold px-8 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark transition-all mt-2"
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
              <div className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-slate-200">
                <button
                  className={`px-6 py-2 bg-white border rounded-lg font-sans text-sm font-bold transition-all shadow-sm ${page === 1 ? "text-slate-300 border-slate-100 cursor-not-allowed" : "text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-primary/50"}`}
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="font-sans text-sm font-semibold text-slate-500">
                  Page <span className="text-slate-900">{page}</span> of{" "}
                  {totalPages}
                </span>
                <button
                  className={`px-6 py-2 bg-white border rounded-lg font-sans text-sm font-bold transition-all shadow-sm ${page === totalPages ? "text-slate-300 border-slate-100 cursor-not-allowed" : "text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-primary/50"}`}
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
    </div>
  );
}

export default HistoryPage;
