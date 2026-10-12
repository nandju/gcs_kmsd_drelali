'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { DRIVER_STATUS, VEHICLE_STATUS } from '@/lib/erp/labels';
import { Badge, Card, PageHeader } from '@/components/erp/ui';

export default function ResourcesPage() {
  const s = useErp();
  const missionOf = (vehicleId: string) =>
    s.missions.find((m) => m.vehicleId === vehicleId && ['AFFECTEE', 'EN_COURS'].includes(m.status));

  return (
    <div>
      <PageHeader
        title="Ressources et véhicules"
        subtitle="Flotte GCS — un véhicule immobilisé n’est pas sélectionnable pour une nouvelle affectation."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {s.vehicles.map((v) => {
          const current = missionOf(v.id);
          return (
            <Card key={v.id} title={v.name}>
              <p className="text-sm text-gray-500">{v.type}</p>
              <p className="text-xs text-gray-400">Propriétaire : {v.owner}</p>
              <div className="mt-2.5"><Badge tone={VEHICLE_STATUS[v.status].tone}>{VEHICLE_STATUS[v.status].label}</Badge></div>
              {current && (
                <p className="mt-2 text-xs text-gray-500">
                  Mission en cours :{' '}
                  <Link href={`/missions/${current.id}`} className="font-medium text-cyan-800 hover:underline">{current.reference}</Link>
                </p>
              )}
              {v.note && <p className="mt-2 text-xs text-gray-400">{v.note}</p>}
            </Card>
          );
        })}
      </div>

      <h2 className="mb-3 mt-7 text-base font-semibold text-gray-800">Chauffeurs et agents</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {s.drivers.map((d) => (
          <Card key={d.id} title={d.name}>
            <p className="text-sm text-gray-500">{d.phone}</p>
            <p className="text-xs text-gray-400">{d.license}</p>
            <div className="mt-2.5"><Badge tone={DRIVER_STATUS[d.status].tone}>{DRIVER_STATUS[d.status].label}</Badge></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
