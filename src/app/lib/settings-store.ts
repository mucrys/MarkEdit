
export type AppLanguage = 'zh' | 'en';
export type AppTheme = 'light' | 'dark' | 'system';

export interface AppSettings {
  language: AppLanguage;
  theme: AppTheme;
  fontSize: number;
}

const STORAGE_KEY = 'markedit_settings';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh',
  theme: 'system',
  fontSize: 16,
};

export const settingsStore = {
  get: (): AppSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  save: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // 立即应用主题
    settingsStore.applyTheme(settings.theme);
  },

  applyTheme: (theme: AppTheme) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};
