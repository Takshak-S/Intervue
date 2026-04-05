import Editor from '@monaco-editor/react';

function CodeEditor({ value, onChange, language, readOnly }) {
  return (
    <div className="h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
      <Editor
        height="100%"
        language={language || 'javascript'}
        theme="light"
        value={value}
        onChange={onChange}
        options={{
          readOnly: readOnly || false,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "monospace",
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          bracketPairColorization: { enabled: true },
          padding: { top: 12 },
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}

export default CodeEditor;
