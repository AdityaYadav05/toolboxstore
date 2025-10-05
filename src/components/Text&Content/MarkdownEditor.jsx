import { useState, useRef } from 'react';
import { FileText, Eye, Code, Download, Copy, Check, RotateCw, Bold, Italic, List, Link2, Image as ImageIcon, Heading } from 'lucide-react';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Editor

## Features
- **Bold** and *italic* text
- [Links](https://example.com)
- \`Inline code\`
- Lists and more!

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Quote
> This is a blockquote

### Table
| Feature | Status |
|---------|--------|
| Editor  | ✅     |
| Preview | ✅     |

---

Start editing to see your changes in real-time!`);
  
  const [viewMode, setViewMode] = useState('split');
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null);
  const textareaRef = useRef(null);

  const parseMarkdown = (text) => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 hover:text-indigo-800 underline">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-md my-4" />');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50 text-gray-700 italic">$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-t-2 border-gray-300" />');

    // Unordered lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-6">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-4">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6">$1</li>');

    // Tables
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
      const isSeparator = cells.every(cell => /^[-:]+$/.test(cell));
      
      if (isSeparator) {
        return '';
      }
      
      const cellElements = cells.map(cell => `<td class="border border-gray-300 px-4 py-2">${cell}</td>`).join('');
      return `<tr>${cellElements}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>)/s, '<table class="w-full my-4 border-collapse">$1</table>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br /><br />');
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    link.click();
    URL.revokeObjectURL(url);
    
    setDownloadFormat('md');
    setTimeout(() => setDownloadFormat(null), 2000);
  };

  const downloadHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; }
    code { background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background-color: #1a1a1a; color: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 16px; margin-left: 0; background-color: #eef2ff; padding: 8px 16px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
  </style>
</head>
<body>
${parseMarkdown(markdown)}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
    URL.revokeObjectURL(url);
    
    setDownloadFormat('html');
    setTimeout(() => setDownloadFormat(null), 2000);
  };

  const resetMarkdown = () => {
    setMarkdown(`# Welcome to Markdown Editor

Start writing your markdown here...`);
  };

  const templates = [
    {
      name: 'Blog Post',
      content: `# Blog Post Title

**Author:** Your Name  
**Date:** ${new Date().toLocaleDateString()}

## Introduction

Write your introduction here...

## Main Content

### Section 1

Your content goes here.

### Section 2

More content...

## Conclusion

Wrap up your thoughts...

---

*Tags: #markdown #blog #writing*`
    },
    {
      name: 'README',
      content: `# Project Name

## Description

A brief description of your project.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
import { feature } from 'project-name';
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Contributing

Contributions are welcome!

## License

MIT License`
    },
    {
      name: 'Documentation',
      content: `# API Documentation

## Overview

This document describes the API endpoints.

## Endpoints

### GET /api/users

Retrieves all users.

**Response:**
\`\`\`json
{
  "users": []
}
\`\`\`

### POST /api/users

Creates a new user.

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| name | string | Yes |
| email | string | Yes |

## Authentication

Use Bearer token authentication.`
    },
    {
      name: 'Meeting Notes',
      content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}  
**Attendees:** Name 1, Name 2, Name 3

## Agenda

1. Topic 1
2. Topic 2
3. Topic 3

## Discussion

### Topic 1

- Key point 1
- Key point 2

### Topic 2

- Key point 1
- Key point 2

## Action Items

- [ ] Task 1 - Assigned to
- [ ] Task 2 - Assigned to

## Next Meeting

Date: TBD`
    }
  ];

  const wordCount = markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = markdown.length;
  const lineCount = markdown.split('\n').length;

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="text-indigo-600" size={32} />
          <h2 className="text-3xl font-bold text-gray-800">Markdown Editor</h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              viewMode === 'editor'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Code size={18} />
            Editor
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FileText size={18} />
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              viewMode === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Eye size={18} />
            Preview
          </button>
        </div>
      </div>

      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => insertMarkdown('# ')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition"
            title="Heading"
          >
            <Heading size={20} />
          </button>
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition"
            title="Bold"
          >
            <Bold size={20} />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition"
            title="Italic"
          >
            <Italic size={20} />
          </button>
          <button
            onClick={() => insertMarkdown('- ')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition"
            title="List"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => insertMarkdown('[', '](url)')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition"
            title="Link"
          >
            <Link2 size={20} />
          </button>
          <button
            onClick={() => insertMarkdown('![alt](', ')')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition"
            title="Image"
          >
            <ImageIcon size={20} />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="p-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition font-mono text-sm"
            title="Inline Code"
          >
            {'</>'}
          </button>
          <button
            onClick={() => insertMarkdown('```\n', '\n```')}
            className="px-3 py-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition text-sm font-semibold"
            title="Code Block"
          >
            Code Block
          </button>
          <button
            onClick={() => insertMarkdown('> ')}
            className="px-3 py-2 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition text-sm font-semibold"
            title="Quote"
          >
            Quote
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={resetMarkdown}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <RotateCw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span><strong>{wordCount}</strong> words</span>
          <span><strong>{charCount}</strong> characters</span>
          <span><strong>{lineCount}</strong> lines</span>
        </div>
      </div>

      <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-6 mb-6`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Markdown Input</h3>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[500px] p-4 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm"
              placeholder="Type your markdown here..."
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Preview</h3>
            <div 
              className="prose max-w-none bg-white p-6 rounded-lg border-2 border-gray-200 min-h-[500px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Templates</h3>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => setMarkdown(template.content)}
                className="p-3 bg-white hover:bg-indigo-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg font-semibold text-sm transition"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Export</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadMarkdown}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
            >
              {downloadFormat === 'md' ? <Check size={20} /> : <Download size={20} />}
              Download MD
            </button>
            <button
              onClick={downloadHTML}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
            >
              {downloadFormat === 'html' ? <Check size={20} /> : <Download size={20} />}
              Download HTML
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-indigo-50 rounded-lg">
        <h4 className="font-bold text-indigo-900 mb-2">💡 Markdown Syntax Guide:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-indigo-800">
          <div><code className="bg-white px-2 py-1 rounded"># Heading 1</code> - Large heading</div>
          <div><code className="bg-white px-2 py-1 rounded">## Heading 2</code> - Medium heading</div>
          <div><code className="bg-white px-2 py-1 rounded">**bold**</code> - Bold text</div>
          <div><code className="bg-white px-2 py-1 rounded">*italic*</code> - Italic text</div>
          <div><code className="bg-white px-2 py-1 rounded">[link](url)</code> - Hyperlink</div>
          <div><code className="bg-white px-2 py-1 rounded">![alt](url)</code> - Image</div>
          <div><code className="bg-white px-2 py-1 rounded">`code`</code> - Inline code</div>
          <div><code className="bg-white px-2 py-1 rounded">- item</code> - List item</div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;