import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { CustomFieldDef, CustomFieldValues } from '../../types/crm';

interface CustomFieldsFormProps {
  schema: CustomFieldDef[];
  values: CustomFieldValues;
  onChange: (values: CustomFieldValues) => void;
  disabled?: boolean;
  /** Rendu lecture seule (fiche détails) au lieu d'inputs éditables. */
  readOnly?: boolean;
  isEn?: boolean;
}

const inputClass =
  'w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50';

/**
 * Retour client n°4 — génère dynamiquement les inputs décrits dans
 * `organization_settings.prospect_custom_fields_schema`.
 * Les valeurs sont persistées dans `prospects.custom_fields` (JSONB).
 */
export const CustomFieldsForm: React.FC<CustomFieldsFormProps> = ({
  schema,
  values,
  onChange,
  disabled = false,
  readOnly = false,
  isEn = false,
}) => {
  if (schema.length === 0) return null;

  const setValue = (key: string, value: string) => {
    if (disabled || readOnly) return;
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {isEn ? 'CUSTOM FIELDS' : 'Champs personnalisés'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {schema.map((field) => {
          const raw = values[field.key];
          const value = raw === undefined || raw === null ? '' : String(raw);

          if (readOnly) {
            return (
              <div key={field.key} className="space-y-1">
                <span className="block text-[11px] font-extrabold text-muted-foreground">
                  {field.label}
                </span>
                <span className="block font-medium text-foreground">{value || '—'}</span>
              </div>
            );
          }

          return (
            <div key={field.key} className="space-y-1">
              <label className="block font-semibold mb-1">
                {field.label}
                {field.required ? ' *' : ''}
              </label>

              {field.type === 'select' ? (
                <select
                  value={value}
                  required={!!field.required}
                  disabled={disabled}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">{isEn ? '— Select —' : '— Sélectionner —'}</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={value}
                  required={!!field.required}
                  disabled={disabled}
                  onChange={(e) =>
                    setValue(field.key, field.type === 'number' ? e.target.value : e.target.value)
                  }
                  className={inputClass}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
 * Éditeur de schéma (page Paramètres — Admin)
 * ────────────────────────────────────────────────────────────── */

interface CustomFieldsSchemaEditorProps {
  schema: CustomFieldDef[];
  onChange: (schema: CustomFieldDef[]) => void;
  isEn?: boolean;
}

const FIELD_TYPES: CustomFieldDef['type'][] = ['text', 'number', 'date', 'select'];

export const CustomFieldsSchemaEditor: React.FC<CustomFieldsSchemaEditorProps> = ({
  schema,
  onChange,
  isEn = false,
}) => {
  const update = (index: number, patch: Partial<CustomFieldDef>) => {
    onChange(schema.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const remove = (index: number) => onChange(schema.filter((_, i) => i !== index));

  const add = () => {
    const n = schema.length + 1;
    onChange([
      ...schema,
      {
        key: `champ_${Date.now()}`,
        label: isEn ? `New field ${n}` : `Nouveau champ ${n}`,
        type: 'text',
        options: [],
        required: false,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {schema.length === 0 && (
        <p className="text-xs text-muted-foreground font-medium">
          {isEn
            ? 'No custom field yet. Add one to make it available on prospect forms and cards.'
            : 'Aucun champ personnalisé pour le moment. Ajoutez-en un pour le voir apparaître sur les formulaires et les fiches prospects.'}
        </p>
      )}

      {schema.map((field, index) => (
        <div
          key={field.key}
          className="p-3 rounded-2xl border border-border bg-muted/30 space-y-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                {isEn ? 'Label' : 'Libellé'}
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => update(index, { label: e.target.value })}
                className="w-full p-2 rounded-lg border border-input bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                {isEn ? 'Type' : 'Type'}
              </label>
              <select
                value={field.type}
                onChange={(e) =>
                  update(index, { type: e.target.value as CustomFieldDef['type'] })
                }
                className="w-full p-2 rounded-lg border border-input bg-background text-xs font-medium text-foreground"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'text'
                      ? isEn
                        ? 'Text'
                        : 'Texte'
                      : t === 'number'
                      ? isEn
                        ? 'Number'
                        : 'Nombre'
                      : t === 'date'
                      ? isEn
                        ? 'Date'
                        : 'Date'
                      : isEn
                      ? 'List'
                      : 'Liste'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {field.type === 'select' && (
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                {isEn ? 'Options (comma separated)' : 'Options (séparées par des virgules)'}
              </label>
              <input
                type="text"
                value={(field.options || []).join(', ')}
                onChange={(e) =>
                  update(index, {
                    options: e.target.value
                      .split(',')
                      .map((o) => o.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={isEn ? 'Small, Medium, Large' : 'Petite, Moyenne, Grande'}
                className="w-full p-2 rounded-lg border border-input bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => update(index, { required: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-input accent-primary"
              />
              {isEn ? 'Required' : 'Obligatoire'}
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800/40 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              {isEn ? 'Remove' : 'Supprimer'}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-primary/50 text-xs font-bold text-primary hover:bg-primary/5 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        {isEn ? 'Add a custom field' : 'Ajouter un champ personnalisé'}
      </button>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
 * Éditeur de sources custom (page Paramètres — Admin)
 * ────────────────────────────────────────────────────────────── */

interface CustomSourcesEditorProps {
  sources: string[];
  onChange: (sources: string[]) => void;
  isEn?: boolean;
}

export const CustomSourcesEditor: React.FC<CustomSourcesEditorProps> = ({
  sources,
  onChange,
  isEn = false,
}) => {
  const [draft, setDraft] = React.useState('');

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    if (sources.some((s) => s.toLowerCase() === label.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...sources, label]);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={isEn ? 'Ex: Trade fair' : 'Ex : Salon professionnel'}
          className="flex-1 p-2.5 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="button"
          onClick={add}
          className="px-3.5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all"
        >
          {isEn ? 'Add' : 'Ajouter'}
        </button>
      </div>

      {sources.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold"
            >
              {s}
              <button
                type="button"
                onClick={() => onChange(sources.filter((x) => x !== s))}
                className="hover:text-red-500 transition-colors"
                aria-label={isEn ? 'Remove' : 'Supprimer'}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground font-medium">
          {isEn
            ? 'No custom source yet — only the default list is offered.'
            : 'Aucune source personnalisée — seule la liste par défaut est proposée.'}
        </p>
      )}
    </div>
  );
};
