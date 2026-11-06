'use client';

import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Code,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập thông tin giới thiệu, các quyền lợi của gói tập...',
  rows = 5,
  className,
  disabled = false,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (disabled) return;
    const el = textareaRef.current;
    if (!el) return;
    const text = value || '';
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = text.substring(start, end);

    if (
      selected.length >= prefix.length + suffix.length &&
      selected.startsWith(prefix) &&
      selected.endsWith(suffix)
    ) {
      const unwrapped = selected.substring(prefix.length, selected.length - suffix.length);
      const newVal = text.substring(0, start) + unwrapped + text.substring(end);
      onChange(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + unwrapped.length);
      }, 0);
      return;
    }

    if (
      start >= prefix.length &&
      end + suffix.length <= text.length &&
      text.substring(start - prefix.length, start) === prefix &&
      text.substring(end, end + suffix.length) === suffix
    ) {
      const newVal = text.substring(0, start - prefix.length) + selected + text.substring(end + suffix.length);
      onChange(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start - prefix.length, end - prefix.length);
      }, 0);
      return;
    }

    const textToInsert = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultText}${suffix}`;
    const newVal = text.substring(0, start) + textToInsert + text.substring(end);
    onChange(newVal);

    setTimeout(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        el.setSelectionRange(start + prefix.length, start + prefix.length + defaultText.length);
      }
    }, 0);
  };

  const applyLinePrefix = (prefix: string) => {
    if (disabled) return;
    const el = textareaRef.current;
    if (!el) return;
    const text = value || '';
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start === end) {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      let lineEnd = text.indexOf('\n', start);
      if (lineEnd === -1) lineEnd = text.length;

      const currentLine = text.substring(lineStart, lineEnd);
      let newLine = '';
      let cursorOffset = 0;

      if (currentLine.startsWith(prefix)) {
        newLine = currentLine.substring(prefix.length);
        cursorOffset = -prefix.length;
      } else if (/^(\d+\.|\•|\-|\*|##)\s*/.test(currentLine)) {
        const cleaned = currentLine.replace(/^(\d+\.|\•|\-|\*|##)\s*/, '');
        newLine = `${prefix}${cleaned}`;
        cursorOffset = newLine.length - currentLine.length;
      } else {
        newLine = `${prefix}${currentLine}`;
        cursorOffset = prefix.length;
      }

      const newVal = text.substring(0, lineStart) + newLine + text.substring(lineEnd);
      onChange(newVal);

      setTimeout(() => {
        el.focus();
        const newCursor = Math.max(lineStart, Math.min(newVal.length, start + cursorOffset));
        el.setSelectionRange(newCursor, newCursor);
      }, 0);
      return;
    }

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;

    const block = text.substring(lineStart, lineEnd);
    const lines = block.split('\n');
    const allHavePrefix = lines.every((l) => l.startsWith(prefix));

    const transformed = lines
      .map((l, idx) => {
        if (allHavePrefix) {
          return l.substring(prefix.length);
        }
        const cleaned = l.replace(/^(\d+\.|\•|\-|\*|##)\s*/, '');
        if (prefix === '1. ') {
          return `${idx + 1}. ${cleaned}`;
        }
        return `${prefix}${cleaned}`;
      })
      .join('\n');

    const newVal = text.substring(0, lineStart) + transformed + text.substring(lineEnd);
    onChange(newVal);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart + transformed.length);
    }, 0);
  };

  const applyLink = () => {
    if (disabled) return;
    const el = textareaRef.current;
    if (!el) return;
    const text = value || '';
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = text.substring(start, end);

    const linkText = selected || 'Liên kết';
    const linkInsert = `[${linkText}](https://)`;
    const newVal = text.substring(0, start) + linkInsert + text.substring(end);
    onChange(newVal);

    setTimeout(() => {
      el.focus();
      if (!selected) {
        el.setSelectionRange(start + 1, start + 1 + linkText.length);
      } else {
        const urlStart = start + linkText.length + 3;
        el.setSelectionRange(urlStart, urlStart + 8);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      const el = textareaRef.current;
      if (!el) return;
      const text = value || '';
      const start = el.selectionStart;
      const end = el.selectionEnd;
      if (start !== end) return;

      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineBeforeCursor = text.substring(lineStart, start);

      const bulletMatch = lineBeforeCursor.match(/^([•\-\*])\s*(.*)$/);
      if (bulletMatch) {
        e.preventDefault();
        const bulletChar = bulletMatch[1];
        const content = bulletMatch[2];
        if (content.trim() === '') {
          const newVal = text.substring(0, lineStart) + text.substring(start);
          onChange(newVal);
          setTimeout(() => {
            el.focus();
            el.setSelectionRange(lineStart, lineStart);
          }, 0);
          return;
        }
        const insert = `\n${bulletChar} `;
        const newVal = text.substring(0, start) + insert + text.substring(start);
        onChange(newVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + insert.length, start + insert.length);
        }, 0);
        return;
      }

      const numMatch = lineBeforeCursor.match(/^(\d+)\.\s*(.*)$/);
      if (numMatch) {
        e.preventDefault();
        const currentNum = parseInt(numMatch[1], 10);
        const content = numMatch[2];
        if (content.trim() === '') {
          const newVal = text.substring(0, lineStart) + text.substring(start);
          onChange(newVal);
          setTimeout(() => {
            el.focus();
            el.setSelectionRange(lineStart, lineStart);
          }, 0);
          return;
        }
        const insert = `\n${currentNum + 1}. `;
        const newVal = text.substring(0, start) + insert + text.substring(start);
        onChange(newVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + insert.length, start + insert.length);
        }, 0);
        return;
      }
    }
  };

  return (
    <div
      className={cn(
        'w-full rounded-[8px] border border-slate-200 bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] overflow-hidden transition-all shadow-2xs',
        disabled && 'opacity-60 pointer-events-none bg-slate-50',
        className
      )}
    >
      <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1 flex-wrap select-none">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyLinePrefix('## ')}
          disabled={disabled}
          className="h-7 px-2 rounded-[6px] text-[12px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center gap-1 cursor-pointer"
          title="Tiêu đề (H2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('**', '**', 'In đậm')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="In đậm (Bold)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('*', '*', 'In nghiêng')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="In nghiêng (Italic)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('<u>', '</u>', 'Gạch chân')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="Gạch chân (Underline)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('~~', '~~', 'Gạch ngang')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="Gạch ngang (Strikethrough)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyLinePrefix('• ')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="Danh sách dấu chấm (Bullet List)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyLinePrefix('1. ')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="Danh sách số (Numbered List)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyLink}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="Chèn liên kết (Link)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('`', '`', 'code')}
          disabled={disabled}
          className="w-7 h-7 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center justify-center cursor-pointer"
          title="Mã (Code)"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3.5 bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none resize-y leading-relaxed font-normal min-h-[130px]"
      />
    </div>
  );
}

export default RichTextEditor;
