'use client';

// Panneau d'édition d'un champ : libellés, options, validation, conditions.

import type {
  ConditionOperator,
  FormCondition,
  FormField,
  FormSchema,
} from '@/modules/forms/types';
import {
  CONDITION_OPERATOR_LABELS,
  FIELD_TYPE_LABELS,
} from '@/modules/forms/types';
import {
  allFields,
  DISPLAY_FIELD_TYPES,
  OPTION_FIELD_TYPES,
} from '@/modules/forms/logic';
import { Field, inputClass } from '@/components/erp/ui';

const OPERATORS_WITH_VALUE: ConditionOperator[] = ['equals', 'not_equals', 'in'];

export function FieldEditor({
  field,
  schema,
  onChange,
  onDelete,
}: {
  field: FormField;
  schema: FormSchema;
  onChange: (patch: Partial<FormField>) => void;
  onDelete: () => void;
}) {
  const isDisplay = DISPLAY_FIELD_TYPES.includes(field.type);
  const hasOptions = OPTION_FIELD_TYPES.includes(field.type);
  const isNumeric = field.type === 'number' || field.type === 'decimal';
  const isTextual =
    field.type === 'text' ||
    field.type === 'textarea' ||
    field.type === 'address' ||
    field.type === 'phone';
  const isFile = field.type === 'file' || field.type === 'image';

  // Champs pouvant servir de source de condition (saisie réelle, autre champ).
  const conditionSources = allFields(schema).filter(
    (f) => f.id !== field.id && !DISPLAY_FIELD_TYPES.includes(f.type),
  );

  const setValidation = (patch: Partial<NonNullable<FormField['validation']>>) =>
    onChange({ validation: { ...field.validation, ...patch } });

  const setConditions = (conditions: FormCondition[]) =>
    onChange({ conditions: conditions.length ? conditions : undefined });

  const updateCondition = (i: number, patch: Partial<FormCondition>) => {
    const next = (field.conditions ?? []).map((c, j) =>
      j === i ? { ...c, ...patch } : c,
    );
    setConditions(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {FIELD_TYPE_LABELS[field.type]}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Supprimer le champ
        </button>
      </div>

      <Field label="Libellé" required>
        <input
          className={inputClass}
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </Field>

      <Field label="Description / aide">
        <input
          className={inputClass}
          value={field.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value || undefined })}
        />
      </Field>

      {!isDisplay && (
        <Field label="Placeholder">
          <input
            className={inputClass}
            value={field.placeholder ?? ''}
            onChange={(e) => onChange({ placeholder: e.target.value || undefined })}
          />
        </Field>
      )}

      {!isDisplay && (
        <Field label="Valeur par défaut">
          <input
            className={inputClass}
            value={field.defaultValue ?? ''}
            onChange={(e) =>
              onChange({ defaultValue: e.target.value || undefined })
            }
          />
        </Field>
      )}

      <div className="flex gap-4">
        {!isDisplay && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="accent-cyan-800"
            />
            Champ obligatoire
          </label>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={field.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="accent-cyan-800"
          />
          Champ actif
        </label>
      </div>

      {hasOptions && (
        <Field label="Options (une par ligne)" required>
          <textarea
            className={inputClass}
            rows={Math.max(3, (field.options ?? []).length)}
            value={(field.options ?? []).join('\n')}
            onChange={(e) =>
              onChange({
                options: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
      )}

      {/* Validation */}
      {!isDisplay && (
        <details className="rounded-lg border border-gray-200 p-3" open={!!field.validation}>
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500">
            Règles de validation
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {isTextual && (
              <>
                <Field label="Longueur min">
                  <input
                    type="number"
                    className={inputClass}
                    value={field.validation?.minLength ?? ''}
                    onChange={(e) =>
                      setValidation({
                        minLength: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </Field>
                <Field label="Longueur max">
                  <input
                    type="number"
                    className={inputClass}
                    value={field.validation?.maxLength ?? ''}
                    onChange={(e) =>
                      setValidation({
                        maxLength: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </Field>
              </>
            )}
            {isNumeric && (
              <>
                <Field label="Valeur min">
                  <input
                    type="number"
                    className={inputClass}
                    value={field.validation?.min ?? ''}
                    onChange={(e) =>
                      setValidation({ min: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Valeur max">
                  <input
                    type="number"
                    className={inputClass}
                    value={field.validation?.max ?? ''}
                    onChange={(e) =>
                      setValidation({ max: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                  />
                </Field>
              </>
            )}
            {isFile && (
              <div className="col-span-2">
                <Field label="Formats acceptés" hint="Extensions séparées par des virgules, ex. .pdf,.jpg">
                  <input
                    className={inputClass}
                    value={field.validation?.accept ?? ''}
                    onChange={(e) =>
                      setValidation({ accept: e.target.value || undefined })
                    }
                  />
                </Field>
              </div>
            )}
            <div className="col-span-2">
              <Field label="Message d'erreur personnalisé">
                <input
                  className={inputClass}
                  value={field.validation?.errorMessage ?? ''}
                  onChange={(e) =>
                    setValidation({ errorMessage: e.target.value || undefined })
                  }
                />
              </Field>
            </div>
          </div>
        </details>
      )}

      {/* Conditions d’affichage */}
      <details
        className="rounded-lg border border-gray-200 p-3"
        open={(field.conditions ?? []).length > 0}
      >
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500">
          Conditions d’affichage ({(field.conditions ?? []).length})
        </summary>
        <p className="mt-2 text-xs text-gray-500">
          Le champ n’est affiché que si toutes les conditions sont remplies.
        </p>
        <div className="mt-3 space-y-3">
          {(field.conditions ?? []).map((cond, i) => {
            const source = conditionSources.find((f) => f.id === cond.fieldId);
            return (
              <div key={i} className="rounded-lg bg-gray-50 p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    className={inputClass}
                    value={cond.fieldId}
                    onChange={(e) => updateCondition(i, { fieldId: e.target.value })}
                    aria-label="Champ source de la condition"
                  >
                    {conditionSources.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputClass}
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(i, { operator: e.target.value as ConditionOperator })
                    }
                    aria-label="Opérateur"
                  >
                    {(Object.keys(CONDITION_OPERATOR_LABELS) as ConditionOperator[]).map(
                      (op) => (
                        <option key={op} value={op}>
                          {CONDITION_OPERATOR_LABELS[op]}
                        </option>
                      ),
                    )}
                  </select>
                  {OPERATORS_WITH_VALUE.includes(cond.operator) ? (
                    source?.options ? (
                      <select
                        className={inputClass}
                        value={cond.value ?? ''}
                        onChange={(e) => updateCondition(i, { value: e.target.value })}
                        aria-label="Valeur"
                      >
                        <option value="">—</option>
                        {source.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={inputClass}
                        value={cond.value ?? ''}
                        onChange={(e) => updateCondition(i, { value: e.target.value })}
                        placeholder={cond.operator === 'in' ? 'a, b, c…' : 'Valeur'}
                        aria-label="Valeur"
                      />
                    )
                  ) : (
                    <span />
                  )}
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs text-red-600 hover:underline"
                  onClick={() =>
                    setConditions((field.conditions ?? []).filter((_, j) => j !== i))
                  }
                >
                  Retirer la condition
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="text-xs font-medium text-cyan-800 hover:underline disabled:text-gray-400"
            disabled={conditionSources.length === 0}
            onClick={() =>
              setConditions([
                ...(field.conditions ?? []),
                { fieldId: conditionSources[0].id, operator: 'equals', value: '' },
              ])
            }
          >
            + Ajouter une condition
          </button>
        </div>
      </details>
    </div>
  );
}
