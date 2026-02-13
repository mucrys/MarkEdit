
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MarkDoc, documentStore } from '@/app/lib/document-store';
import { settingsStore, AppSettings } from '@/app/lib/settings-store';
import { translations } from '@/app/lib/translations';
import { FileList } from '@/components/sidebar/file-list';
import { MarkEditorMain } from '@/components/editor/mark-editor-main';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { Toaster } from '@/components/ui/toaster';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger, 
  SidebarHeader,
  SidebarFooter,
  SidebarInset
} from '@/components/ui/sidebar';
import { Import, FilePlus, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MarkEditApp() {
  const [documents, setDocuments] = useState<MarkDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<MarkDoc | null>(null);
  const [settings, setSettings] = useState<AppSettings>(settingsStore.get());
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const t = translations[settings.language];
  const welcomeHero = PlaceHolderImages.find(img => img.id === 'welcome-hero');

  useEffect(() => {
    const docs = documentStore.getAll();
    setDocuments(docs);
    if (docs.length > 0 && !activeDoc) {
      setActiveDoc(docs[0]);
    }
    settingsStore.applyTheme(settings.theme);
    setIsLoaded(true);
  }, []);

  const refreshDocs = () => {
    const docs = documentStore.getAll();
    setDocuments(docs);
    if (activeDoc) {
      const updated = docs.find(d => d.id === activeDoc.id);
      if (updated) {
        setActiveDoc({ ...updated });
      }
    }
  };

  const handleNewDoc = () => {
    const newDoc = documentStore.create(t.untitled, '');
    setDocuments(documentStore.getAll());
    setActiveDoc({ ...newDoc });
  };

  const handleDeleteDoc = () => {
    if (!activeDoc) return;
    documentStore.delete(activeDoc.id);
    const docs = documentStore.getAll();
    setDocuments(docs);
    setActiveDoc(docs.length > 0 ? { ...docs[0] } : null);
    toast({ title: t.deleteSuccess, description: t.deleteSuccessDesc });
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
      
      const importedDoc = documentStore.create(title, content);
      const allDocs = documentStore.getAll();
      setDocuments(allDocs);
      setActiveDoc({ ...importedDoc });
      
      toast({ title: t.importSuccess, description: `${t.importDesc}: ${file.name}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    settingsStore.save(newSettings);
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
          <SidebarHeader className="border-b bg-sidebar p-4">
             <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-2 text-xl tracking-tight">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm shadow-md shadow-primary/20">M</div>
                  {t.appName}
                </span>
                <Button variant="ghost" size="icon" onClick={handleImportTrigger} title={t.import}>
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
              language={settings.language}
            />
          </SidebarContent>
          <SidebarFooter className="border-t p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2" 
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
              {t.settings}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col h-full overflow-hidden bg-background">
          <div className="flex-1 overflow-hidden">
            {activeDoc ? (
              <MarkEditorMain 
                doc={activeDoc} 
                onUpdate={refreshDocs} 
                onDelete={handleDeleteDoc}
                settings={settings}
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
                          {t.heroTitle}
                        </h1>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg">
                          {t.heroDesc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 justify-center pt-4">
                          <Button onClick={handleNewDoc} size="lg" className="shadow-xl px-8 rounded-full h-14 text-base font-semibold transition-all hover:scale-105 active:scale-95">
                            <FilePlus className="mr-2 h-5 w-5" />
                            {t.newDoc}
                          </Button>
                          <Button variant="outline" size="lg" onClick={handleImportTrigger} className="px-8 rounded-full h-14 text-base bg-white shadow-sm transition-all hover:bg-muted/50">
                            <Import className="mr-2 h-5 w-5" />
                            {t.import}
                          </Button>
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

        <SettingsDialog 
          open={showSettings} 
          onOpenChange={setShowSettings} 
          settings={settings} 
          onSave={handleUpdateSettings} 
        />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
