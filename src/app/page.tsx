'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MarkDoc, documentStore } from '@/app/lib/document-store';
import { FileList } from '@/components/sidebar/file-list';
import { MarkEditorMain } from '@/components/editor/mark-editor-main';
import { Toaster } from '@/components/ui/toaster';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger, 
  SidebarHeader,
  SidebarInset
} from '@/components/ui/sidebar';
import { PanelLeft, Import, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function MarkEditApp() {
  const [documents, setDocuments] = useState<MarkDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<MarkDoc | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const docs = documentStore.getAll();
    setDocuments(docs);
    if (docs.length > 0 && !activeDoc) {
      setActiveDoc(docs[0]);
    }
    setIsLoaded(true);
  }, []);

  const refreshDocs = () => {
    const docs = documentStore.getAll();
    setDocuments(docs);
    if (activeDoc) {
      const updated = docs.find(d => d.id === activeDoc.id);
      if (updated) setActiveDoc(updated);
    }
  };

  const handleNewDoc = () => {
    const newDoc = documentStore.create();
    setDocuments(documentStore.getAll());
    setActiveDoc(newDoc);
  };

  const handleDeleteDoc = () => {
    if (!activeDoc) return;
    documentStore.delete(activeDoc.id);
    const docs = documentStore.getAll();
    setDocuments(docs);
    setActiveDoc(docs.length > 0 ? docs[0] : null);
    toast({ title: 'Deleted', description: 'Document removed.' });
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace('.md', '');
      const newDoc = documentStore.create(title);
      documentStore.save({ ...newDoc, content });
      refreshDocs();
      setActiveDoc(newDoc);
      toast({ title: 'Imported', description: `Successfully imported ${file.name}` });
      // Reset input so the same file can be imported again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Hidden File Input for Reusability */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".md" 
          className="hidden" 
          onChange={handleImport} 
        />

        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="border-b bg-white p-4">
             <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-primary flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">M</div>
                  MarkEdit
                </span>
                <Button variant="ghost" size="icon" onClick={handleImportTrigger} title="Import Markdown">
                  <Import className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
             </div>
          </SidebarHeader>
          <SidebarContent>
            <FileList 
              documents={documents} 
              activeId={activeDoc?.id} 
              onSelect={setActiveDoc} 
              onNew={handleNewDoc}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col h-full overflow-hidden bg-background">
          <div className="flex-1 overflow-hidden">
            {activeDoc ? (
              <MarkEditorMain 
                doc={activeDoc} 
                onUpdate={refreshDocs} 
                onDelete={handleDeleteDoc}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-muted/5">
                 <div className="relative">
                   <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2 animate-in zoom-in duration-500">
                      <FilePlus className="w-12 h-12" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                     <div className="w-5 h-5 bg-primary rounded-full animate-pulse" />
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <h1 className="text-4xl font-extrabold font-headline tracking-tight text-foreground">Welcome to MarkEdit</h1>
                   <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg">
                     The minimalist pro Markdown editor. A seamless writing experience across Android, HarmonyOS, iOS (iPhone/iPad), and Desktop.
                   </p>
                 </div>

                 <div className="flex flex-wrap gap-4 justify-center">
                    <Button onClick={handleNewDoc} size="lg" className="shadow-lg px-10 rounded-full h-14 text-base">
                      Create New Document
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleImportTrigger} className="px-10 rounded-full h-14 text-base bg-white">
                      Import .md File
                    </Button>
                 </div>

                 <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
                    <div className="p-4 rounded-2xl bg-white border shadow-sm">
                      <h3 className="font-bold mb-1">Universal</h3>
                      <p className="text-xs text-muted-foreground">Work anywhere, synchronized across all your devices.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border shadow-sm">
                      <h3 className="font-bold mb-1">Clean UI</h3>
                      <p className="text-xs text-muted-foreground">Focus on what matters: your thoughts and content.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border shadow-sm">
                      <h3 className="font-bold mb-1">Powerful</h3>
                      <p className="text-xs text-muted-foreground">Full GFM support with real-time AI assistance.</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
          
          <div className="fixed bottom-6 left-6 md:hidden z-50">
             <SidebarTrigger className="w-12 h-12 bg-primary text-white rounded-full shadow-2xl hover:bg-primary/90 flex items-center justify-center transition-transform active:scale-95">
                <PanelLeft className="w-6 h-6" />
             </SidebarTrigger>
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
