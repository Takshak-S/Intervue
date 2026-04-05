import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadResume,
  getResume,
  startInterview,
} from "../services/interviewService.js";
import INTERVIEW_ROLES from "../constants/roles.js";
import DIFFICULTY_LEVELS from "../constants/difficulty.js";
import {
  BsDisplay,
  BsServer,
  BsLightningFill,
  BsGraphUp,
  BsCloudFill,
  BsStarFill,
  BsStar,
  BsFileEarmarkArrowUp,
  BsCheckCircleFill,
} from "react-icons/bs";
import { FaPython, FaReact, FaJava } from "react-icons/fa";
import toast from "react-hot-toast";

const ROLE_ICONS = {
  "frontend-developer": BsDisplay,
  "backend-developer": BsServer,
  "full-stack-developer": BsLightningFill,
  "data-analyst": BsGraphUp,
  "devops-engineer": BsCloudFill,
  "python-developer": FaPython,
  "react-developer": FaReact,
  "java-developer": FaJava,
};

const DIFFICULTY_ICONS = {
  easy: (
    <span className="flex gap-1 text-amber-400 text-sm">
      <BsStarFill />
      <BsStar />
      <BsStar />
    </span>
  ),
  medium: (
    <span className="flex gap-1 text-amber-400 text-sm">
      <BsStarFill />
      <BsStarFill />
      <BsStar />
    </span>
  ),
  hard: (
    <span className="flex gap-1 text-amber-400 text-sm">
      <BsStarFill />
      <BsStarFill />
      <BsStarFill />
    </span>
  ),
};

function InterviewSetupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await getResume();
        if (data) {
          setResumeText(data.text);
          setResumeFileName(data.fileName);
        }
      } catch (error) {
        // No resume found - that's okay
      }
    };

    loadResume();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    setUploadingResume(true);

    try {
      const data = await uploadResume(file);
      setResumeText(data.text);
      setResumeFileName(data.fileName);
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to upload resume";
      toast.error(message);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error("Please select a role.");
      return;
    }
    if (!resumeText) {
      toast.error("Please upload your resume.");
      return;
    }

    setLoading(true);

    try {
      const difficultyConfig = DIFFICULTY_LEVELS.find(
        (d) => d.id === selectedDifficulty,
      );
      const totalQuestions = difficultyConfig ? difficultyConfig.questions : 5;
      const data = await startInterview(
        selectedRole,
        resumeText,
        totalQuestions,
      );
      toast.success("Interview started!");
      navigate(`/interview/${data.interviewId}`, {
        state: { audio: data.audio },
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to start interview";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast.error("Please select a role.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center flex flex-col items-center gap-8 p-12 bg-white rounded-2xl shadow-xl border border-slate-200 animate-in zoom-in-95 duration-500">
          <div
            className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"
            role="status"
          />
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl text-slate-900 m-0">
              Preparing Your Interview...
            </h2>
            <p className="font-sans text-base text-slate-500 m-0">
              AI is analyzing your resume and generating personalized questions
              for the <strong className="text-primary">{selectedRole}</strong>{" "}
              role.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <div className="flex items-center gap-3">
              <BsCheckCircleFill className="text-xl text-success" />
              <span className="font-sans text-sm text-slate-900 font-medium">
                Analyzing resume
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BsCheckCircleFill className="text-xl text-success" />
              <span className="font-sans text-sm text-slate-900 font-medium">
                Generating questions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BsCheckCircleFill className="text-xl text-slate-200" />
              <span className="font-sans text-sm text-slate-400">
                Setting up voice interviewer
              </span>
            </div>
          </div>

          <p className="font-sans text-sm text-slate-400 italic">
            This may take 10-15 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8 gap-4">
          <span
            className={`flex-1 text-center font-sans text-xs font-bold py-2.5 rounded-full border transition-all ${step >= 1 ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105" : "border-slate-200 text-slate-400"}`}
          >
            1. Role
          </span>
          <div className="w-8 h-px bg-slate-200" />
          <span
            className={`flex-1 text-center font-sans text-xs font-bold py-2.5 rounded-full border transition-all ${step >= 2 ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105" : "border-slate-200 text-slate-400"}`}
          >
            2. Difficulty
          </span>
          <div className="w-8 h-px bg-slate-200" />
          <span
            className={`flex-1 text-center font-sans text-xs font-bold py-2.5 rounded-full border transition-all ${step >= 3 ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105" : "border-slate-200 text-slate-400"}`}
          >
            3. Resume
          </span>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="font-serif text-2xl text-slate-900 m-0 text-center">
              Select Interview Role
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTERVIEW_ROLES.map((role) => {
                const RoleIcon = ROLE_ICONS[role.id];
                const isSelected = selectedRole === role.title;
                return (
                  <button
                    key={role.id}
                    className={`flex flex-col items-center gap-3 p-6 bg-white border-2 rounded-xl text-center cursor-pointer transition-all group ${isSelected ? "border-primary bg-blue-50 shadow-md ring-2 ring-primary/20" : "border-slate-100 hover:border-primary/40 hover:bg-slate-50"}`}
                    onClick={() => setSelectedRole(role.title)}
                  >
                    {RoleIcon && (
                      <RoleIcon
                        className={`text-3xl transition-colors ${isSelected ? "text-primary" : "text-slate-400 group-hover:text-primary/60"}`}
                      />
                    )}
                    <h3 className="font-sans text-base font-bold text-slate-900 m-0">
                      {role.title}
                    </h3>
                    <p className="font-sans text-[13px] text-slate-500 m-0 leading-relaxed">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="font-serif text-2xl text-slate-900 m-0 text-center">
              Choose Difficulty
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4">
              {DIFFICULTY_LEVELS.map((level) => {
                const isSelected = selectedDifficulty === level.id;
                return (
                  <button
                    key={level.id}
                    className={`flex-1 flex flex-col items-center gap-3 p-8 bg-white border-2 rounded-xl text-center cursor-pointer transition-all group ${isSelected ? "border-primary bg-blue-50 shadow-md ring-2 ring-primary/20" : "border-slate-100 hover:border-primary/40 hover:bg-slate-50"}`}
                    onClick={() => setSelectedDifficulty(level.id)}
                  >
                    {DIFFICULTY_ICONS[level.id]}
                    <h3 className="font-sans text-base font-bold text-slate-900 m-0">
                      {level.label}
                    </h3>
                    <p className="font-sans text-[13px] text-slate-500 m-0 leading-relaxed">
                      {level.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="font-serif text-2xl text-slate-900 m-0 text-center">
              Upload Your Resume
            </h2>
            <div className="flex flex-col items-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors">
              {resumeText ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm border border-slate-200">
                    <BsFileEarmarkArrowUp className="text-2xl text-primary" />
                    <p className="font-sans text-sm font-medium text-slate-700 m-0">
                      {resumeFileName}
                    </p>
                  </div>
                  <label className="font-sans text-xs font-bold text-primary cursor-pointer hover:underline uppercase tracking-wider">
                    Change Resume
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      hidden
                    />
                  </label>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-3 p-10">
                  <BsFileEarmarkArrowUp className="text-5xl text-slate-300 group-hover:text-primary transition-colors" />
                  <p className="font-sans text-sm font-semibold text-slate-500 m-0">
                    {uploadingResume
                      ? "Uploading..."
                      : "Click to upload PDF resume"}
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
          {step > 1 && (
            <button
              className="px-8 py-3 font-sans text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              className="px-10 py-3 font-sans text-sm font-bold bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark transition-all transform hover:translate-y-[-1px] active:translate-y-[0]"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              className={`px-10 py-3 font-sans text-sm font-bold bg-primary text-white rounded-lg shadow-lg transition-all transform ${loading || !selectedRole || !resumeText ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark hover:translate-y-[-1px] active:translate-y-[0]"}`}
              onClick={handleStartInterview}
              disabled={loading || !selectedRole || !resumeText}
            >
              Start Interview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewSetupPage;
