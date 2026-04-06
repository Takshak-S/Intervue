import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { 
  BsPlayFill, 
  BsCheckCircleFill, 
  BsXCircleFill, 
  BsCodeSquare,
  BsTerminalFill,
  BsSendFill
} from "react-icons/bs";

function CodeEditor({ value, onChange, language, onLanguageChange, onSubmit, submitting, evaluation, readOnly }) {
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setShowConsole(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/5">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <BsCodeSquare className="text-lg text-primary" />
            <span className="font-sans text-xs font-black uppercase tracking-widest">Main.js</span>
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-[#2d2d2d] text-slate-300 font-sans text-xs font-bold border-none rounded-md px-3 py-1 outline-none hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className={`flex items-center gap-2 px-4 py-1.5 font-sans text-xs font-black rounded-lg transition-all ${isRunning ? "bg-slate-700 text-slate-400" : "bg-[#333333] text-slate-300 hover:bg-[#444444] hover:text-white"}`}
            disabled={isRunning || submitting}
          >
            <BsPlayFill className="text-base" />
            RUN CODE
          </button>
          <button
            onClick={onSubmit}
            className={`flex items-center gap-2 px-5 py-1.5 bg-primary text-white font-sans text-xs font-black rounded-lg shadow-lg shadow-primary/20 transition-all ${submitting || !value?.trim() ? "opacity-30 cursor-not-allowed" : "hover:bg-primary-dark active:scale-95"}`}
            disabled={submitting || !value?.trim()}
          >
            <BsSendFill className="text-xs" />
            {submitting ? "SUBMITTING..." : "SUBMIT SOLUTION"}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          language={language || 'javascript'}
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            readOnly: readOnly || false,
            minimap: { enabled: false },
            fontSize: 15,
            lineHeight: 24,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            bracketPairColorization: { enabled: true },
            padding: { top: 20, bottom: 20 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden'
            }
          }}
        />

        {/* Floating Console Output (Simulated) */}
        {showConsole && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300 z-10">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <BsTerminalFill className="text-xs" />
                <span className="font-sans text-[10px] font-black uppercase tracking-widest">Output Console</span>
              </div>
              <button 
                onClick={() => setShowConsole(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="font-mono text-sm">
              {isRunning ? (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <span>Executing code...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-emerald-400">✓ Code executed successfully</span>
                  <span className="text-slate-500 text-xs mt-1">Exit code: 0</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Results Overlay */}
      {evaluation && (
        <div className={`p-6 border-t animate-in slide-in-from-bottom-2 duration-500 ${evaluation.isCorrect ? "bg-emerald-950/30 border-emerald-500/20" : "bg-red-950/30 border-red-500/20"}`}>
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${evaluation.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {evaluation.isCorrect ? <BsCheckCircleFill className="text-xl" /> : <BsXCircleFill className="text-xl" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-sans text-sm font-black uppercase tracking-widest ${evaluation.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {evaluation.isCorrect ? "Assessment Passed" : "Refinement Needed"}
                </h4>
                <span className="font-mono text-xl font-black text-white">
                  Score: {evaluation.score}/100
                </span>
              </div>
              <p className="font-sans text-sm text-slate-300 leading-relaxed m-0">
                {evaluation.feedback}
              </p>
              {evaluation.suggestions && (
                <div className="mt-3 pt-3 border-t border-white/5">
                   <p className="font-sans text-xs text-slate-400 m-0 italic">
                    <strong className="text-slate-200 uppercase not-italic mr-2 tracking-widest">Tip:</strong> 
                    {evaluation.suggestions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeEditor;
