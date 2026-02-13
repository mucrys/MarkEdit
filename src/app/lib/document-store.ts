export interface MarkDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'markedit_documents';

const WELCOME_MD = [
  "# 欢迎使用 MarkEdit",
  "",
  "这是一份演示文档，您可以自由编辑或删除它。",
  "",
  "## 主要功能",
  "- **实时预览**：左侧编辑，右侧即时查看效果。",
  "- **AI 润色**：选中一段文字，点击工具栏顶部的 AI 图标即可优化文案。",
  "- **数学公式**：支持 LaTeX，例如 $E=mc^2$。",
  "- **流程图**：支持 Mermaid 图表。",
  "- **多端适配**：支持 iOS/Android PWA 模式全屏使用。",
  "",
  "## 快速开始",
  "点击左侧边栏的 **+** 按钮即可创建一个全新的空白文档。",
  "",
  "```mermaid",
  "graph LR",
  "  A[灵感] --> B(记录)",
  "  B --> C{AI 润色}",
  "  C --> D[完美作品]",
  "```"
].join('\n');

export const documentStore = {
  getAll: (): MarkDoc[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored === null) {
      const initialDoc: MarkDoc = {
        id: crypto.randomUUID(),
        title: '欢迎使用 MarkEdit',
        content: WELCOME_MD,
        updatedAt: Date.now(),
      };
      const initialDocs = [initialDoc];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDocs));
      return initialDocs;
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse documents', e);
      return [];
    }
  },

  save: (doc: MarkDoc) => {
    const docs = documentStore.getAll();
    const existingIndex = docs.findIndex((d) => d.id === doc.id);
    if (existingIndex > -1) {
      docs[existingIndex] = { ...doc, updatedAt: Date.now() };
    } else {
      docs.push({ ...doc, updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  },

  delete: (id: string) => {
    const docs = documentStore.getAll();
    const filtered = docs.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  create: (title: string = '新文档', content: string = ''): MarkDoc => {
    const newDoc: MarkDoc = {
      id: crypto.randomUUID(),
      title,
      content,
      updatedAt: Date.now(),
    };
    documentStore.save(newDoc);
    return newDoc;
  }
};
