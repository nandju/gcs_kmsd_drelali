'use client';

import { useErp } from '@/context/erp-store';
import { formatDateTime } from '@/lib/erp/format';
import { Card, PageHeader } from '@/components/erp/ui';
import { inputClass } from '@/components/erp/ui';
import { useState } from 'react';

export default function HistoryPage() {
  const s = useErp();
  const [q, setQ] = useState('');

  const rows = s.activities.filter((a) =>
    q ? `${a.label} ${a.by}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <PageHeader title="Historique des activités" subtitle="Journal des actions de démonstration (en mémoire, non persisté)." />
      <input type="search" placeholder="Rechercher dans l’historique…" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputClass} mb-4 max-w-sm`} />
      <Card padded={false}>
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Aucune activité trouvée.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-sm text-gray-700">{a.label}</span>
                <span className="text-xs text-gray-400">{formatDateTime(a.at)} · {a.by}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
