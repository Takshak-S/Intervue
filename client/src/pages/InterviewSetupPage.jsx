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
  const [previousResume, setPreviousResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const checkPreviousResume = async () => {
      try {
        const data = await getResume();
        if (data) {
          setPreviousResume(data);
        }
      } catch (error) {
        // No resume found - that's okay
      }
    };

    checkPreviousResume();
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

  const handleUsePrevious = () => {
    if (previousResume) {
      setResumeText(previousResume.text);
      setResumeFileName(previousResume.fileName);
      toast.success("Previous resume loaded!");
    }
  };

  const handleClearResume = () => {
    setResumeText("");
    setResumeFileName("");
    toast.success("Resume cleared!");
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
              Preparing your interview...
            </h2>
            <p className="font-sans text-base text-slate-500 m-0">
              AI is analyzing your resume and generating personalized questions
              for the <strong className="text-primary">{selectedRole}</strong>{" "}
              role.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <div className="flex items-center gap-3">
              <BsCheckCircleFill className="text-[20px] text-success" />
              <span className="font-sans text-sm text-slate-900 font-medium">
                Analyzing resume
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BsCheckCircleFill className="text-[20px] text-success" />
              <span className="font-sans text-sm text-slate-900 font-medium">
                Generating questions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BsCheckCircleFill className="text-[20px] text-slate-200" />
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
    <div className="min-h-full bg-slate-50 flex flex-col items-center py-12 px-6">
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
              Select interview role
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
              Choose difficulty
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
              Upload your resume
            </h2>
            <div className="flex flex-col items-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors w-full">
              {resumeText ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                    <BsFileEarmarkArrowUp className="text-2xl text-primary" />
                    <p className="font-sans text-sm font-bold text-slate-700 m-0">
                      {resumeFileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="font-sans text-xs font-bold text-primary cursor-pointer hover:underline">
                      Change resume
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                        hidden
                      />
                    </label>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <button 
                      className="font-sans text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      onClick={handleClearResume}
                    >
                      Clear selection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 p-10 w-full animate-in fade-in duration-500">
                  <label className="w-full flex flex-col items-center justify-center cursor-pointer gap-4 group">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300">
                      <BsFileEarmarkArrowUp className="text-3xl text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="font-sans text-sm font-bold text-slate-500 m-0 group-hover:text-slate-700 transition-colors">
                      {uploadingResume
                        ? "Uploading resume..."
                        : "Click to upload your resume (PDF)"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      hidden
                    />
                  </label>

                  {previousResume && !uploadingResume && (
                    <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-200/50 w-full max-w-sm">
                      <span className="font-sans text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Or use your last one
                      </span>
                      <button
                        onClick={handleUsePrevious}
                        className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group w-full"
                      >
                        <BsFileEarmarkArrowUp className="text-lg text-slate-400 group-hover:text-primary" />
                        <span className="font-sans text-sm font-bold text-slate-600 group-hover:text-slate-900 truncate flex-1 text-left">
                          {previousResume.fileName}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
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
