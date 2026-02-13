
'use client';

import React from 'react';
import { MarkDoc, documentStore } from '@/app/lib/document-store';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Search, Clock, Calendar } from 'lucide-react';
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
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline text-primary">MarkEdit</h2>
          <Button size="icon" onClick={onNew} className="rounded-full w-8 h-8 shadow-md">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search documents..."
            className="w-full pl-8 pr-4 py-2 text-sm bg-muted/50 border-none rounded-lg focus:ring-1 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm opacity-50">
            <FileText className="w-10 h-10 mb-2" />
            <p>No documents found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelect(doc)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group flex flex-col gap-1",
                  activeId === doc.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-accent/10 hover:text-primary"
                )}
              >
                <span className="font-semibold text-sm truncate">{doc.title}</span>
                <div className="flex items-center gap-3 opacity-70 text-[10px]">
                   <span className="flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     {formatDistanceToNow(doc.updatedAt)} ago
                   </span>
                   <span className="flex items-center gap-1">
                     <FileText className="w-3 h-3" />
                     {doc.content.length} chars
                   </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
