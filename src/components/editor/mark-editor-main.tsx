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
  Trash2,
  Columns
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { rephraseSelectedMarkdownText } from '@/ai/flows/rephrase-selected-markdown-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (mode !== 'live' || !previewRef.current || !textareaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const ratio = scrollTop / (scrollHeight - clientHeight);
    const preview = previewRef.current;
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
  };

  const handleToggleTask = (index: number) => {
    const lines = content.split('\n');
    let taskCount = 0;
    const newLines = lines.map(line => {
      const taskMatch = line.match(/^(\s*- \[)([ xX])(\].*)/);
      if (taskMatch) {
        if (taskCount === index) {
          const newStatus = taskMatch[2] === ' ' ? 'x' : ' ';
          taskCount++;
          return `${taskMatch[1]}${newStatus}${taskMatch[3]}`;
        }
        taskCount++;
      }
      return line;
    });
    setContent(newLines.join('\n'));
    // Auto-save on task toggle
    documentStore.save({ ...doc, title, content: newLines.join('\n') });
    onUpdate();
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden safe-top safe-bottom">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30 h-14 shrink-0">
        <div className="flex items-center gap-1 md:gap-2 overflow-hidden">
          <SidebarTrigger className="mr-1" />
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-bold text-base md:text-lg focus:outline-none border-b-2 border-transparent focus:border-primary px-1 transition-all flex-1 min-w-0"
            placeholder="Untitled"
          />
        </div>

        <div className="flex items-center gap-1">
          <div className="bg-muted p-0.5 md:p-1 rounded-lg flex gap-0.5">
            <Button 
              variant={mode === 'edit' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('edit')}
              className={cn("h-8 px-2 md:px-3 text-xs", mode === 'edit' && "bg-white shadow-sm")}
            >
              <Edit3 className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Edit</span>
            </Button>
            <Button 
              variant={mode === 'live' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('live')}
              className={cn("h-8 px-2 md:px-3 text-xs", mode === 'live' && "bg-white shadow-sm")}
            >
              <Columns className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Live</span>
            </Button>
            <Button 
              variant={mode === 'preview' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('preview')}
              className={cn("h-8 px-2 md:px-3 text-xs", mode === 'preview' && "bg-white shadow-sm")}
            >
              <Eye className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">View</span>
            </Button>
          </div>

          <div className="hidden md:block w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={handleSave} title="Save" className="text-primary w-8 h-8 md:w-10 md:h-10">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleExport} title="Export" className="w-8 h-8 md:w-10 md:h-10">
            <Download className="w-4 h-4" />
          </Button>
          
          {onDelete && (
             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 md:w-10 md:h-10">
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader>
                   <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                   <AlertDialogDescription>
                     This action cannot be undone. This will permanently delete your document.
                   </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                   <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                     Delete Document
                   </AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className={cn(
          "h-full grid transition-all duration-300",
          mode === 'live' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Editor Panel */}
          <div className={cn(
            "h-full overflow-hidden flex flex-col bg-white relative",
            (mode === 'preview' || (mode === 'live' && typeof window !== 'undefined' && window.innerWidth < 768)) ? "hidden" : "flex"
          )}>
            <div className="shrink-0 flex justify-end p-2 border-b bg-muted/5">
               <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAIRephrase} 
                  disabled={isRephrasing}
                  className="bg-accent/10 border-accent/30 text-accent-foreground hover:bg-accent/20 rounded-full h-8 px-4"
                >
                  <Sparkles className={cn("w-3.5 h-3.5 mr-2", isRephrasing && "animate-pulse")} />
                  AI Rephrase
                </Button>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onScroll={handleScroll}
                placeholder="Start writing..."
                className="absolute inset-0 resize-none font-code text-base p-4 md:p-10 leading-relaxed border-none focus-visible:ring-0 shadow-none bg-transparent rounded-none h-full w-full overflow-y-auto"
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div 
            className={cn(
              "h-full overflow-hidden bg-muted/20 border-l transition-all duration-300",
              mode === 'edit' ? "hidden" : "block",
              mode === 'preview' ? "border-l-0" : "",
              (mode === 'live' && typeof window !== 'undefined' && window.innerWidth < 768) ? "hidden" : "block"
            )}
            onDoubleClick={() => mode === 'preview' && setMode('live')}
          >
            <div className="h-full overflow-y-auto scroll-smooth">
               <MarkViewer content={content} forwardedRef={previewRef} onToggleTask={handleToggleTask} />
            </div>
          </div>

          {/* Fallback for Live mode on very small screens if both hidden */}
          {mode === 'live' && typeof window !== 'undefined' && window.innerWidth < 768 && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-white">
              <Columns className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Split screen (Live mode) is optimized for larger displays. Please use Edit or View mode on this device.</p>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setMode('edit')}>Switch to Edit</Button>
                <Button variant="outline" size="sm" onClick={() => setMode('preview')}>Switch to View</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-4 py-1.5 text-[9px] md:text-[10px] text-muted-foreground bg-white border-t flex justify-between uppercase tracking-widest font-medium shrink-0 safe-bottom">
        <div className="flex gap-2 md:gap-4">
          <span>{content.length} CHARS</span>
          <span className="hidden xs:inline">{content.split(/\s+/).filter(Boolean).length} WORDS</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span>Local Persistence</span>
        </div>
      </footer>
    </div>
  );
}
