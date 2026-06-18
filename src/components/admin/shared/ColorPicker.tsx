'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#10b981', '#059669', '#047857', '#14b8a6', '#0d9488', '#0f766e',
  '#f59e0b', '#d97706', '#b45309', '#ef4444', '#dc2626', '#b91c1c',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#3b82f6', '#2563eb', '#1d4ed8',
  '#ec4899', '#db2777', '#be185d', '#6366f1', '#4f46e5', '#4338ca',
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
];

export function ColorPicker({ value = '#10b981', onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer shadow-sm"
              style={{ backgroundColor: value }}
              type="button"
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" dir="rtl" align="start">
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-md border-2 cursor-pointer transition-transform hover:scale-110 ${
                    value === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => { onChange(color); setOpen(false); }}
                  type="button"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder="#000000"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
