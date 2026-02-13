
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
  Trash2,
  Columns
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

interface MarkEditorMainProps {
  doc: MarkDoc;
  onUpdate: () => void;
  onDelete?: () => void;
}

type EditorMode = 'edit' | 'preview' | 'live';

export function MarkEditorMain({ doc, onUpdate, onDelete }: MarkEditorMainProps) {
  const [mode, setMode] = useState<EditorMode>('live');
  const [content, setContent] = useState(doc.content);
  const [title, setTitle] = useState(doc.title);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setContent(doc.content);
    setTitle(doc.title);
  }, [doc]);

  const handleSave = () => {
    documentStore.save({ ...doc, title, content });
    toast({ title: '已保存', description: '文档更新成功。' });
    onUpdate();
  };

  const handleAIRephrase = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      toast({ title: '未选择内容', description: '请选择一段文字进行润色。', variant: 'destructive' });
      return;
    }

    setIsRephrasing(true);
    try {
      const result = await rephraseSelectedMarkdownText({ text: selectedText });
      const newContent = content.substring(0, start) + result.rephrasedText + content.substring(end);
      setContent(newContent);
      documentStore.save({ ...doc, title, content: newContent });
      onUpdate();
      toast({ title: '润色成功', description: 'AI 已完成文本优化。' });
    } catch (error) {
      toast({ title: '错误', description: 'AI 润色失败，请重试。', variant: 'destructive' });
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

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden safe-top safe-bottom">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30 h-14 shrink-0">
        <div className="flex items-center gap-1 md:gap-2 overflow-hidden">
          <SidebarTrigger className="mr-1" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-bold text-base md:text-lg focus:outline-none border-b-2 border-transparent focus:border-primary px-1 transition-all flex-1 min-w-0"
            placeholder="无标题文档"
          />
        </div>

        <div className="flex items-center gap-1">
          <div className="bg-muted p-1 rounded-lg flex gap-0.5">
            <Button 
              variant={mode === 'edit' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('edit')}
              className={cn("h-8 px-3 text-xs", mode === 'edit' && "bg-white shadow-sm")}
            >
              <Edit3 className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">编辑</span>
            </Button>
            <Button 
              variant={mode === 'live' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('live')}
              className={cn("h-8 px-3 text-xs", mode === 'live' && "bg-white shadow-sm")}
            >
              <Columns className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">实时</span>
            </Button>
            <Button 
              variant={mode === 'preview' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setMode('preview')}
              className={cn("h-8 px-3 text-xs", mode === 'preview' && "bg-white shadow-sm")}
            >
              <Eye className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden md:inline">预览</span>
            </Button>
          </div>

          <div className="hidden md:block w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={handleSave} className="text-primary w-9 h-9">
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
                   <AlertDialogTitle>确认删除？</AlertDialogTitle>
                   <AlertDialogDescription>此操作不可撤销，该文档将永久从本地存储中移除。</AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel>取消</AlertDialogCancel>
                   <AlertDialogAction onClick={onDelete} className="bg-destructive text-white hover:bg-destructive/90">确认删除</AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className={cn(
          "h-full grid",
          showEditor && showPreview && !actualIsMobile ? "grid-cols-2" : "grid-cols-1"
        )}>
          {showEditor && (
            <div className={cn(
              "h-full flex flex-col bg-white overflow-hidden",
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
                  AI 润色
                </Button>
              </div>
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onScroll={handleScroll}
                  placeholder="开始写作..."
                  className="absolute inset-0 w-full h-full resize-none font-code text-[15px] p-6 md:p-10 leading-relaxed border-none focus-visible:ring-0 shadow-none bg-transparent"
                />
              </div>
            </div>
          )}

          {showPreview && (
            <div className={cn(
              "h-full overflow-hidden bg-white",
              mode === 'live' && actualIsMobile && "hidden"
            )}>
              <div className="h-full overflow-y-auto scroll-smooth">
                 <MarkViewer content={content} forwardedRef={previewRef} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-4 py-1.5 text-[10px] text-muted-foreground bg-white border-t flex justify-between uppercase tracking-widest font-medium shrink-0 safe-bottom">
        <div className="flex gap-4">
          <span>{content.length} 字符</span>
          <span>{content.split(/\s+/).filter(Boolean).length} 词</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>本地存储就绪</span>
        </div>
      </footer>
    </div>
  );
}
