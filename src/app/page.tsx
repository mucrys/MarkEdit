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
import { PanelLeft, Import, FilePlus, Sparkles, Smartphone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MarkEditApp() {
  const [documents, setDocuments] = useState<MarkDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<MarkDoc | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const welcomeHero = PlaceHolderImages.find(img => img.id === 'welcome-hero');

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
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
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
                <span className="font-bold text-primary flex items-center gap-2 text-xl tracking-tight">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm shadow-md shadow-primary/20">M</div>
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
              <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-muted/5 overflow-y-auto">
                 <div className="max-w-3xl w-full space-y-12 py-12">
                   <div className="space-y-6">
                      <div className="relative inline-block">
                        {welcomeHero ? (
                          <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-6">
                            <Image 
                              src={welcomeHero.imageUrl} 
                              alt="Welcome" 
                              fill 
                              className="object-cover rounded-3xl shadow-2xl animate-in zoom-in duration-700"
                              data-ai-hint={welcomeHero.imageHint}
                            />
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl shadow-lg flex items-center justify-center text-white">
                               <Sparkles className="w-6 h-6 animate-pulse" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                            <FilePlus className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                          Your Ideas, Anywhere.
                        </h1>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg">
                          Professional Markdown editor designed for all ecosystems: Android, HarmonyOS, iOS, and Desktop.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 justify-center pt-4">
                          <Button onClick={handleNewDoc} size="lg" className="shadow-xl px-8 rounded-full h-14 text-base font-semibold transition-all hover:scale-105 active:scale-95">
                            <FilePlus className="mr-2 h-5 w-5" />
                            Create New Document
                          </Button>
                          <Button variant="outline" size="lg" onClick={handleImportTrigger} className="px-8 rounded-full h-14 text-base bg-white shadow-sm transition-all hover:bg-muted/50">
                            <Import className="mr-2 h-5 w-5" />
                            Import .md File
                          </Button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                      <div className="p-6 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-md group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Cross-Platform</h3>
                        <p className="text-sm text-muted-foreground">Seamless experience on iPad, iPhone, and Android devices.</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-md group">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">AI-Powered</h3>
                        <p className="text-sm text-muted-foreground">Improve your writing with real-time AI rephrasing assistance.</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-md group">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
                          <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Web Standard</h3>
                        <p className="text-sm text-muted-foreground">Built on Next.js for maximum performance and reliability.</p>
                      </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
          
          <div className="fixed bottom-6 left-6 md:hidden z-50">
             <SidebarTrigger className="w-12 h-12 bg-primary text-white rounded-full shadow-2xl hover:bg-primary/90 flex items-center justify-center transition-transform active:scale-95 border-none" />
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
