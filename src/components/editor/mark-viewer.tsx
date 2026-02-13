
'use client';

import React from 'react';

interface MarkViewerProps {
  content: string;
}

export function MarkViewer({ content }: MarkViewerProps) {
  // Simple markdown processor (for a real app we'd use react-markdown, 
  // but let's simulate clean rendering with standard HTML styling)
  const lines = content.split('\n');

  return (
    <div className="markdown-preview p-4 md:p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-sm min-h-full">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) return <h1 key={idx}>{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={idx}>{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={idx}>{line.replace('### ', '')}</h3>;
        if (line.startsWith('> ')) return <blockquote key={idx}>{line.replace('> ', '')}</blockquote>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li className="ml-6 list-disc" key={idx}>{line.replace(/[-*] /, '')}</li>;
        if (line.trim() === '') return <div key={idx} className="h-4" />;
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}
