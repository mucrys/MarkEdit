'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkViewer } from './mark-viewer';
import { MarkDoc, documentStore } from '@/app/lib/document-store';
import { AppSettings } from '@/app/lib/settings-store';
import { translations } from '@/app/lib/translations';
import { 
  Eye, 
  Edit3, 
  Save, 
  Sparkles, 
  Trash2,
  Columns,
  ListTree,
  Printer
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { rephraseSelectedMarkdownText } from '@/ai/flows/rephrase-selected-markdown-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { TocSidebar } from './toc-sidebar';

interface MarkEditorMainProps {
  doc: MarkDoc;
  onUpdate: () => void;
  onDelete?: () => void;
  settings: AppSettings;
}

type EditorMode = 'edit' | 'preview' | 'live';

export function MarkEditorMain({ doc, onUpdate, onDelete, settings }: MarkEditorMainProps) {
  const [mode, setMode] = useState<EditorMode>('live');
  const [content, setContent] = useState(doc.content);
  const [title, setTitle] = useState(doc.title);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const t = translations[settings.language];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setContent(doc.content);
    setTitle(doc.title);
  }, [doc.id, doc.content, doc.title]);

  const handleSave = () => {
    documentStore.save({ ...doc, title, content });
    toast({ title: t.saved, description: t.saveDesc });
    onUpdate();
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleAIRephrase = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      toast({ title: t.rephraseDesc, description: t.rephraseDesc, variant: 'destructive' });
      return;
    }

    setIsRephrasing(true);
    try {
      const result = await rephraseSelectedMarkdownText({ text: selectedText });
      const newContent = content.substring(0, start) + result.rephrasedText + content.substring(end);
      setContent(newContent);
      documentStore.save({ ...doc, title, content: newContent });
      onUpdate();
      toast({ title: t.aiSuccess, description: t.aiSuccess });
    } catch (error) {
      toast({ title: t.aiError, description: t.aiError, variant: 'destructive' });
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (mode !== 'live' || !previewRef.current || !textareaRef.current || isMobile) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const ratio = scrollTop / (scrollHeight - clientHeight);
    const preview = previewRef.current;
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
  };

  const actualIsMobile = mounted && isMobile;
  const showEditor = mode === 'edit' || (mode === 'live' && !actualIsMobile);
  const showPreview = mode === 'preview' || (mode === 'live');

  const scrollToHeading = (id: string) => {
    const container = previewRef.current;
    if (!container) return;

    const target = 
      container.querySelector(`[id="${id}"]`) || 
      container.querySelector(`[id="user-content-${id}"]`);

    if (target) {
      const rect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollOffset = rect.top - containerRect.top + container.scrollTop;
      
      container.scrollTo({
        top: scrollOffset - 20,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden safe-top safe-bottom relative">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30 h-14 shrink-0 print:hidden">
        <div className="flex items-center gap-1 md:gap-2 overflow-hidden">
          <SidebarTrigger className="mr-1" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-bold text-base md:text-lg focus:outline-none border-b-2 border-transparent focus:border-primary px-1 transition-all flex-1 min-w-0"
            placeholder={t.untitled}
          />
        </div>

        <div className="flex items-center gap-1">
          <div className="bg-muted p-1 rounded-lg flex gap-0.5">
            <Button 
              variant={mode === 'edit' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('edit')}
              className={cn("h-8 px-3 text-xs", mode === 'edit' && "bg-background shadow-sm")}
            >
              <Edit3 className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">{t.edit}</span>
            </Button>
            <Button 
              variant={mode === 'live' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('live')}
              className={cn("h-8 px-3 text-xs", mode === 'live' && "bg-background shadow-sm")}
            >
              <Columns className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">{t.live}</span>
            </Button>
            <Button 
              variant={mode === 'preview' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('preview')}
              className={cn("h-8 px-3 text-xs", mode === 'preview' && "bg-background shadow-sm")}
            >
              <Eye className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">{t.preview}</span>
            </Button>
          </div>

          <div className="hidden md:block w-px h-4 bg-border mx-1" />
          
          <Button 
            variant={showToc ? "secondary" : "ghost"} 
            size="icon" 
            onClick={() => setShowToc(!showToc)}
            className={cn("w-9 h-9", showToc && "text-primary bg-primary/5")}
            title={t.toc}
          >
            <ListTree className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleExportPdf} className="w-9 h-9" title={t.exportPdf}>
            <Printer className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleSave} className="text-primary w-9 h-9" title={t.save}>
            <Save className="w-4 h-4" />
          </Button>
          
          {onDelete && (
             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="text-destructive w-9 h-9">
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader>
                   <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                   <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                   <AlertDialogAction onClick={onDelete} className="bg-destructive text-white hover:bg-destructive/90">{t.confirm}</AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <div className={cn(
          "flex-1 h-full grid",
          showEditor && showPreview && !actualIsMobile ? "grid-cols-2" : "grid-cols-1"
        )}>
          <div className={cn(
            "h-full flex flex-col bg-background overflow-hidden print:hidden",
            !showEditor && "hidden",
            showPreview && !actualIsMobile && "border-r"
          )}>
            <div className="shrink-0 flex justify-end p-2 border-b bg-muted/5">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAIRephrase} 
                disabled={isRephrasing}
                className="bg-accent/10 border-accent/30 text-accent-foreground rounded-full h-8"
              >
                <Sparkles className={cn("w-3.5 h-3.5 mr-2", isRephrasing && "animate-pulse")} />
                {isRephrasing ? t.rephrasing : t.aiRephrase}
              </Button>
            </div>
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onScroll={handleScroll}
                placeholder={t.startWriting}
                style={{ fontSize: `${settings.fontSize}px` }}
                className="absolute inset-0 w-full h-full resize-none font-code p-6 md:p-10 leading-relaxed border-none focus-visible:ring-0 shadow-none bg-transparent"
              />
            </div>
          </div>

          <div className={cn(
            "h-full bg-background overflow-hidden",
            !showPreview && "hidden print:block",
            mode === 'live' && actualIsMobile && "hidden"
          )}>
            <MarkViewer content={content} forwardedRef={previewRef} theme={settings.theme} />
          </div>
        </div>

        <TocSidebar 
          content={content} 
          isOpen={showToc} 
          onClose={() => setShowToc(false)}
          language={settings.language}
          onSelect={scrollToHeading}
        />
      </main>

      <footer className="px-4 py-1.5 text-[10px] text-muted-foreground bg-background border-t flex justify-between uppercase tracking-widest font-medium shrink-0 safe-bottom print:hidden">
        <div className="flex gap-4">
          <span>{content.length} {t.characters}</span>
          <span>{content.split(/\s+/).filter(Boolean).length} {t.words}</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>{t.storageReady}</span>
        </div>
      </footer>
    </div>
  );
}