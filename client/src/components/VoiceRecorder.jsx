import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  BsMicFill,
  BsRecordCircleFill,
  BsCheckCircleFill,
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
            toast.success("Maximum recording time reached (5 minutes).");
            return MAX_RECORD_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }
      }
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [mediaRecorder, audioPreviewUrl]);

  const startRecording = async () => {
    try {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      setRecordedBlob(null);
      setAudioPreviewUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const options = { mimeType: "audio/webm;codecs=opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "audio/webm";
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlob(audioBlob);

        const previewUrl = URL.createObjectURL(audioBlob);
        setAudioPreviewUrl(previewUrl);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Microphone access error:", error.message);
      toast.error(
        "Could not access microphone. Please allow microphone permissions.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
      setRecordedBlob(null);
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
        setAudioPreviewUrl(null);
      }
      setRecordingTime(0);
    }
  };

  const handleReRecord = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setRecordedBlob(null);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 p-8 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-xl mx-auto">
      {!isRecording && !recordedBlob && (
        <button
          className={`w-full py-4 bg-primary text-white font-sans text-sm font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={startRecording}
          disabled={disabled}
        >
          <BsMicFill className="text-lg" />
          START RECORDING
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col items-center gap-6 py-8 px-12 bg-red-50 border border-red-100 rounded-2xl w-full animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <BsRecordCircleFill className="text-red-500 text-2xl animate-pulse" />
            <span className="font-sans text-sm font-black text-red-600 uppercase tracking-widest pl-1">Recording</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-4xl font-black text-red-700 tracking-tighter">
              {formatTime(recordingTime)}
            </span>
            <span className="font-sans text-[10px] font-black text-red-300 uppercase tracking-[0.2em]">
              Limit: {formatTime(MAX_RECORD_TIME)}
            </span>
          </div>
          <button className="px-10 py-3 bg-red-600 text-white font-sans text-sm font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase tracking-widest" onClick={stopRecording}>
            Stop
          </button>
        </div>
      )}

      {!isRecording && recordedBlob && (
        <div className="flex flex-col items-center gap-8 w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full flex flex-col gap-4">
            <p className="font-sans text-xs font-black text-slate-400 uppercase tracking-widest text-center">
              Review your recording
            </p>
            <audio className="w-full h-12 accent-primary" src={audioPreviewUrl} controls />
            <p className="font-sans text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest">
              Duration: <span className="text-slate-900">{formatTime(recordingTime)}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 w-full">
            <button
              className={`flex-1 py-4 bg-white text-slate-600 border border-slate-200 font-sans text-sm font-black rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all uppercase tracking-widest ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
              onClick={handleReRecord}
              disabled={disabled}
            >
              Discard
            </button>
            <button
              className={`flex-1 py-4 bg-success text-white font-sans text-sm font-black rounded-xl shadow-lg shadow-success/20 hover:bg-success-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
              onClick={handleSubmit}
              disabled={disabled}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
