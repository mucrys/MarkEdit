'use client';

import React, { useEffect, useState, useId, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
  });
}

const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  const id = useId().replace(/:/g, '');
  const containerId = `mermaid-svg-${id}`;

  useEffect(() => {
    let active = true;
    
    const renderChart = async () => {
      if (!chart.trim()) return;
      try {
        const { svg } = await mermaid.render(`render-${containerId}`, chart);
        if (active) setSvg(svg);
      } catch (error) {
        console.error('Mermaid rendering failed:', error);
      }
    };

    renderChart();

    return () => {
      active = false;
    };
  }, [chart, containerId]);

  return (
    <div 
      className="flex justify-center my-4 w-full overflow-x-auto bg-transparent"
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
      className="markdown-preview p-6 md:p-10 w-full bg-white min-h-full overflow-y-auto scroll-smooth"
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
            // Handle pre tags to remove background for mermaid
            pre: ({ children }: any) => {
              const isMermaid = React.isValidElement(children) && 
                                (children.props as any).className?.includes('language-mermaid');
              
              if (isMermaid) {
                return <div className="my-0 p-0 bg-transparent border-none shadow-none">{children}</div>;
              }
              
              return (
                <pre className="bg-muted/30 text-foreground p-4 md:p-5 rounded-xl overflow-x-auto my-6 border border-border/50">
                  {children}
                </pre>
              );
            },
            // Handle code blocks specially
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
