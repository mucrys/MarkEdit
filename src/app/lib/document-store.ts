
export interface MarkDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'markedit_documents';

export const documentStore = {
  getAll: (): MarkDoc[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
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

  create: (title: string = 'Untitled'): MarkDoc => {
    const newDoc: MarkDoc = {
      id: crypto.randomUUID(),
      title,
      content: '# New Document\n\nStart writing here...',
      updatedAt: Date.now(),
    };
    documentStore.save(newDoc);
    return newDoc;
  }
};
