
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
  Trash2
} from 'lucide-react';
import { rephraseSelectedMarkdownText } from '@/ai/flows/rephrase-selected-markdown-text';
import { useToast } from '@/hooks/use-toast';

interface MarkEditorMainProps {
  doc: MarkDoc;
  onUpdate: () => void;
  onBack?: () => void;
  onDelete?: () => void;
}

export function MarkEditorMain({ doc, onUpdate, onBack, onDelete }: MarkEditorMainProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [content, setContent] = useState(doc.content);
  const [title, setTitle] = useState(doc.title);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-semibold text-lg focus:outline-none border-b border-transparent focus:border-primary px-1 max-w-[150px] md:max-w-none"
            placeholder="Untitled Doc"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant={mode === 'edit' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('edit')}
            className="gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button 
            variant={mode === 'preview' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('preview')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={handleSave} title="Save">
            <Save className="w-4 h-4 text-primary" />
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
        <div className="h-full flex">
          {/* Editor Pane */}
          <div className={`flex-1 h-full overflow-y-auto p-4 transition-all duration-300 ${mode === 'edit' ? 'block' : 'hidden md:block'}`}>
            <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
              <div className="flex justify-end gap-2">
                 <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAIRephrase} 
                  disabled={isRephrasing}
                  className="bg-accent/10 border-accent/30 text-accent-foreground hover:bg-accent/20"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${isRephrasing ? 'animate-pulse' : ''}`} />
                  AI Rephrase Selection
                </Button>
              </div>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing in Markdown..."
                className="flex-1 resize-none font-code text-base p-6 leading-relaxed border-none focus-visible:ring-0 shadow-none bg-white rounded-xl"
              />
            </div>
          </div>

          {/* Preview Pane */}
          <div className={`flex-1 h-full overflow-y-auto p-4 transition-all duration-300 bg-background/50 border-l ${mode === 'preview' ? 'block' : 'hidden md:block'}`}>
            <MarkViewer content={content} />
          </div>
        </div>
      </main>

      {/* Footer / Status */}
      <footer className="px-4 py-1 text-[10px] text-muted-foreground bg-white border-t flex justify-between uppercase tracking-wider">
        <span>{content.length} characters • {content.split(/\s+/).filter(Boolean).length} words</span>
        <span>MarkEdit iOS v1.0</span>
      </footer>
    </div>
  );
}
