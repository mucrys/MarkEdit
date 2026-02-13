
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkViewer } from './mark-viewer';
import { MarkDoc, documentStore } from '@/app/lib/document-store';
import { 
  Eye, 
  Edit3, 
  Save, 
  Sparkles, 
  Download, 
  ChevronLeft, 
  PanelLeft,
  Trash2,
  Columns,
  Maximize2
} from 'lucide-react';
import { rephraseSelectedMarkdownText } from '@/ai/flows/rephrase-selected-markdown-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MarkEditorMainProps {
  doc: MarkDoc;
  onUpdate: () => void;
  onBack?: () => void;
  onDelete?: () => void;
}

type EditorMode = 'edit' | 'preview' | 'live';

export function MarkEditorMain({ doc, onUpdate, onBack, onDelete }: MarkEditorMainProps) {
  const [mode, setMode] = useState<EditorMode>('live');
  const [content, setContent] = useState(doc.content);
  const [title, setTitle] = useState(doc.title);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setContent(doc.content);
    setTitle(doc.title);
  }, [doc]);

  const handleSave = () => {
    documentStore.save({ ...doc, title, content });
    toast({ title: 'Saved', description: 'Document updated successfully.' });
    onUpdate();
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAIRephrase = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      toast({ 
        title: 'No Selection', 
        description: 'Please select some text to rephrase.',
        variant: 'destructive'
      });
      return;
    }

    setIsRephrasing(true);
    try {
      const result = await rephraseSelectedMarkdownText({ text: selectedText });
      const newContent = content.substring(0, start) + result.rephrasedText + content.substring(end);
      setContent(newContent);
      toast({ title: 'Rephrased', description: 'AI successfully rephrased the selected text.' });
    } catch (error) {
      toast({ title: 'Error', description: 'AI rephrasing failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsRephrasing(false);
    }
  };

  // Sync scrolling logic
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (mode !== 'live' || !previewRef.current || !textareaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const ratio = scrollTop / (scrollHeight - clientHeight);
    const preview = previewRef.current;
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30 h-14">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-bold text-lg focus:outline-none border-b-2 border-transparent focus:border-primary px-1 transition-all"
            placeholder="Untitled Doc"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <div className="bg-muted p-1 rounded-lg flex gap-1 mr-2">
            <Button 
              variant={mode === 'edit' ? 'white' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('edit')}
              className={cn("h-7 px-3 text-xs", mode === 'edit' && "bg-white shadow-sm")}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button 
              variant={mode === 'live' ? 'white' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('live')}
              className={cn("h-7 px-3 text-xs", mode === 'live' && "bg-white shadow-sm")}
            >
              <Columns className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Live</span>
            </Button>
            <Button 
              variant={mode === 'preview' ? 'white' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('preview')}
              className={cn("h-7 px-3 text-xs", mode === 'preview' && "bg-white shadow-sm")}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </div>

          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={handleSave} title="Save" className="text-primary">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleExport} title="Export">
            <Download className="w-4 h-4" />
          </Button>
          {onDelete && (
             <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
               <Trash2 className="w-4 h-4" />
             </Button>
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className={cn(
          "h-full grid transition-all duration-500 ease-in-out",
          mode === 'live' ? "grid-cols-2" : "grid-cols-1"
        )}>
          {/* Editor Pane */}
          <div className={cn(
            "h-full overflow-hidden flex flex-col transition-all duration-300",
            mode === 'preview' ? "hidden" : "block",
            mode === 'edit' ? "col-span-1" : ""
          )}>
            <div className="flex-1 flex flex-col p-4 md:p-6 bg-white">
              <div className="flex justify-end mb-4">
                 <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAIRephrase} 
                  disabled={isRephrasing}
                  className="bg-accent/10 border-accent/30 text-accent-foreground hover:bg-accent/20 rounded-full h-8"
                >
                  <Sparkles className={cn("w-3.5 h-3.5 mr-2", isRephrasing && "animate-pulse")} />
                  AI Rephrase
                </Button>
              </div>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onScroll={handleScroll}
                placeholder="Start writing in Markdown..."
                className="flex-1 resize-none font-code text-base p-6 leading-relaxed border-none focus-visible:ring-0 shadow-none bg-transparent rounded-none"
              />
            </div>
          </div>

          {/* Preview Pane */}
          <div className={cn(
            "h-full overflow-hidden bg-muted/20 transition-all duration-300",
            mode === 'edit' ? "hidden" : "block",
            mode === 'preview' ? "col-span-1" : "border-l"
          )}>
            <div className="h-full overflow-y-auto p-4 md:p-6 scroll-smooth">
               <MarkViewer content={content} forwardedRef={previewRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status */}
      <footer className="px-4 py-1.5 text-[10px] text-muted-foreground bg-white border-t flex justify-between uppercase tracking-widest font-medium">
        <div className="flex gap-4">
          <span>{content.length} characters</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>Cloud Sync Enabled</span>
        </div>
      </footer>
    </div>
  );
}
