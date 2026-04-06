import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../services/interviewService.js";
import ScoreCard from "../components/Scorecard.jsx";
import getScoreColor from "../constants/scoreColors.js";
import CircularProgress from "../components/CircularProgress.jsx";
import {
  BsCheckCircleFill,
  BsArrowUpRight,
  BsJournalText,
  BsArrowRepeat,
} from "react-icons/bs";
import toast from "react-hot-toast";

function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await getInterview(id);

        if (!data.feedback) {
          toast.error("No feedback available for this interview.");
          navigate("/");
          return;
        }

        setInterview(data);
      } catch (error) {
        toast.error("Failed to load feedback");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 flex flex-col items-center justify-center p-6">
        <div
          className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"
          role="status"
        />
        <p className="font-sans text-base text-slate-500 m-0 mt-4">
          Loading feedback...
        </p>
      </div>
    );
  }

  if (!interview || !interview.feedback) return null;

  const { feedback, role, overallScore } = interview;
  const { categoryScores, strengths, areasOfImprovement, finalAssessment } =
    feedback;

  const scoreColor = getScoreColor(overallScore);

  return (
    <div className="min-h-full bg-slate-50 py-12 px-6">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 flex flex-col gap-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center border-b border-slate-100 pb-10">
          <h1 className="font-serif text-3xl md:text-5xl text-slate-900 m-0 mb-3 tracking-tight">
            Interview Feedback
          </h1>
          <p className="font-sans text-xl font-bold text-primary m-0">{role}</p>
          <p className="font-sans text-sm text-slate-400 m-0 mt-4 font-bold">
            {new Date(interview.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 py-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner group">
          <div className="relative p-6 bg-white rounded-full shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-primary/10">
            <CircularProgress 
              score={overallScore} 
              color={scoreColor} 
              size={160} 
              strokeWidth={12} 
            />
          </div>
          <h2 className="font-serif text-2xl text-slate-900 m-0 mt-4 tracking-tight">
            Overall Match Score
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          <h2 className="font-serif text-2xl text-slate-900 m-0 border-l-4 border-primary pl-4">
            Category breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryScores && (
              <>
                <ScoreCard
                  label="Communication Skills"
                  score={categoryScores.communicationSkills?.score || 0}
                  comment={categoryScores.communicationSkills?.comment}
                />
                <ScoreCard
                  label="Technical Knowledge"
                  score={categoryScores.technicalKnowledge?.score || 0}
                  comment={categoryScores.technicalKnowledge?.comment}
                />
                <ScoreCard
                  label="Problem Solving"
                  score={categoryScores.problemSolving?.score || 0}
                  comment={categoryScores.problemSolving?.comment}
                />
                <ScoreCard
                  label="Code Quality"
                  score={categoryScores.codeQuality?.score || 0}
                  comment={categoryScores.codeQuality?.comment}
                />
                <ScoreCard
                  label="Confidence"
                  score={categoryScores.confidence?.score || 0}
                  comment={categoryScores.confidence?.comment}
                />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {strengths && strengths.length > 0 && (
            <div className="p-8 rounded-2xl border border-green-100 bg-green-50/30 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BsCheckCircleFill className="text-[20px] text-green-600" />
                </div>
                <h2 className="font-serif text-xl text-slate-900 m-0">
                  Key strengths
                </h2>
              </div>
              <ul className="flex flex-col gap-3 m-0 pl-0 list-none font-sans text-sm text-slate-700">
                {strengths.map((item, index) => (
                  <li key={index} className="flex gap-3 leading-relaxed">
                    <span className="text-green-500 font-black">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {areasOfImprovement && areasOfImprovement.length > 0 && (
            <div className="p-8 rounded-2xl border border-amber-100 bg-amber-50/30 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <BsArrowUpRight className="text-[20px] text-amber-600" />
                </div>
                <h2 className="font-serif text-xl text-slate-900 m-0">
                  Growth opportunities
                </h2>
              </div>
              <ul className="flex flex-col gap-3 m-0 pl-0 list-none font-sans text-sm text-slate-700">
                {areasOfImprovement.map((item, index) => (
                  <li key={index} className="flex gap-3 leading-relaxed">
                    <span className="text-amber-500 font-black">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {finalAssessment && (
          <div className="p-8 rounded-2xl border border-blue-100 bg-blue-50/30 flex flex-col gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <BsJournalText className="text-8xl" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BsJournalText className="text-[20px] text-blue-600" />
              </div>
              <h2 className="font-serif text-xl text-slate-900 m-0">
                Final assessment
              </h2>
            </div>
            <p className="font-sans text-[15px] text-slate-700 leading-relaxed italic m-0 indent-4">
              {finalAssessment}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 border-t border-slate-100">
          <button
            className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-sans text-base font-bold rounded-xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:translate-y-[-2px] active:translate-y-[0] flex items-center justify-center gap-3"
            onClick={() => navigate("/setup")}
          >
            <BsArrowRepeat className="text-[20px]" />
            Retake interview
          </button>
          <button
            className="w-full sm:w-auto px-10 py-4 bg-white text-slate-600 font-sans text-base font-bold border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900 transition-all flex items-center justify-center"
            onClick={() => navigate("/")}
          >
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
