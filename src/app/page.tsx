'use client';

import React, { useState, useEffect } from 'react';
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
import { PanelLeft, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function MarkEditApp() {
  const [documents, setDocuments] = useState<MarkDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<MarkDoc | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="border-b bg-white p-4">
             <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-primary flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">M</div>
                  MarkEdit
                </span>
                <label className="cursor-pointer">
                  <Import className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" title="Import" />
                  <input type="file" accept=".md" className="hidden" onChange={handleImport} />
                </label>
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
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                 <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-4">
                    <PanelLeft className="w-12 h-12" />
                 </div>
                 <h1 className="text-3xl font-bold font-headline">Welcome to MarkEdit</h1>
                 <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                   The minimalist cross-platform Markdown editor. Seamless writing experience across Android, HarmonyOS, iOS, and Desktop.
                 </p>
                 <div className="flex gap-4">
                    <Button onClick={handleNewDoc} className="shadow-lg px-8">Create New</Button>
                    <label className="cursor-pointer">
                      <Button variant="outline">Import .md</Button>
                      <input type="file" accept=".md" className="hidden" onChange={handleImport} />
                    </label>
                 </div>
              </div>
            )}
          </div>
          
          <div className="fixed bottom-6 left-6 md:hidden z-50">
             <SidebarTrigger className="w-12 h-12 bg-primary text-white rounded-full shadow-2xl hover:bg-primary/90 flex items-center justify-center">
                <PanelLeft className="w-6 h-6" />
             </SidebarTrigger>
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
