
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
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { AppTheme } from '@/app/lib/settings-store';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
  });
}

// Unified slugify function for both TocSidebar and MarkViewer
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '') // Keep Chinese, letters, numbers
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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
    <span 
      className="flex justify-center my-8 w-full overflow-x-auto bg-transparent select-none block"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

const CodeBlock = ({ language, children, theme, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <span className="group relative my-6 rounded-lg border border-border/50 bg-muted/20 overflow-hidden block">
      <span className="flex items-center justify-between px-3 py-1 bg-muted/30 border-b border-border/10">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          {language || 'text'}
        </span>
        <button 
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-background transition-all text-muted-foreground hover:text-primary active:scale-90"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </span>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="span"
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          backgroundColor: 'transparent',
          lineHeight: '1.6',
          display: 'block'
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </span>
  );
};

interface MarkViewerProps {
  content: string;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  theme?: AppTheme;
}

const extractText = (node: any): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node) && node.props && 'children' in node.props) return extractText(node.props.children);
  return '';
};

export function MarkViewer({ content, forwardedRef, theme }: MarkViewerProps) {
  const generateId = (children: any) => {
    return slugify(extractText(children));
  };

  return (
    <div 
      ref={forwardedRef}
      className="markdown-preview p-6 md:p-10 w-full bg-background h-full overflow-y-auto scroll-smooth"
    >
      <article className="prose prose-neutral dark:prose-invert max-w-none w-full break-words">
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
                      e.stopPropagation();
                      const targetId = decodeURIComponent(href.slice(1));
                      const container = forwardedRef?.current;
                      if (!container) return;

                      const targetElement = 
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
              return <span className="block">{children}</span>;
            },
            code: ({ node, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const isBlockCode = !!match || (node?.position?.start?.line !== node?.position?.end?.line);

              if (isBlockCode && language === 'mermaid') {
                return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
              }

              if (isBlockCode) {
                return (
                  <CodeBlock language={language} theme={theme} {...props}>
                    {children}
                  </CodeBlock>
                );
              }

              return (
                <code 
                  className={cn(
                    "bg-muted/50 px-1.5 py-0.5 rounded text-[0.85em] font-code text-accent-foreground",
                    className
                  )} 
                  {...props}
                >
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
