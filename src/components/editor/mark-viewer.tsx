
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkViewerProps {
  content: string;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
}

export function MarkViewer({ content, forwardedRef }: MarkViewerProps) {
  return (
    <div 
      ref={forwardedRef}
      className="markdown-preview p-6 md:p-10 max-w-4xl mx-auto bg-white rounded-xl shadow-sm min-h-full overflow-y-auto scroll-smooth"
    >
      <article className="prose prose-neutral max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
