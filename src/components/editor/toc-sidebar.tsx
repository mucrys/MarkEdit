
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronRight } from 'lucide-react';
import { AppLanguage } from '@/app/lib/settings-store';
import { translations } from '@/app/lib/translations';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocSidebarProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  language?: AppLanguage;
}

export function TocSidebar({ content, isOpen, onClose, onSelect, language = 'zh' }: TocSidebarProps) {
  const t = translations[language];
  
  const headings = useMemo(() => {
    const lines = content.split('\n');
    const items: TocItem[] = [];
    
    lines.forEach(line => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
          
        items.push({ id, text, level });
      }
    });
    
    return items;
  }, [content]);

  return (
    <div className={cn(
      "fixed md:relative top-0 right-0 h-full bg-background border-l shadow-2xl md:shadow-none transition-all duration-300 z-50 overflow-hidden flex flex-col",
      isOpen ? "w-[280px]" : "w-0 border-l-0"
    )}>
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
          {t.toc}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {headings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 text-xs italic text-center p-8">
            {t.noToc}
          </div>
        ) : (
          <nav className="space-y-1">
            {headings.map((heading, index) => (
              <button
                key={`${heading.id}-${index}`}
                onClick={() => onSelect(heading.id)}
                className={cn(
                  "w-full text-left py-2 px-3 rounded-lg text-sm transition-all flex items-start gap-2 group hover:bg-primary/5 hover:text-primary",
                  heading.level === 1 && "font-bold",
                  heading.level === 2 && "pl-6",
                  heading.level >= 3 && "pl-9 text-xs"
                )}
              >
                <ChevronRight className={cn(
                  "w-3 h-3 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  heading.level >= 2 && "w-2.5 h-2.5"
                )} />
                <span className="truncate">{heading.text}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
