'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'اكتب المحتوى هنا...',
  rows = 12,
}: RichTextEditorProps) {
  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="edit">تحرير</TabsTrigger>
          <TabsTrigger value="preview">معاينة</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm"
            dir="rtl"
          />
        </TabsContent>
        <TabsContent value="preview">
          <div
            className="min-h-[200px] p-4 border rounded-md prose prose-sm dark:prose-invert max-w-none"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(value) }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function simpleMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Code
  html = html.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-emerald-600 underline">$1</a>');
  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}
