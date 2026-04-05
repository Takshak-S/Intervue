import { useState, useEffect } from "react";
import { BsMicFill } from "react-icons/bs";

const SILENCE_TIMEOUT = 3000;

function ConversationalMic({ onTranscriptReady, onAutoSubmit, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [silenceTimer, setSilenceTimer] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    let accumulated = "";

    recog.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim = transcript;
        }
      }

      if (final) {
        accumulated = final.trim();
        setFinalText(accumulated);
      }
      setLiveText(interim);

      clearSilenceTimer();
      startSilenceTimer(accumulated || interim);
    };

    recog.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        return;
      }
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    setRecognition(recog);

    return () => {
      recog.abort();
      clearSilenceTimer();
    };
  }, []);

  useEffect(() => {
    if (recognition && isSupported && !disabled) {
      startListening();
    }
  }, [recognition, isSupported, disabled]);

  const clearSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    setAutoSubmitCountdown(null);
  };

  const startSilenceTimer = (currentText) => {
    const timer = setTimeout(() => {
      if (currentText && currentText.trim().length > 0) {
        handleAutoSubmit(currentText.trim());
      }
    }, SILENCE_TIMEOUT);
    setSilenceTimer(timer);

    setAutoSubmitCountdown(3);
    setTimeout(() => setAutoSubmitCountdown(2), 1000);
    setTimeout(() => setAutoSubmitCountdown(1), 2000);
  };

  const startListening = () => {
    if (!recognition) return;
    try {
      setLiveText("");
      setFinalText("");
      setAutoSubmitCountdown(null);
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Recognition start error:", error.message);
    }
  };

  const stopListening = () => {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (error) {
      // Already stopped
    }
    setIsListening(false);
    clearSilenceTimer();
  };

  const handleAutoSubmit = (text) => {
    stopListening();
    if (onAutoSubmit) {
      onAutoSubmit(text);
    }
  };

  const handleManualSubmit = () => {
    const text = (finalText + " " + liveText).trim();
    if (!text) return;
    stopListening();
    if (onAutoSubmit) {
      onAutoSubmit(text);
    }
  };

  const handleRestart = () => {
    setLiveText("");
    setFinalText("");
    clearSilenceTimer();
    startListening();
  };

  const displayText = (finalText + " " + liveText).trim();

  if (!isSupported) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
        <p className="font-sans text-sm font-bold text-red-600 m-0">
          Voice recognition is not supported in this browser. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm w-full max-w-xl mx-auto">
      <div className="relative flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-red-500/20 animate-ping duration-[2000ms] ${isListening ? "opacity-100" : "opacity-0"}`} />
        <button
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? "bg-red-500 text-white shadow-xl shadow-red-200 scale-110" : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
        >
          <BsMicFill className="text-2xl" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 h-6">
        {isListening && !displayText && (
          <p className="font-sans text-sm font-black text-red-500 animate-pulse uppercase tracking-widest">Listening...</p>
        )}
        {isListening && displayText && !autoSubmitCountdown && (
          <p className="font-sans text-sm font-black text-red-500 animate-pulse uppercase tracking-widest">Hearing you...</p>
        )}
        {autoSubmitCountdown && (
          <p className="font-sans text-sm font-bold text-amber-500 flex items-center gap-3">
            Submitting in {autoSubmitCountdown}s...{" "}
            <button
              className="text-xs font-black text-primary underline underline-offset-4 hover:text-primary-dark uppercase"
              onClick={() => {
                clearSilenceTimer();
                startListening();
              }}
            >
              Keep talking
            </button>
          </p>
        )}
        {!isListening && displayText && <p className="font-sans text-sm font-bold text-green-500 uppercase tracking-widest">Ready to submit</p>}
        {!isListening && !displayText && (
          <p className="font-sans text-sm font-bold text-slate-400 uppercase tracking-widest">Ready to listen</p>
        )}
      </div>

      {displayText && (
        <div className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[120px] flex flex-col gap-2 shadow-inner group">
          <span className="font-sans text-base text-slate-900 leading-relaxed">{finalText}</span>
          {liveText && (
            <span className="font-sans text-base text-slate-400 leading-relaxed italic animate-in fade-in duration-300">{liveText}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 w-full">
        {isListening ? (
          <button
            className={`w-full py-4 font-sans text-sm font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] ${!displayText ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-primary text-white shadow-primary/30 hover:bg-primary-dark hover:translate-y-[-1px]"}`}
            onClick={handleManualSubmit}
            disabled={!displayText}
          >
            SUBMIT ANSWER
          </button>
        ) : displayText ? (
          <div className="flex gap-4 w-full">
            <button className="flex-1 py-4 bg-white text-slate-600 border-2 border-slate-100 font-sans text-sm font-black rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all uppercase" onClick={handleRestart}>
              Speak Again
            </button>
            <button className="flex-1 py-4 bg-primary text-white font-sans text-sm font-black rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform hover:translate-y-[-1px] active:scale-[0.98] uppercase" onClick={handleManualSubmit}>
              Submit
            </button>
          </div>
        ) : (
          <button
            className={`w-full py-4 font-sans text-sm font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] ${disabled ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-primary text-white shadow-primary/30 hover:bg-primary-dark hover:translate-y-[-1px]"}`}
            onClick={startListening}
            disabled={disabled}
          >
            START LISTENING
          </button>
        )}
      </div>
    </div>
  );
}

export default ConversationalMic;
