import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  BsMicFill,
  BsStopFill,
  BsTrashFill,
  BsCheckCircleFill,
  BsArrowRightShort,
} from "react-icons/bs";

const MAX_RECORD_TIME = 300;

function VoiceRecorder({ onRecordingComplete, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

  useEffect(() => {
    let timerId = null;
    if (isRecording) {
      timerId = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= MAX_RECORD_TIME) {
            stopRecording();
            return MAX_RECORD_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [mediaRecorder, audioPreviewUrl]);

  const startRecording = async () => {
    try {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      setRecordedBlob(null);
      setAudioPreviewUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder?.state !== "inactive") mediaRecorder.stop();
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
      setRecordedBlob(null);
      setAudioPreviewUrl(null);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {!isRecording && !recordedBlob && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
          <button
            onClick={startRecording}
            disabled={disabled}
            className={`w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all outline-none ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-primary-dark"}`}
          >
            <BsMicFill className="text-5xl" />
          </button>
          <span className="font-sans text-sm font-black text-primary uppercase tracking-[0.3em] animate-pulse">Start Recording</span>
        </div>
      )}

      {isRecording && (
        <div className="flex flex-col items-center gap-10 w-full animate-in zoom-in-90 duration-300">
          <div className="flex items-center gap-1 h-20 px-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary rounded-full animate-waveform"
                style={{
                  height: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${500 + Math.random() * 1000}ms`
                }}
              />
            ))}
          </div>
          
          <div className="flex flex-col items-center">
            <span className="font-mono text-5xl font-black text-slate-900 tracking-tighter">
              {formatTime(recordingTime)}
            </span>
            <span className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              Limit: {formatTime(MAX_RECORD_TIME)}
            </span>
          </div>

          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
          >
            <BsStopFill className="text-4xl" />
          </button>
        </div>
      )}

      {!isRecording && recordedBlob && (
        <div className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-black text-slate-400 uppercase tracking-widest">Preview Answer</span>
              <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{formatTime(recordingTime)}</span>
            </div>
            <audio src={audioPreviewUrl} controls className="w-full h-10" />
          </div>

          <div className="flex items-center gap-4 w-full max-w-sm">
            <button
              onClick={() => { setRecordedBlob(null); setAudioPreviewUrl(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-500 border border-slate-200 font-sans text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all"
            >
              <BsTrashFill className="text-base" />
              Discard
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-success text-white font-sans text-sm font-bold rounded-2xl shadow-lg shadow-success/20 hover:bg-success-dark transition-all transform active:scale-95"
            >
              Submit Answer
              <BsArrowRightShort className="text-2xl" />
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
        .animate-waveform {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default VoiceRecorder;
