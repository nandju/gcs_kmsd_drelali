'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useErp } from '@/context/erp-store';
import { MISSION_STATUS } from '@/lib/erp/labels';
import { Badge, Button, PageHeader } from '@/components/erp/ui';

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // lundi = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function PlanningPage() {
  const s = useErp();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = startOfWeek(new Date());
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const missionsFor = (day: Date) =>
    s.missions.filter((m) => new Date(m.plannedDate).toDateString() === day.toDateString());

  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

  return (
    <div>
      <PageHeader
        title="Planning des missions"
        subtitle={`Semaine du ${fmt.format(days[0])} au ${fmt.format(days[6])}`}
        action={
          <>
            <Button variant="secondary" onClick={() => setWeekOffset((w) => w - 1)}>← Semaine préc.</Button>
            <Button variant="secondary" onClick={() => setWeekOffset(0)}>Aujourd’hui</Button>
            <Button variant="secondary" onClick={() => setWeekOffset((w) => w + 1)}>Semaine suiv. →</Button>
          </>
        }
      />
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[980px] grid-cols-7 gap-2">
          {days.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const items = missionsFor(day);
            return (
              <div key={i} className={`rounded-xl border p-2 ${isToday ? 'border-cyan-700/50 bg-cyan-50/40' : 'border-gray-200 bg-white'}`}>
                <p className={`mb-2 px-1 text-xs font-semibold ${isToday ? 'text-cyan-800' : 'text-gray-500'}`}>
                  {DAY_LABELS[i]} {fmt.format(day)}
                </p>
                <div className="space-y-1.5">
                  {items.length === 0 && <p className="px-1 py-4 text-center text-[11px] text-gray-300">—</p>}
                  {items.map((m) => (
                    <Link key={m.id} href={`/missions/${m.id}`} className="block rounded-lg border border-gray-200 bg-white p-2 shadow-theme-xs hover:border-cyan-700/40">
                      <span className="block text-xs font-semibold text-cyan-800">{m.reference}</span>
                      <span className="block truncate text-[11px] text-gray-600">{m.origin} → {m.destination}</span>
                      <span className="mt-1 inline-block"><Badge tone={MISSION_STATUS[m.status].tone}>{MISSION_STATUS[m.status].label}</Badge></span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
