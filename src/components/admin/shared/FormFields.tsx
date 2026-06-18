'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface FieldProps {
  label: string;
  name?: string;
  description?: string;
}

export function TextField({ label, name, description, value, onChange, placeholder, type = 'text' }: FieldProps & {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir="rtl" />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function TextAreaField({ label, name, description, value, onChange, placeholder, rows = 4 }: FieldProps & {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} dir="rtl" />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function SwitchField({ label, name, description, checked, onChange }: FieldProps & {
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label htmlFor={name}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={name} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SelectField({ label, name, description, value, onChange, options }: FieldProps & {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function SliderField({ label, name, description, value, onChange, min = 0, max = 100, step = 1 }: FieldProps & {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-mono text-muted-foreground">{value}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
