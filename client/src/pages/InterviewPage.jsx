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
  BsMicFill,
  BsChatLeftTextFill,
  BsArrowRightShort,
  BsClockFill,
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

  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewerText, setInterviewerText] = useState("");
  const [farewellMessage, setFarewellMessage] = useState("");

  const [textAnswer, setTextAnswer] = useState("");
  const [selectedTab, setSelectedTab] = useState("voice");

  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeEvaluation, setCodeEvaluation] = useState(null);

  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioKey, setAudioKey] = useState(0);

  const [codeTimer, setCodeTimer] = useState(900); // 15 minutes

  const isCodeQuestion = currentQuestion?.isCodeQuestion;
  const progressPercent = (currentQuestionNum / totalQuestions) * 100;
  const isSpeaking = interviewerState === STATE_SPEAKING;
  const isThinking = interviewerState === STATE_THINKING;
  const isListening = interviewerState === STATE_LISTENING;
  const isFarewell = interviewerState === STATE_FAREWELL;

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

        const interviewerMsgs = data.messages.filter((m) => m.role === "interviewer");
        if (data.currentQuestion === 1 && interviewerMsgs.length >= 1) {
          setInterviewerText(interviewerMsgs[0].content);
        } else if (interviewerMsgs.length > 0) {
          setInterviewerText(interviewerMsgs[interviewerMsgs.length - 1].content);
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
  }, [id, navigate]);

  useEffect(() => {
    setSelectedTab("voice");
    setTextAnswer("");
    setCodeEvaluation(null);
    setCode("");
  }, [currentQuestionNum]);

  useEffect(() => {
    let timer;
    if (isCodeQuestion && isListening) {
      timer = setInterval(() => {
        setCodeTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setCodeTimer(900);
    }
    return () => clearInterval(timer);
  }, [isCodeQuestion, isListening]);

  const formatCodeTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAudioEnded = () => {
    if (interviewerState === STATE_FAREWELL) return;
    setTimeout(() => setInterviewerState(STATE_LISTENING), 1500);
  };

  const processAnswerResult = (result) => {
    if (result.isComplete) {
      setFarewellMessage("Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report...");
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
    setInterviewerState(STATE_SPEAKING);
    if (!result.audio) setTimeout(() => setInterviewerState(STATE_LISTENING), 3000);
  };

  const submitAndProcess = async (answerText) => {
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const result = await submitTextAnswer(id, answerText);
      processAnswerResult(result);
    } catch (error) {
      toast.error("Failed to submit answer");
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
      const answerText = data.text || "The candidate provided a verbal response.";
      const result = await submitTextAnswer(id, answerText);
      processAnswerResult(result);
    } catch (error) {
      toast.error("Failed to submit answer");
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
        setFarewellMessage("Thank you for completing the interview! I really enjoyed our conversation...");
        setInterviewerState(STATE_FAREWELL);
        setTimeout(() => handleEndInterview(), 5000);
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
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        <p className="font-sans text-base text-slate-500 m-0">Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="w-full bg-white border-b border-slate-200 shadow-sm relative z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg">
              <span className="font-sans text-sm font-bold text-slate-900 mr-2">
                Step {currentQuestionNum} / {totalQuestions}
              </span>
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === currentQuestionNum ? "w-4 bg-primary" : 
                    i + 1 < currentQuestionNum ? "bg-emerald-500" : "bg-slate-300"
                  }`} 
                />
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            {isCodeQuestion && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100 animate-pulse">
                <BsClockFill className="text-xs" />
                <span className="font-mono text-sm font-black">{formatCodeTime(codeTimer)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {currentQuestionNum >= totalQuestions && isListening && (
              <button
                className={`font-sans text-sm font-bold px-6 py-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200 transition-all ${ending ? "opacity-30" : "hover:bg-red-700 active:scale-95"}`}
                onClick={handleEndInterview}
                disabled={ending}
              >
                {ending ? "Finishing..." : "Complete interview"}
              </button>
            )}
            <button className="font-sans text-xs font-bold text-slate-400 hover:text-red-500 transition-colors" onClick={() => navigate("/history")}>Exit</button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-700" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-[2] bg-white md:bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-8 flex flex-col gap-8 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <FaUserTie className="text-3xl text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${isListening ? "bg-green-500 animate-pulse" : isThinking ? "bg-amber-400 animate-bounce" : "bg-primary"}`} />
              </div>
              <div>
                <h2 className="font-serif text-xl text-slate-900 m-0 leading-none">Natalie</h2>
                <span className="font-sans text-[10px] font-black text-primary uppercase tracking-[0.2em] block mt-2">Ai interviewer</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border transition-all duration-500 ${isThinking ? "bg-amber-50 border-amber-100 shadow-sm" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-sans text-[10px] font-black uppercase tracking-[0.2em] ${isThinking ? "text-amber-600" : isListening ? "text-green-600" : "text-primary"}`}>
                    {isSpeaking ? "Natalie is speaking" : isThinking ? "Natalie is thinking" : "Listening for response"}
                  </span>
                </div>
                {isFarewell ? (
                  <p className="font-sans text-lg text-slate-700 m-0 italic">"{farewellMessage}"</p>
                ) : interviewerText ? (
                  <div className="flex flex-col gap-4">
                    <p className="font-sans text-lg text-slate-800 m-0 font-medium tracking-tight whitespace-pre-wrap leading-relaxed">"{interviewerText}"</p>
                    {isListening && currentAudio && (
                      <button className="flex items-center gap-1.5 font-sans text-xs font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-widest" onClick={() => setAudioKey(prev => prev + 1)}>
                        <BsMicFill className="text-[16px]" /> Hear again
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce delay-200" />
                  </div>
                )}
              </div>

              {!isFarewell && currentQuestion && (
                <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-md">
                        {isCodeQuestion ? "Technical assessment" : "Direct question"}
                      </span>
                      <span className="font-sans text-[11px] font-medium text-slate-400 border border-white/10 px-3 py-1 rounded-md">
                        {currentQuestion.type}
                      </span>
                    </div>
                    <p className="font-sans text-xl text-white leading-[1.7] m-0 font-normal tracking-tight">{currentQuestion.text}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {currentAudio && <div className="hidden"><AudioPlayer key={audioKey} audioBase64={currentAudio} autoPlay={true} onEnded={handleAudioEnded} /></div>}
        </div>

        <div className="flex-[3] bg-white flex flex-col overflow-hidden shadow-2xl shadow-slate-200 relative z-10">
          {!isCodeQuestion ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex p-4 border-b border-slate-100 bg-slate-50 gap-2">
                <button onClick={() => setSelectedTab("voice")} className={`flex-1 flex items-center justify-center gap-3 py-3 font-sans text-sm font-bold rounded-2xl transition-all ${selectedTab === "voice" ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:bg-slate-100/50"}`}>
                  <BsMicFill className="text-[16px]" /> Voice answer
                </button>
                <button onClick={() => setSelectedTab("text")} className={`flex-1 flex items-center justify-center gap-3 py-3 font-sans text-sm font-bold rounded-2xl transition-all ${selectedTab === "text" ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:bg-slate-100/50"}`}>
                  <BsChatLeftTextFill className="text-[16px]" /> Type response
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 flex flex-col">
                <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
                  <div className="mb-8">
                    <h3 className="font-serif text-2xl text-slate-900 m-0">Your Response</h3>
                    <p className="font-sans text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Question {currentQuestionNum} of {totalQuestions}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8">
                    {!submitting ? (
                      selectedTab === "voice" ? (
                        <VoiceRecorder onRecordingComplete={handleRecordingComplete} disabled={submitting || !isListening} />
                      ) : (
                        <div className="w-full h-full flex flex-col gap-6">
                          <textarea className="flex-1 w-full p-8 font-sans text-lg text-slate-700 bg-white border border-slate-200 rounded-3xl outline-none transition-all resize-none shadow-sm focus:border-primary" placeholder="Start typing your response..." value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} disabled={!isListening} />
                          <button className={`flex items-center justify-center gap-2 py-4 bg-primary text-white font-sans text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all ${!textAnswer.trim() || !isListening ? "opacity-30" : "hover:bg-primary-dark active:scale-95"}`} onClick={handleSubmitText} disabled={!textAnswer.trim() || !isListening}>Submit answer <BsArrowRightShort className="text-xl" /></button>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                        <span className="font-sans text-sm font-black text-slate-400">Processing answer...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden p-6 bg-slate-100">
              <CodeEditor
                value={code || (currentQuestion.codeSnippet || "")}
                onChange={(val) => setCode(val || "")}
                language={currentQuestion.codeLanguage || codeLanguage}
                onLanguageChange={setCodeLanguage}
                onSubmit={handleSubmitCode}
                submitting={submitting}
                evaluation={codeEvaluation}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;
