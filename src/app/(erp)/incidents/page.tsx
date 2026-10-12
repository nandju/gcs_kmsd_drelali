'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { formatDateTime } from '@/lib/erp/format';
import { INCIDENT_PRIORITY, INCIDENT_STATUS } from '@/lib/erp/labels';
import type { Incident } from '@/lib/erp/types';
import { Badge, Button, Card, PageHeader, Tabs } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';

function IncidentDetail({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  const s = useErp();
  if (!incident) return null;
  const mission = incident.missionId ? s.missions.find((m) => m.id === incident.missionId) : undefined;
  return (
    <Modal isOpen onClose={onClose} title={incident.reference} description={incident.type} className={{ modal: 'sm:w-[560px] sm:p-8 rounded-2xl' }}>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={INCIDENT_PRIORITY[incident.priority].tone}>Priorité : {INCIDENT_PRIORITY[incident.priority].label}</Badge>
        <Badge tone={INCIDENT_STATUS[incident.status].tone}>{INCIDENT_STATUS[incident.status].label}</Badge>
      </div>
      <p className="mt-4 text-sm text-gray-700">{incident.description}</p>
      {mission && (
        <p className="mt-2 text-sm text-gray-500">
          Mission liée :{' '}
          <Link href={`/missions/${mission.id}`} className="font-medium text-cyan-800 hover:underline" onClick={onClose}>
            {mission.reference}
          </Link>
        </p>
      )}
      <h4 className="mb-2 mt-5 text-sm font-semibold text-gray-700">Historique</h4>
      <ul className="space-y-1.5">
        {incident.history.map((h, i) => (
          <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <span className="text-gray-700">{h.label}</span>
            <span className="text-xs text-gray-400">{formatDateTime(h.at)} · {h.by}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {incident.status === 'OUVERT' && (
          <Button onClick={() => { s.incidentAction(incident.id, 'TRAITER'); onClose(); }}>Prendre en charge</Button>
        )}
        {(incident.status === 'OUVERT' || incident.status === 'EN_TRAITEMENT') && (
          <Button onClick={() => { s.incidentAction(incident.id, 'RESOUDRE'); onClose(); }}>Marquer résolu</Button>
        )}
        {incident.status === 'RESOLU' && (
          <Button variant="secondary" onClick={() => { s.incidentAction(incident.id, 'CLOTURER'); onClose(); }}>Clôturer</Button>
        )}
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      </div>
    </Modal>
  );
}

export default function IncidentsPage() {
  const s = useErp();
  const [tab, setTab] = useState('actifs');
  const [selected, setSelected] = useState<Incident | null>(null);

  const actifs = s.incidents.filter((i) => i.status === 'OUVERT' || i.status === 'EN_TRAITEMENT');
  const clos = s.incidents.filter((i) => i.status === 'RESOLU' || i.status === 'CLOTURE');
  const rows = tab === 'actifs' ? actifs : clos;

  return (
    <div>
      <PageHeader title="Incidents" subtitle="Suivi des incidents opérationnels — distincts du statut principal des missions." />
      <Tabs
        tabs={[
          { id: 'actifs', label: 'Actifs', count: actifs.length },
          { id: 'clos', label: 'Résolus / clôturés', count: clos.length },
        ]}
        active={tab}
        onChange={setTab}
      />
      {rows.length === 0 ? (
        <Card><p className="text-sm text-gray-400">Aucun incident dans cette catégorie.</p></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((i) => {
            const mission = i.missionId ? s.missions.find((m) => m.id === i.missionId) : undefined;
            return (
              <Card key={i.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-cyan-800">{i.reference}</span>
                  <Badge tone={INCIDENT_PRIORITY[i.priority].tone}>{INCIDENT_PRIORITY[i.priority].label}</Badge>
                  <Badge tone={INCIDENT_STATUS[i.status].tone}>{INCIDENT_STATUS[i.status].label}</Badge>
                  <span className="ml-auto text-xs text-gray-400">{formatDateTime(i.openedAt)}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-800">{i.type}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{i.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {mission ? `Mission ${mission.reference}` : 'Sans mission liée'} · ouvert par {i.openedBy}
                  </span>
                  <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => setSelected(i)}>
                    Ouvrir la fiche
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <IncidentDetail incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
