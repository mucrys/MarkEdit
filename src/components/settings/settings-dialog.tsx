
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { AppSettings, AppLanguage, AppTheme } from '@/app/lib/settings-store';
import { translations } from '@/app/lib/translations';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: SettingsDialogProps) {
  const t = translations[settings.language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t.settings}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>{t.language}</Label>
            <Select 
              value={settings.language} 
              onValueChange={(v: AppLanguage) => onSave({ ...settings, language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">简体中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{t.theme}</Label>
            <Select 
              value={settings.theme} 
              onValueChange={(v: AppTheme) => onSave({ ...settings, theme: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t.themeLight}</SelectItem>
                <SelectItem value="dark">{t.themeDark}</SelectItem>
                <SelectItem value="system">{t.themeSystem}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label>{t.fontSize}</Label>
              <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider 
              value={[settings.fontSize]} 
              min={12} 
              max={24} 
              step={1}
              onValueChange={([v]) => onSave({ ...settings, fontSize: v })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
