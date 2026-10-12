'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { DRIVER_STATUS, MISSION_STATUS } from '@/lib/erp/labels';
import { Badge, Card, LinkButton, PageHeader } from '@/components/erp/ui';

export default function DriversPage() {
  const s = useErp();

  return (
    <div>
      <PageHeader
        title="Chauffeurs"
        subtitle="Équipe terrain GCS — personnel fictif de démonstration."
        action={<LinkButton href="/chauffeur" variant="primary">Ouvrir l’interface chauffeur mobile</LinkButton>}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {s.drivers.map((d) => {
          const missions = s.missions.filter((m) => m.driverId === d.id && !['CLOTUREE', 'ANNULEE'].includes(m.status));
          return (
            <Card key={d.id} title={d.name}>
              <p className="text-sm text-gray-500">{d.phone} · {d.license}</p>
              <div className="mt-2"><Badge tone={DRIVER_STATUS[d.status].tone}>{DRIVER_STATUS[d.status].label}</Badge></div>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Missions actives</p>
                {missions.length === 0 ? (
                  <p className="text-sm text-gray-400">Aucune mission active.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {missions.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2">
                        <Link href={`/missions/${m.id}`} className="text-sm font-medium text-cyan-800 hover:underline">{m.reference}</Link>
                        <Badge tone={MISSION_STATUS[m.status].tone}>{MISSION_STATUS[m.status].label}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
