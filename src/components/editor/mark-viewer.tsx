
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

if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base', // 使用 base 主题以允许完全自定义颜色
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
    themeVariables: {
      // 节点基础样式：白底、灰边、黑字
      primaryColor: '#ffffff',
      primaryBorderColor: '#d1d5db',
      primaryTextColor: '#1f2937',
      nodeBkg: '#ffffff',
      nodeBorder: '#d1d5db',
      clusterBkg: '#f9fafb',
      clusterBorder: '#e5e7eb',
      lineColor: '#94a3b8',
      tertiaryColor: '#ffffff',
      // 关键修复：彻底移除连线文字背后的背景框
      edgeLabelBackground: 'transparent',
      fontSize: '14px',
    },
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      useMaxWidth: true,
      // 关键修复：增加足够内边距，防止图框边缘文字被截断
      padding: 30,
      nodeSpacing: 50,
      rankSpacing: 50,
    },
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
        // 每次渲染前清理可能残留的错误状态
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
  onToggleTask?: (index: number) => void;
}

export function MarkViewer({ content, forwardedRef, onToggleTask }: MarkViewerProps) {
  // 渲染时重置任务索引，确保与源码匹配逻辑一致
  let taskIndex = 0;

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
            input: ({ node, ...props }) => {
              if (props.type === 'checkbox') {
                const currentIndex = taskIndex++;
                return (
                  <input
                    type="checkbox"
                    checked={props.checked}
                    className="cursor-pointer w-4 h-4 mt-1 accent-primary rounded border-muted transition-all"
                    readOnly
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleTask?.(currentIndex);
                    }}
                  />
                );
              }
              return <input {...props} />;
            },
            pre: ({ children }: any) => {
              const childProps = (children as any)?.props || {};
              const className = childProps.className || '';
              const isMermaid = className.includes('language-mermaid');
              
              if (isMermaid) {
                // Mermaid 容器保持无缝透明
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
