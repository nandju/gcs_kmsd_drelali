'use client';

import { formatMoney } from '@/lib/erp/format';
import type { QuoteLine } from '@/lib/erp/types';
import { Button, inputClass } from './ui';

let lineId = 1;
export const newQuoteLine = (): QuoteLine => ({
  id: `nl-${lineId++}`,
  label: '',
  quantity: 1,
  unit: 'forfait',
  unitPrice: 0,
});

export function QuoteLinesEditor({
  lines,
  onChange,
}: {
  lines: QuoteLine[];
  onChange: (lines: QuoteLine[]) => void;
}) {
  const update = (id: string, patch: Partial<QuoteLine>) =>
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-3 py-2 text-left font-medium">Désignation</th>
              <th className="w-20 px-3 py-2 text-left font-medium">Qté</th>
              <th className="w-28 px-3 py-2 text-left font-medium">Unité</th>
              <th className="w-36 px-3 py-2 text-left font-medium">P.U. (XOF)</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Total</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 last:border-0">
                <td className="px-2 py-1.5"><input className={inputClass} value={l.label} onChange={(e) => update(l.id, { label: e.target.value })} placeholder="Prestation…" /></td>
                <td className="px-2 py-1.5"><input type="number" min={1} className={inputClass} value={l.quantity} onChange={(e) => update(l.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })} /></td>
                <td className="px-2 py-1.5"><input className={inputClass} value={l.unit} onChange={(e) => update(l.id, { unit: e.target.value })} /></td>
                <td className="px-2 py-1.5"><input type="number" min={0} className={inputClass} value={l.unitPrice} onChange={(e) => update(l.id, { unitPrice: Math.max(0, parseInt(e.target.value) || 0) })} /></td>
                <td className="px-3 py-1.5 text-right font-medium text-gray-800">{formatMoney(l.quantity * l.unitPrice, 'XOF')}</td>
                <td className="px-2 py-1.5">
                  <button
                    aria-label="Supprimer la ligne"
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                    disabled={lines.length <= 1}
                    onClick={() => onChange(lines.filter((x) => x.id !== l.id))}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => onChange([...lines, newQuoteLine()])}>
          + Ajouter une ligne
        </Button>
        <p className="text-sm font-semibold text-gray-800">Total proposé : {formatMoney(total, 'XOF')}</p>
      </div>
    </div>
  );
}
