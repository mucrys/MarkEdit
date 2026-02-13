
export interface MarkDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'markedit_documents';

// 使用数组 Join 方式定义，彻底避免模板字符串中反引号转义带来的解析错误
const TEST_MARKDOWN = [
  "# MarkEdit 全生态功能测试",
  "",
  "[TOC]",
  "",
  "## 1. 数学公式 (LaTeX)",
  "这是行内公式：$E = mc^2$。",
  "",
  "下面是一个复杂的块级公式：",
  "$$\\int_{a}^{b} x^2 dx = \\frac{1}{3}(b^3 - a^3)$$",
  "",
  "## 2. 流程图 (Mermaid)",
  "支持无缝嵌入的 Mermaid 图表：",
  "```mermaid",
  "graph TD",
  "    A[开始撰写] --> B{开启 Live 模式?}",
  "    B -- 是 --> C[左侧编辑, 右侧即时预览]",
  "    B -- 否 --> D[专注模式]",
  "    C --> E[导出 .md 文件]",
  "    D --> E",
  "```",
  "",
  "## 3. 代码高亮",
  "```typescript",
  "function welcome() {",
  "  console.log(\"欢迎使用 MarkEdit，全生态 Markdown 协作利器！\");",
  "}",
  "```",
  "",
  "## 4. 任务列表",
  "- [x] 集成 Mermaid 流程图",
  "- [x] 支持 LaTeX 数学公式",
  "- [ ] 开发 Android/HarmonyOS 原生外壳",
  "- [ ] 实现多端同步",
  "",
  "## 5. 其他高级语法",
  "这是一个脚注引用[^1]。我们可以加点表情：:rocket: :heart: :fire:",
  "",
  "| 功能 | 状态 | 优先级 |",
  "| :--- | :---: | ---: |",
  "| 实时预览 | 完美 | 关键 |",
  "| AI 润色 | 已集成 | 高 |",
  "",
  "[^1]: 这是脚注的具体内容，会自动美化显示在底部。"
].join('\n');

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

  create: (title: string = '新文档'): MarkDoc => {
    const newDoc: MarkDoc = {
      id: crypto.randomUUID(),
      title,
      content: TEST_MARKDOWN,
      updatedAt: Date.now(),
    };
    documentStore.save(newDoc);
    return newDoc;
  }
};
