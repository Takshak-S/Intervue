import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { getHistory, deleteHistoryItem } from "../services/historyService.js";
import InterviewCard from "../components/InterviewCard.jsx";
import {
  BsChatSquareTextFill,
  BsCheckCircleFill,
  BsTrophyFill,
  BsPlayCircleFill,
  BsChatSquareText,
} from "react-icons/bs";
import toast from "react-hot-toast";

function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const allData = await getHistory(1, 100);
        setAllInterviews(allData.entries);
        setRecentInterviews(allData.entries.slice(0, 3));
      } catch (error) {
        console.error("Failed to load history:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setAllInterviews((prev) => {
        const updated = prev.filter((item) => item._id !== id);
        setRecentInterviews(updated.slice(0, 3));
        return updated;
      });
      toast.success("Interview deleted");
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  const handleCardClick = (interview) => {
    if (interview.status === "completed") {
      navigate(`/feedback/${interview._id}`);
    } else {
      navigate(`/interview/${interview._id}`);
    }
  };

  const completedCount = allInterviews.filter(
    (i) => i.status === "completed",
  ).length;

  const avgScore =
    allInterviews.length > 0
      ? Math.round(
          allInterviews
            .filter((i) => i.overallScore)
            .reduce((sum, i) => sum + i.overallScore, 0) /
            (allInterviews.filter((i) => i.overallScore).length || 1),
        )
      : 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 bg-slate-50 min-h-[calc(100vh-60px)]">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl md:text-4xl text-slate-900 m-0">
          Welcome back, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="font-sans text-base text-slate-500 m-0">
          Practice makes perfect. Start a mock interview and get AI-powered
          feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center gap-2 hover:shadow-md transition-shadow">
          <BsChatSquareTextFill className="text-3xl text-primary mb-1" />
          <span className="font-serif text-5xl text-primary leading-none">
            {allInterviews.length}
          </span>
          <span className="font-sans text-sm text-slate-500">Interviews</span>
        </div>
        <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center gap-2 hover:shadow-md transition-shadow">
          <BsCheckCircleFill className="text-3xl text-success mb-1" />
          <span className="font-serif text-5xl text-success leading-none">
            {completedCount}
          </span>
          <span className="font-sans text-sm text-slate-500">Completed</span>
        </div>
        <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center gap-2 hover:shadow-md transition-shadow">
          <BsTrophyFill className="text-3xl text-amber-500 mb-1" />
          <span className="font-serif text-5xl text-amber-500 leading-none">
            {avgScore}
          </span>
          <span className="font-sans text-sm text-slate-500">Avg Score</span>
        </div>
      </div>

      <div className="flex justify-center sm:justify-start">
        <button
          className="flex items-center gap-2 font-sans text-base font-bold px-8 py-4 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all"
          onClick={() => navigate("/setup")}
        >
          <BsPlayCircleFill className="text-xl" />
          Start New Interview
        </button>
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-slate-900 m-0">
            Recent Interviews
          </h2>
          {recentInterviews.length > 0 && (
            <button
              className="font-sans text-sm font-bold text-primary hover:text-primary-dark transition-colors"
              onClick={() => navigate("/history")}
            >
              View All History
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
              Loading interviews...
            </p>
          </div>
        ) : recentInterviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
              <BsChatSquareText className="text-3xl text-slate-300" />
            </div>
            <h3 className="font-serif text-xl text-slate-900 m-0">
              No interviews yet
            </h3>
            <p className="font-sans text-sm text-slate-500 max-w-xs m-0">
              Your mock interviews and AI feedback will appear here once you
              begin.
            </p>
            <button
              className="flex items-center gap-2 font-sans text-sm font-bold px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-all mt-2"
              onClick={() => navigate("/setup")}
            >
              <BsPlayCircleFill className="text-lg" />
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onClick={() => handleCardClick(interview)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
