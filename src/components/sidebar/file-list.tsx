'use client';

import React from 'react';
import { MarkDoc } from '@/app/lib/document-store';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface FileListProps {
  documents: MarkDoc[];
  activeId?: string;
  onSelect: (doc: MarkDoc) => void;
  onNew: () => void;
}

export function FileList({ documents, activeId, onSelect, onNew }: FileListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDocs = documents
    .filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline text-primary">Documents</h2>
          <Button size="icon" onClick={onNew} className="rounded-full w-9 h-9 shadow-md">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search docs..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-20 md:pb-4 space-y-1">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/40 text-sm">
            <FileText className="w-10 h-10 mb-2 opacity-20" />
            <p>No documents</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelect(doc)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all group flex flex-col gap-1.5 relative overflow-hidden active:scale-[0.98]",
                activeId === doc.id 
                  ? "bg-primary text-primary-foreground shadow-lg scale-[1.02] z-10" 
                  : "hover:bg-accent/10 hover:text-primary"
              )}
            >
              <span className="font-bold text-sm truncate pr-4">{doc.title}</span>
              <div className="flex items-center gap-3 opacity-70 text-[10px] font-medium">
                 <span className="flex items-center gap-1">
                   <Clock className="w-3 h-3" />
                   {formatDistanceToNow(doc.updatedAt)} ago
                 </span>
                 <span className="flex items-center gap-1">
                   <FileText className="w-3 h-3" />
                   {doc.content.length} chars
                 </span>
              </div>
              {activeId === doc.id && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-glow animate-pulse" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
