import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getInterview,
  submitTextAnswer,
  transcribeAudio,
  submitCode,
  endInterview,
} from "../services/interviewService.js";
import VoiceRecorder from "../components/VoiceRecorder.jsx";
import AudioPlayer from "../components/AudioPlayer.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import { FaUserTie } from "react-icons/fa";
import {
  BsRecordCircleFill,
  BsKeyboardFill,
  BsCodeSlash,
  BsCheck,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import toast from "react-hot-toast";

const STATE_SPEAKING = "speaking";
const STATE_THINKING = "thinking";
const STATE_LISTENING = "listening";
const STATE_FAREWELL = "farewell";

function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [interviewerState, setInterviewerState] = useState(STATE_SPEAKING);

  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeEvaluation, setCodeEvaluation] = useState(null);

  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioKey, setAudioKey] = useState(0);

  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewerText, setInterviewerText] = useState("");
  const [farewellMessage, setFarewellMessage] = useState("");

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const data = await getInterview(id);
        setCurrentQuestionNum(data.currentQuestion);
        setTotalQuestions(data.totalQuestions);

        if (data.questions && data.questions.length > 0) {
          const qIndex = data.currentQuestion - 1;
          setCurrentQuestion(data.questions[qIndex] || data.questions[0]);
        }

        const interviewerMsgs = data.messages.filter(
          (m) => m.role === "interviewer",
        );
        if (data.currentQuestion === 1 && interviewerMsgs.length >= 1) {
          setInterviewerText(interviewerMsgs[0].content);
        } else if (interviewerMsgs.length > 0) {
          setInterviewerText(
            interviewerMsgs[interviewerMsgs.length - 1].content,
          );
        }

        if (data.currentQuestion === 1) {
          const audio = location.state?.audio || data.lastAudio;
          if (audio) {
            setCurrentAudio(audio);
            setInterviewerState(STATE_SPEAKING);
          } else {
            setInterviewerState(STATE_SPEAKING);
            setTimeout(() => setInterviewerState(STATE_LISTENING), 3000);
          }
        } else {
          setInterviewerState(STATE_LISTENING);
        }
      } catch (error) {
        toast.error("Failed to load interview");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    loadInterview();
  }, [id, navigate, location.state]);

  const handleAudioEnded = () => {
    if (interviewerState === STATE_FAREWELL) return;
    setTimeout(() => setInterviewerState(STATE_LISTENING), 3000);
  };

  const resetAnswerFields = () => {
    setTextAnswer("");
    setCode("");
    setCodeEvaluation(null);
    setShowTextFallback(false);
  };

  const processAnswerResult = (result) => {
    if (result.isComplete) {
      const farewellText =
        "Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report...";
      setFarewellMessage(farewellText);
      setInterviewerState(STATE_FAREWELL);

      if (result.audio) {
        setTimeout(() => {
          setCurrentAudio(result.audio);
          setAudioKey((prev) => prev + 1);
        }, 100);
        setTimeout(() => handleEndInterview(), 10000);
      } else {
        setTimeout(() => handleEndInterview(), 4000);
      }
      return;
    }

    setInterviewerText(result.response);
    setCurrentQuestionNum(result.currentQuestion);
    setCurrentQuestion(result.question);
    setCurrentAudio(result.audio);
    setAudioKey((prev) => prev + 1);
    resetAnswerFields();

    setInterviewerState(STATE_SPEAKING);
    if (!result.audio) {
      setTimeout(() => setInterviewerState(STATE_LISTENING), 3000);
    }
  };

  const submitAndProcess = async (answerText) => {
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const result = await submitTextAnswer(id, answerText);
      processAnswerResult(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit answer");
      setInterviewerState(STATE_LISTENING);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordingComplete = async (audioBlob) => {
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const data = await transcribeAudio(audioBlob);
      const answerText =
        data.text && !data.text.startsWith("[")
          ? data.text
          : "The candidate provided a verbal response.";

      const result = await submitTextAnswer(id, answerText);
      processAnswerResult(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit answer");
      setInterviewerState(STATE_LISTENING);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    setEnding(true);
    try {
      await endInterview(id);
      navigate(`/feedback/${id}`);
    } catch (error) {
      toast.error("Failed to generate feedback");
    } finally {
      setEnding(false);
    }
  };

  const handleSubmitText = () => {
    if (!textAnswer.trim()) return toast.error("Please type your answer.");
    submitAndProcess(textAnswer);
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) return toast.error("Please write some code.");
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const result = await submitCode(id, code, codeLanguage);
      setCodeEvaluation(result.evaluation);
      toast.success(`Code evaluated: ${result.evaluation.score}/100`);

      if (result.isComplete) {
        setFarewellMessage(
          "Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report...",
        );
        setInterviewerState(STATE_FAREWELL);
        if (result.audio) {
          setTimeout(() => {
            setCurrentAudio(result.audio);
            setAudioKey((prev) => prev + 1);
          }, 100);
          setTimeout(() => handleEndInterview(), 10000);
        } else {
          setTimeout(() => handleEndInterview(), 4000);
        }
        return;
      }

      setTimeout(() => processAnswerResult(result), 2500);
    } catch (error) {
      toast.error("Failed to evaluate code");
      setInterviewerState(STATE_LISTENING);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
        <div
          className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"
          role="status"
        />
        <p className="font-sans text-base text-slate-500 m-0">
          Loading interview...
        </p>
      </div>
    );
  }

  const isCodeQuestion = currentQuestion?.isCodeQuestion;
  const progressPercent = (currentQuestionNum / totalQuestions) * 100;
  const isSpeaking = interviewerState === STATE_SPEAKING;
  const isThinking = interviewerState === STATE_THINKING;
  const isListening = interviewerState === STATE_LISTENING;
  const isFarewell = interviewerState === STATE_FAREWELL;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] grid-rows-[60px_1fr_50px] md:grid-rows-[60px_1fr_50px] min-h-screen">
      {/* Topbar */}
      <div className="col-span-full flex items-center justify-between px-6 bg-white border-b border-slate-200 relative z-10">
        <div className="flex items-center gap-4 flex-1">
          <span className="font-sans text-sm font-semibold text-slate-900 whitespace-nowrap">
            Question {currentQuestionNum} of {totalQuestions}
          </span>
          <div className="flex-1 max-w-[300px] h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center">
          {currentQuestionNum >= totalQuestions && isListening && (
            <button
              className={`font-sans text-sm font-semibold px-5 py-2 bg-red-600 text-white rounded-md cursor-pointer transition-all ${ending ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 active:scale-95"}`}
              onClick={handleEndInterview}
              disabled={ending}
            >
              {ending ? "Generating Feedback..." : "End Interview"}
            </button>
          )}
        </div>
      </div>

      {/* Left Panel - Interviewer */}
      <div className="bg-slate-50 p-6 overflow-y-auto flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg relative">
            <FaUserTie className="text-3xl text-white" />
            <div
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${isListening ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-lg font-bold text-slate-900">
              Natalie
            </span>
            <span className="font-sans text-sm text-slate-500">
              AI Interviewer
            </span>
          </div>
        </div>

        <div className="flex items-center min-h-[24px]">
          {isSpeaking && (
            <span className="font-sans text-sm font-bold text-primary animate-pulse">
              Speaking...
            </span>
          )}
          {isThinking && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
              <span className="font-sans text-sm font-bold text-amber-600">
                Thinking...
              </span>
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-2">
              <BsRecordCircleFill className="text-sm text-green-600 animate-pulse" />
              <span className="font-sans text-sm font-bold text-green-600">
                Your turn to answer
              </span>
            </div>
          )}
        </div>

        {currentAudio && (
          <AudioPlayer
            key={audioKey}
            audioBase64={currentAudio}
            autoPlay={true}
            onEnded={handleAudioEnded}
          />
        )}

        {isFarewell && (
          <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <p className="font-sans text-[15px] text-slate-700 leading-relaxed m-0">
              {farewellMessage}
            </p>
            <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isFarewell && !isThinking && interviewerText && (
          <div className="flex flex-col gap-2">
            <p className="font-sans text-[15px] text-slate-700 leading-relaxed m-0">
              {interviewerText}
            </p>
            {isListening && currentAudio && (
              <button
                className="bg-none text-sm text-primary cursor-pointer text-left font-semibold hover:underline w-fit"
                onClick={() => {
                  setAudioKey((prev) => prev + 1);
                  setInterviewerState(STATE_SPEAKING);
                }}
              >
                Hear Again
              </button>
            )}
          </div>
        )}

        {!isFarewell && currentQuestion && !isThinking && (
          <div className="border-l-4 border-primary bg-white p-5 rounded-r-lg shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-left-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans text-[11px] font-bold text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                Q{currentQuestionNum}
              </span>
              <span className="font-sans text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {currentQuestion.type}
              </span>
              {isCodeQuestion && (
                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <BsCodeSlash className="text-xs" /> Code
                </span>
              )}
            </div>
            <p className="font-sans text-[16px] text-slate-900 leading-relaxed m-0 font-semibold">
              {currentQuestion.text}
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Answer Area */}
      <div className="bg-white p-6 md:border-l border-slate-200 overflow-y-auto flex flex-col gap-6">
        {isListening && (
          <div className="animate-in fade-in duration-500">
            {!isCodeQuestion && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-slate-900 m-0">
                        Record Your Answer
                      </h3>
                      <p className="font-sans text-[13px] text-slate-500 mt-1">
                        Click record, speak your answer clearly, then click
                        submit to continue.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 py-4 bg-slate-50 rounded-xl border border-slate-100">
                    {!submitting ? (
                      <VoiceRecorder
                        onRecordingComplete={handleRecordingComplete}
                        disabled={submitting}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-5">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                        <p className="font-sans text-sm text-slate-500 m-0">
                          Processing your answer...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer font-sans text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    onClick={() => setShowTextFallback(!showTextFallback)}
                  >
                    <span className="flex items-center gap-2">
                      <BsKeyboardFill className="text-base text-slate-500" />
                      {showTextFallback
                        ? "Hide text input"
                        : "Prefer typing instead?"}
                    </span>
                    <span
                      className={`text-[10px] text-slate-400 transition-transform duration-300 ${showTextFallback ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </button>
                  {showTextFallback && (
                    <div className="p-4 flex flex-col gap-3 bg-white border-t border-slate-200 animate-in slide-in-from-top-2 duration-300">
                      <textarea
                        className={`w-full p-4 font-sans text-[15px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        placeholder="Type your answer here..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        rows={6}
                        disabled={submitting}
                      />
                      <button
                        className={`self-end font-sans text-sm font-semibold px-8 py-2.5 bg-primary text-white rounded-md transition-all ${submitting || !textAnswer.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-md active:scale-95"}`}
                        onClick={handleSubmitText}
                        disabled={submitting || !textAnswer.trim()}
                      >
                        {submitting ? "Submitting..." : "Submit Text Answer"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isCodeQuestion && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="flex items-center gap-2 font-serif text-xl text-slate-900 m-0">
                    <BsCodeSlash className="text-2xl text-primary" />
                    {currentQuestion.codeType === "fix"
                      ? "Fix the Code"
                      : currentQuestion.codeType === "explain"
                        ? "Explain the Code"
                        : "Write Your Solution"}
                  </h3>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="font-sans text-[13px] px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 bg-white hover:border-primary outline-none transition-colors"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                {currentQuestion.codeSnippet && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-inner">
                    <h4 className="font-sans text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      {currentQuestion.codeType === "fix"
                        ? "Buggy Code:"
                        : "Code to Explain:"}
                    </h4>
                    <pre className="font-mono text-[14px] text-blue-100 m-0 whitespace-pre-wrap break-words leading-relaxed">
                      {currentQuestion.codeSnippet}
                    </pre>
                  </div>
                )}

                {currentQuestion.codeType !== "explain" ? (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm h-[400px]">
                      <CodeEditor
                        value={
                          code ||
                          (currentQuestion.codeType === "fix"
                            ? currentQuestion.codeSnippet || ""
                            : "")
                        }
                        onChange={(val) => setCode(val || "")}
                        language={currentQuestion.codeLanguage || codeLanguage}
                      />
                    </div>
                    <button
                      className={`self-end font-sans text-sm font-semibold px-8 py-3 bg-primary text-white rounded-md transition-all ${submitting || !code.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-lg active:scale-95"}`}
                      onClick={handleSubmitCode}
                      disabled={submitting || !code.trim()}
                    >
                      {submitting
                        ? "Evaluating..."
                        : currentQuestion.codeType === "fix"
                          ? "Submit Fixed Code"
                          : "Submit Solution"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <p className="font-sans text-sm text-slate-500 m-0 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      Explain verbally what this code does, or type your
                      explanation below.
                    </p>

                    <div className="flex flex-col items-center gap-4 py-6 bg-slate-50 rounded-xl border border-slate-100">
                      {!submitting ? (
                        <VoiceRecorder
                          onRecordingComplete={async (audioBlob) => {
                            setSubmitting(true);
                            setInterviewerState(STATE_THINKING);
                            try {
                              const data = await transcribeAudio(audioBlob);
                              const text =
                                data.text || "Verbal explanation provided.";
                              setCode(text);
                              setTimeout(() => handleSubmitCode(), 100);
                            } catch (error) {
                              setCode("Verbal explanation provided.");
                              setTimeout(() => handleSubmitCode(), 100);
                            }
                          }}
                          disabled={submitting}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 p-5">
                          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                          <p className="font-sans text-sm text-slate-500 m-0">
                            Processing your explanation...
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer font-sans text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        onClick={() => setShowTextFallback(!showTextFallback)}
                      >
                        <span className="flex items-center gap-2">
                          <BsKeyboardFill className="text-base text-slate-500" />
                          {showTextFallback
                            ? "Hide"
                            : "Prefer typing your explanation?"}
                        </span>
                        <span
                          className={`text-[10px] text-slate-400 transition-transform duration-300 ${showTextFallback ? "rotate-180" : ""}`}
                        >
                          ▼
                        </span>
                      </button>
                      {showTextFallback && (
                        <div className="p-4 flex flex-col gap-3 bg-white border-t border-slate-200 animate-in slide-in-from-top-2 duration-300">
                          <textarea
                            className={`w-full p-4 font-sans text-[15px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                            placeholder="Type your explanation... What does this code do?"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={5}
                            disabled={submitting}
                          />
                          <button
                            className={`self-end font-sans text-sm font-semibold px-8 py-2.5 bg-primary text-white rounded-md transition-all ${submitting || !code.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-md active:scale-95"}`}
                            onClick={handleSubmitCode}
                            disabled={submitting || !code.trim()}
                          >
                            {submitting
                              ? "Submitting..."
                              : "Submit Explanation"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {codeEvaluation && (
                  <div
                    className={`rounded-lg p-5 flex flex-col gap-3 shadow-md animate-in zoom-in-95 duration-300 ${codeEvaluation.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-sans text-base font-bold text-slate-900">
                        {codeEvaluation.isCorrect ? (
                          <>
                            <BsCheckCircleFill className="text-xl text-green-600" />
                            Correct
                          </>
                        ) : (
                          <>
                            <BsXCircleFill className="text-xl text-red-600" />
                            Needs Improvement
                          </>
                        )}
                      </span>
                      <span className="font-sans text-sm font-bold bg-white px-3 py-1 rounded-full shadow-sm text-slate-700">
                        Score: {codeEvaluation.score}/100
                      </span>
                    </div>
                    <p className="font-sans text-sm text-slate-700 m-0 leading-relaxed">
                      {codeEvaluation.feedback}
                    </p>
                    {codeEvaluation.suggestions && (
                      <p className="font-sans text-[13px] text-slate-500 m-0 leading-relaxed pt-2 border-t border-slate-200/50">
                        <strong className="text-slate-700">Tip:</strong>{" "}
                        {codeEvaluation.suggestions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isSpeaking && (
          <div className="flex flex-col items-center justify-center gap-4 p-10 px-5 flex-1 animate-in fade-in duration-700">
            <div className="flex gap-1.5 h-12 items-center">
              {[0.2, 0.5, 0.3, 0.8, 0.4].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary/30 rounded-full animate-bounce"
                  style={{
                    height: `${h * 100}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
            <p className="font-sans text-[15px] text-slate-500 m-0 text-center">
              Natalie is speaking... please listen carefully
            </p>
          </div>
        )}
        {isThinking && (
          <div className="flex flex-col items-center justify-center gap-4 p-10 px-5 flex-1 animate-in fade-in duration-700">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
            <p className="font-sans text-[15px] text-slate-500 m-0 text-center">
              Natalie is preparing the next question...
            </p>
          </div>
        )}
        {isFarewell && (
          <div className="flex flex-col items-center justify-center gap-4 p-10 px-5 flex-1 animate-in fade-in duration-700">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-green-500 rounded-full animate-spin" />
            <p className="font-sans text-[15px] text-slate-500 m-0 text-center">
              Generating your feedback report...
            </p>
          </div>
        )}
      </div>

      {/* Bottom Timeline */}
      <div className="col-span-full bg-white border-t border-slate-200 flex items-center justify-center px-6 relative z-10">
        <div className="flex items-center gap-3">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qNum = i + 1;
            const isAnswered = qNum < currentQuestionNum;
            const isCurrent = qNum === currentQuestionNum;

            let dotClass =
              "w-8 h-8 rounded-full flex items-center justify-center font-sans text-[13px] font-semibold transition-all duration-300";
            if (isAnswered)
              dotClass +=
                " bg-green-500 border-green-500 text-white shadow-sm scale-90";
            else if (isCurrent)
              dotClass +=
                " bg-primary border-blue-700 text-white border-[3px] shadow-md scale-110";
            else
              dotClass += " bg-white border-2 border-slate-200 text-slate-400";

            return (
              <div key={i} className={dotClass}>
                {isAnswered ? <BsCheck className="text-xl" /> : qNum}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;
