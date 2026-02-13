
export interface MarkDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'markedit_documents';

const TEST_MARKDOWN = `# MarkEdit 功能测试报告

[TOC]

## 1. 数学公式 (LaTeX)
这是行内公式：$E = mc^2$。

下面是一个复杂的块级公式，展示了微积分的魅力：
$$\\int_{a}^{b} x^2 dx = \\frac{1}{3}(b^3 - a^3)$$

## 2. 流程图 (Mermaid)
不需要任何背景，无缝嵌入正文：
\`\`\`mermaid
graph TD
    A[开始撰写] --> B{开启 Live 模式?}
    B -- 是 --> C[左侧编辑, 右侧即时预览]
    B -- 否 --> D[专注模式]
    C --> E[导出 .md 文件]
    D --> E
\`\`\`

## 3. 任务列表 (可交互)
在预览模式下直接点击试试：
- [x] 集成 Mermaid 流程图
- [x] 支持 LaTeX 数学公式
- [x] 自动生成文档目录 (TOC)
- [ ] 开发移动端 Android/HarmonyOS 原生壳
- [ ] 接入 Firebase 实现多端同步

## 4. 专业表格
| 功能模块 | 适配状态 | 优先级 |
| :--- | :---: | ---: |
| 实时预览 | 完美适配 | 关键 |
| AI 润色 | 已集成 | 高 |
| 跨平台布局 | 已优化 | 高 |
| 云端同步 | 待开发 | 中 |

## 5. 脚注与表情
这是一个脚注引用[^1]，它会自动跳转到页面底部。
让我们加点色彩：:rocket: :heart: :fire: :checkered_flag: :sparkles:

## 6. 代码高亮
\`\`\`typescript
function welcome() {
  console.log("欢迎使用 MarkEdit，全生态 Markdown 协作利器！");
}
\`\`\`

[^1]: 这是脚注的具体内容，MarkEdit 会自动将其收集并美化显示。`;

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

  create: (title: string = '功能测试报告'): MarkDoc => {
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
