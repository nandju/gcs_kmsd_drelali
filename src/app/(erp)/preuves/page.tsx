'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { formatDateTime } from '@/lib/erp/format';
import { PROOF_RESULT } from '@/lib/erp/labels';
import { Badge, Card, EmptyState, PageHeader } from '@/components/erp/ui';

const TYPE_LABEL: Record<string, string> = {
  PHOTO: 'Photo',
  SIGNATURE: 'Signature',
  DOCUMENT: 'Document',
  CODE: 'Code',
};

export default function ProofsPage() {
  const s = useErp();
  const missionRef = (id: string) => s.missions.find((m) => m.id === id);

  return (
    <div>
      <PageHeader
        title="Livraisons et preuves"
        subtitle="Preuves de livraison remontées du terrain (pièces jointes fictives, sans stockage serveur)."
      />
      {s.proofs.length === 0 ? (
        <EmptyState title="Aucune preuve enregistrée" description="Les preuves sont ajoutées par les chauffeurs depuis l’interface mobile." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {s.proofs.map((p) => {
            const mission = missionRef(p.missionId);
            return (
              <Card key={p.id}>
                <div className="flex flex-wrap items-center gap-2">
                  {mission && (
                    <Link href={`/missions/${mission.id}`} className="text-sm font-semibold text-cyan-800 hover:underline">
                      {mission.reference}
                    </Link>
                  )}
                  <Badge tone="cyan">{TYPE_LABEL[p.type]}</Badge>
                  <Badge tone={PROOF_RESULT[p.result].tone}>{PROOF_RESULT[p.result].label}</Badge>
                  <span className="ml-auto text-xs text-gray-400">{formatDateTime(p.at)}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  {p.receiverName && <span className="font-medium">{p.receiverName} — </span>}
                  {p.comment ?? 'Sans commentaire.'}
                </p>
                {p.fileName && (
                  <p className="mt-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-500">
                    Pièce jointe (démonstration) : {p.fileName}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
