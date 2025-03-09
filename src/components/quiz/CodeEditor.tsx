
import React from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

// A simplified code editor component - in a real application, 
// you would integrate a proper code editor like Monaco Editor or CodeMirror
const CodeEditor = ({ value, onChange, language }: CodeEditorProps) => {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="bg-[#1E1E2E] p-2 border-b border-white/10 flex items-center">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <span className="text-white/50 text-xs">{language.toUpperCase()}</span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1E1E2E] text-white/90 p-4 h-64 outline-none font-mono text-sm"
        placeholder={`// Write your ${language} code here...`}
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;
