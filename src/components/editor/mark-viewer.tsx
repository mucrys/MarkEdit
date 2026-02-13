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
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

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

const CodeBlock = ({ language, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 rounded-xl border border-border/50 bg-muted/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20 border-b border-border/20">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          {language || 'text'}
        </span>
        <button 
          onClick={copyToClipboard}
          className="p-1 rounded-md hover:bg-white transition-all text-muted-foreground hover:text-primary active:scale-90"
          title="复制代码"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneLight}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          fontSize: '0.85rem',
          backgroundColor: 'transparent',
          lineHeight: '1.6',
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

interface MarkViewerProps {
  content: string;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
}

export function MarkViewer({ content, forwardedRef }: MarkViewerProps) {
  // 辅助函数：将标题文本转换为安全的 ID
  const generateId = (text: any) => {
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div 
      ref={forwardedRef}
      className="markdown-preview p-6 md:p-10 w-full bg-white h-full overflow-y-auto scroll-smooth"
    >
      <article className="prose prose-neutral max-w-none w-full break-words">
        <ReactMarkdown 
          remarkPlugins={[
            remarkGfm, 
            remarkMath, 
            [remarkToc, { heading: '目录|toc|Table of Contents', tight: true }],
            remarkEmoji
          ]}
          rehypePlugins={[rehypeKatex]}
          components={{
            a: ({ node, ...props }: any) => {
              const href = props.href || '';
              if (href.startsWith('#')) {
                return (
                  <a 
                    {...props} 
                    className="text-primary hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      const targetId = decodeURIComponent(href.slice(1));
                      const container = forwardedRef?.current;
                      if (!container) return;

                      const targetElement = 
                        document.getElementById(targetId) || 
                        container.querySelector(`[id="${targetId}"]`) ||
                        container.querySelector(`[id="user-content-${targetId}"]`);

                      if (targetElement) {
                        const containerRect = container.getBoundingClientRect();
                        const targetRect = targetElement.getBoundingClientRect();
                        const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
                        
                        container.scrollTo({
                          top: relativeTop - 20,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  />
                );
              }
              return <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />;
            },
            h1: ({ children }) => <h1 id={generateId(children)}>{children}</h1>,
            h2: ({ children }) => <h2 id={generateId(children)}>{children}</h2>,
            h3: ({ children }) => <h3 id={generateId(children)}>{children}</h3>,
            h4: ({ children }) => <h4 id={generateId(children)}>{children}</h4>,
            h5: ({ children }) => <h5 id={generateId(children)}>{children}</h5>,
            h6: ({ children }) => <h6 id={generateId(children)}>{children}</h6>,
            pre: ({ children }: any) => {
              return <>{children}</>;
            },
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (!inline && language === 'mermaid') {
                return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
              }

              if (!inline) {
                return (
                  <CodeBlock language={language} {...props}>
                    {children}
                  </CodeBlock>
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
