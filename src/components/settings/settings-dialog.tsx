
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSettings, AppLanguage, AppTheme } from '@/app/lib/settings-store';
import { translations } from '@/app/lib/translations';
import { Info, Settings2, Github, User } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: SettingsDialogProps) {
  const t = translations[settings.language];
  const appLogo = PlaceHolderImages.find(img => img.id === 'app-logo');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            {t.settings}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="preferences" className="w-full">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-semibold"
              >
                {t.preferences}
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-semibold"
              >
                {t.about}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="preferences" className="mt-0 space-y-6">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">{t.language}</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(v: AppLanguage) => onSave({ ...settings, language: v })}
                >
                  <SelectTrigger className="bg-muted/50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">简体中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-semibold">{t.theme}</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(v: AppTheme) => onSave({ ...settings, theme: v })}
                >
                  <SelectTrigger className="bg-muted/50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t.themeLight}</SelectItem>
                    <SelectItem value="dark">{t.themeDark}</SelectItem>
                    <SelectItem value="system">{t.themeSystem}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">{t.fontSize}</Label>
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{settings.fontSize}px</span>
                </div>
                <Slider 
                  value={[settings.fontSize]} 
                  min={12} 
                  max={24} 
                  step={1}
                  onValueChange={([v]) => onSave({ ...settings, fontSize: v })}
                  className="py-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-0 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-20 h-20">
                  {appLogo ? (
                    <Image 
                      src={appLogo.imageUrl} 
                      alt="Logo" 
                      fill 
                      className="object-cover rounded-2xl shadow-lg border-2 border-primary/10"
                      data-ai-hint={appLogo.imageHint}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold">M</div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">{t.appName}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{t.version} 1.0.0</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px]">
                  {t.appDescription}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{t.author}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">PCHDC</span>
                </div>
              </div>

              <p className="text-[10px] text-center text-muted-foreground/50 pt-4 uppercase tracking-tighter">
                &copy; {new Date().getFullYear()} MarkEdit - All Rights Reserved
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
