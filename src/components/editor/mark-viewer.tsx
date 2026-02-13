'use client';

import React, { useEffect, useState, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
  });
}

const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  const id = useId().replace(/:/g, '');
  const containerId = `mermaid-${id}`;

  useEffect(() => {
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(containerId, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid rendering failed:', error);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart, containerId]);

  return (
    <div 
      className="flex justify-center my-6 overflow-x-auto w-full"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

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
            // Handle checkboxes for task lists
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
            },
            // Handle code blocks specially to hide pre background for mermaid
            pre: ({ children }: any) => {
              // Check if the child code block is mermaid
              const isMermaid = React.isValidElement(children) && 
                                (children.props as any).className?.includes('language-mermaid');
              
              return (
                <pre className={isMermaid ? "bg-transparent border-none p-0 my-0 shadow-none overflow-visible" : ""}>
                  {children}
                </pre>
              );
            },
            // Handle mermaid code blocks
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (!inline && language === 'mermaid') {
                return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
