'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Code2, Palette, Database, Globe, Server, Smartphone,
  GitBranch, Terminal, Cpu, Shield, Zap, Heart,
  Star, Coffee, Rocket, BookOpen, Briefcase, GraduationCap,
  MessageSquare, Users, Settings, FileText, Image, Music,
  Camera, Video, MapPin, Mail, Phone, Link, ExternalLink,
  Github, Linkedin, Twitter, Youtube, Instagram, Facebook,
  Figma, Chrome, Layers, Box, Monitor, Cloud,
  HardDrive, Wifi, Lock, Key, Eye, Bell,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Info, HelpCircle, Plus, Minus, ChevronDown,
  Search, Download, Upload, Trash, Edit, Copy,
  Share, Bookmark, Flag, Award, TrendingUp, BarChart3,
  PieChart, Activity, Layout, Grid, List, SidebarOpen,
  Home, User, FolderOpen, Package, Command, AppWindow,
  Code, FileCode2, Binary, Braces, Hash, AtSign,
  Type, Bold, Italic, Underline, AlignCenter,
  Table, Sheet, PenTool, Ruler, MousePointer, Move,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Palette, Database, Globe, Server, Smartphone,
  GitBranch, Terminal, Cpu, Shield, Zap, Heart,
  Star, Coffee, Rocket, BookOpen, Briefcase, GraduationCap,
  MessageSquare, Users, Settings, FileText, Image, Music,
  Camera, Video, MapPin, Mail, Phone, Link, ExternalLink,
  Github, Linkedin, Twitter, Youtube, Instagram, Facebook,
  Figma, Chrome, Layers, Box, Monitor, Cloud,
  HardDrive, Wifi, Lock, Key, Eye, Bell,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Info, HelpCircle, Plus, Minus, ChevronDown,
  Search, Download, Upload, Trash, Edit, Copy,
  Share, Bookmark, Flag, Award, TrendingUp, BarChart3,
  PieChart, Activity, Layout, Grid, List, SidebarOpen,
  Home, User, FolderOpen, Package, Command, AppWindow,
  Code, FileCode2, Binary, Braces, Hash, AtSign,
  Type, Bold, Italic, Underline, AlignCenter,
  Table, Sheet, PenTool, Ruler, MousePointer, Move,
};

const ICON_NAMES = Object.keys(ICON_MAP);

interface IconSelectProps {
  value?: string;
  onChange: (name: string) => void;
  label?: string;
}

export function IconSelect({ value, onChange, label }: IconSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const Icon = value ? ICON_MAP[value] : null;
  const filtered = ICON_NAMES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 border rounded-md bg-background hover:bg-accent text-sm"
          >
            {Icon ? <Icon className="h-4 w-4" /> : <span className="text-muted-foreground">اختر أيقونة</span>}
            <span className="flex-1 text-right">{value || 'اختر أيقونة'}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" dir="rtl" align="start">
          <div className="p-2 border-b">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن أيقونة..."
              className="h-8"
            />
          </div>
          <ScrollArea className="h-56">
            <div className="grid grid-cols-6 gap-1 p-2">
              {filtered.map((name) => {
                const Comp = ICON_MAP[name];
                return (
                  <button
                    key={name}
                    type="button"
                    className={`p-2 rounded-md hover:bg-accent flex items-center justify-center transition-colors ${
                      value === name ? 'bg-emerald-100 dark:bg-emerald-900' : ''
                    }`}
                    title={name}
                    onClick={() => { onChange(name); setOpen(false); }}
                  >
                    <Comp className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { ICON_MAP, ICON_NAMES };
