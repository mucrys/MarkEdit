
'use client';

import React, { useEffect, useState, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkToc from 'remark-toc';
import remarkEmoji from 'remark-emoji';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'katex/dist/katex.min.css';

// 恢复到最基础的默认配置，确保字符显示正常
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
        const { svg: renderedSvg } = await mermaid.render(`render-${containerId}`, chart);
        if (active) setSvg(renderedSvg);
      } catch (error) {
        console.error('Mermaid rendering failed:', error);
      }
    };
    renderChart();
    return () => { active = false; };
  }, [chart, containerId]);

  return (
    <div 
      className="flex justify-center my-8 w-full overflow-x-auto bg-transparent"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

interface MarkViewerProps {
  content: string;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  onToggleTask?: (lineIndex: number) => void;
}

export function MarkViewer({ content, forwardedRef, onToggleTask }: MarkViewerProps) {
  return (
    <div 
      ref={forwardedRef}
      className="markdown-preview p-6 md:p-10 w-full bg-white min-h-full overflow-y-auto scroll-smooth"
    >
      <article className="prose prose-neutral max-w-none w-full">
        <ReactMarkdown 
          remarkPlugins={[
            remarkGfm, 
            remarkMath, 
            [remarkToc, { heading: '目录|toc|Table of Contents', tight: true }],
            remarkEmoji
          ]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // 禁用默认 checkbox 渲染，交由 li 统一处理以获得准确行号
            input: ({ node, ...props }) => {
              if (props.type === 'checkbox') return null;
              return <input {...props} />;
            },
            li: ({ node, children, checked, ...props }: any) => {
              // 任务列表项
              if (checked !== null) {
                // 利用 MDAST 的 position 信息直接获取该任务项在源码中的起始行号（1-indexed）
                const lineIndex = node?.position?.start?.line - 1;
                
                return (
                  <li 
                    className="list-none flex items-start gap-2 -ml-6 mb-2 group" 
                    {...props}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      className="cursor-pointer w-4 h-4 mt-1.5 accent-primary rounded border-muted transition-all shrink-0"
                      readOnly
                      onClick={(e) => {
                        e.preventDefault();
                        if (typeof lineIndex === 'number' && lineIndex >= 0) {
                          onToggleTask?.(lineIndex);
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      {/* 渲染 li 的其余子元素，跳过 remark-gfm 自动生成的第一个 checkbox 子节点 */}
                      {React.Children.toArray(children).slice(1)}
                    </div>
                  </li>
                );
              }
              return <li {...props}>{children}</li>;
            },
            pre: ({ children }: any) => {
              const childProps = (children as any)?.props || {};
              const className = childProps.className || '';
              const isMermaid = className.includes('language-mermaid');
              
              if (isMermaid) {
                return <div className="my-2 p-0 bg-transparent border-none overflow-visible">{children}</div>;
              }
              
              return (
                <pre className="bg-muted/30 text-foreground p-4 md:p-5 rounded-xl overflow-x-auto my-6 border border-border/50">
                  {children}
                </pre>
              );
            },
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (!inline && language === 'mermaid') {
                return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
              }

              if (!inline && language) {
                return (
                  <SyntaxHighlighter
                    style={oneLight}
                    language={language}
                    PreTag="div"
                    className="rounded-xl my-6 border border-border/50 overflow-hidden"
                    customStyle={{
                      margin: 0,
                      padding: '1.25rem',
                      fontSize: '0.9rem',
                      backgroundColor: 'hsl(var(--muted) / 0.1)',
                      lineHeight: '1.6',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
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
