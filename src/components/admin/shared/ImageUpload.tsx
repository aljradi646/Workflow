'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  multiple?: boolean;
  onMultipleChange?: (urls: string[]) => void;
  values?: string[];
  folder?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  multiple = false,
  onMultipleChange,
  values = [],
  folder = 'general',
  label,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/media', { method: 'POST', body: formData });
    const json = await res.json();
    if (json.success) {
      return json.data.url as string;
    }
    throw new Error(json.error || 'Upload failed');
  }, [folder]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const urls = await Promise.all(fileArray.map(uploadFile));
      if (multiple && onMultipleChange) {
        onMultipleChange([...values, ...urls]);
      } else if (urls[0]) {
        onChange(urls[0]);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [uploadFile, multiple, onMultipleChange, values, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleRemove = useCallback((url: string) => {
    if (multiple && onMultipleChange) {
      onMultipleChange(values.filter((v) => v !== url));
    } else {
      onRemove?.();
    }
  }, [multiple, onMultipleChange, values, onRemove]);

  const displayValues = multiple ? values : (value ? [value] : []);

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-border hover:border-emerald-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = multiple;
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFiles(files);
          };
          input.click();
        }}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {uploading ? 'جاري الرفع...' : 'اسحب الصور هنا أو انقر للاختيار'}
        </p>
      </div>

      {displayValues.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {displayValues.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border bg-muted">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:text-white"
                  onClick={(e) => { e.stopPropagation(); handleRemove(url); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!multiple && !value && (
        <div className="flex items-center gap-2">
          <InputWithUrl onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function InputWithUrl({ onChange }: { onChange: (url: string) => void }) {
  const [url, setUrl] = useState('');
  return (
    <div className="flex gap-2 w-full">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="أو أدخل رابط الصورة"
        className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
      />
      <Button size="sm" variant="outline" onClick={() => url && onChange(url)} disabled={!url}>
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
