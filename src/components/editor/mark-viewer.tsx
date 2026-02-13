'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkViewerProps {
  content: string;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  onToggleTask?: (index: number) => void;
}

export function MarkViewer({ content, forwardedRef, onToggleTask }: MarkViewerProps) {
  let taskIndex = 0;

  return (
    <div 
      ref={forwardedRef}
      className="markdown-preview p-6 md:p-10 w-full bg-white shadow-sm min-h-full overflow-y-auto scroll-smooth"
    >
      <article className="prose prose-neutral max-w-none w-full">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            input: ({ node, ...props }) => {
              if (props.type === 'checkbox') {
                const currentIndex = taskIndex++;
                return (
                  <input
                    {...props}
                    className="cursor-pointer w-4 h-4 mt-1 accent-primary rounded border-muted transition-all"
                    onChange={() => onToggleTask?.(currentIndex)}
                  />
                );
              }
              return <input {...props} />;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
