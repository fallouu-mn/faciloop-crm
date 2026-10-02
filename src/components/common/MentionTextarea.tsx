import React, { useMemo, useRef, useState } from 'react';
import { AtSign, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Commercial } from '../../types/crm';

/**
 * Retour client n°2 — zone de notes avec mention `@nom`.
 *
 * Logique 100 % custom (regex + dropdown) : aucune dépendance externe,
 * donc aucun risque de version incompatible avec React 18 / Vite 5.
 */

const MENTION_TOKEN = /@([A-Za-zÀ-ÿ0-9'_-]*)$/;

/** Trouve les commerciaux réellement tagués dans un texte. */
export function extractMentionedCommerciaux(
  text: string,
  commerciaux: Commercial[],
): Commercial[] {
  if (!text) return [];
  const normalized = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const pattern = /@([^\s@,;.!?]{1,60})/g;
  const found = new Map<string, Commercial>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const token = normalized(match[1]);
    const hit = commerciaux.find((c) => {
      const prenom = normalized(c.prenom || '');
      const nom = normalized(c.nom || '');
      const full = normalized(`${c.prenom || ''} ${c.nom || ''}`.trim());
      const email = normalized(c.email || '');
      return (
        token === prenom ||
        token === nom ||
        token === full ||
        token === email ||
        full.startsWith(token) ||
        token === normalized(c.id)
      );
    });
    if (hit) found.set(hit.id, hit);
  }
  return Array.from(found.values());
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  isEn?: boolean;
}

export const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  className = '',
  isEn = false,
}) => {
  const { commerciaux } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /** Commerciaux de l'organisation (`role = commercial`, org connectée). */
  const candidates = useMemo(() => {
    const orgCommerciaux = commerciaux.filter((c) => c.statut !== 'inactif');
    if (!query) return orgCommerciaux.slice(0, 8);
    const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return orgCommerciaux
      .filter((c) =>
        `${c.prenom || ''} ${c.nom || ''} ${c.email || ''}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [commerciaux, query]);

  const open = query !== null && candidates.length > 0;

  const detectQuery = (element: HTMLTextAreaElement) => {
    const before = element.value.slice(0, element.selectionStart ?? element.value.length);
    const m = before.match(MENTION_TOKEN);
    setQuery(m ? m[1] : null);
    setActiveIndex(0);
  };

  const insertMention = (commercial: Commercial) => {
    const el = textareaRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const m = before.match(MENTION_TOKEN);
    if (!m) return;
    const start = before.length - m[0].length;
    const label = `${commercial.prenom || ''} ${commercial.nom || ''}`.trim() || commercial.email;
    const next = `${value.slice(0, start)}@${label} ${after}`;
    onChange(next);
    setQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (start + label.length + 2);
      el.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % candidates.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + candidates.length) % candidates.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(candidates[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setQuery(null);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        rows={rows}
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          detectQuery(e.target);
        }}
        onClick={(e) => detectQuery(e.currentTarget)}
        onKeyUp={(e) => detectQuery(e.currentTarget)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setQuery(null), 150)}
        placeholder={placeholder}
        className={`w-full p-3 rounded-2xl border border-input bg-background font-semibold text-foreground ${className}`}
      />

      <span className="pointer-events-none absolute right-3 top-3 text-muted-foreground/50">
        <AtSign className="w-3.5 h-3.5" />
      </span>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
            {isEn ? 'Mention a sales rep' : 'Taguer un commercial'}
          </p>
          {candidates.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(c);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                i === activeIndex ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/60'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-3 h-3" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold truncate">
                  {c.prenom} {c.nom}
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">{c.email}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {!open && (
        <p className="mt-1 text-[10px] text-muted-foreground font-medium">
          {isEn ? 'Tip: type @ to notify a sales rep' : 'Astuce : tapez @ pour notifier un commercial'}
        </p>
      )}
    </div>
  );
};
