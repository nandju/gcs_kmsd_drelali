'use client';

// Interface chauffeur mobile — simplifiée, utilisable d'une main.
// Aucune donnée financière sensible (marges, prix planchers) n'est affichée.
import Link from 'next/link';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { formatDateTime } from '@/lib/erp/format';
import { MISSION_STATUS } from '@/lib/erp/labels';
import type { Mission } from '@/lib/erp/types';
import { Badge, Button, Field, inputClass } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';
import { RequireOrg } from '@/components/auth/require-org';

function DriverMissionCard({ mission, driverName }: { mission: Mission; driverName: string }) {
  const s = useErp();
  const [proofOpen, setProofOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [proof, setProof] = useState({ receiverName: '', comment: '', result: 'LIVRE', fileName: '', type: 'PHOTO' });
  const [expense, setExpense] = useState({ category: 'Carburant', description: '', amount: 0 });
  const [incident, setIncident] = useState({ type: 'Panne véhicule', priority: 'HAUTE', description: '' });

  const contact = s.contacts.find((c) => c.id === mission.contactId);
  const vehicle = s.vehicles.find((v) => v.id === mission.vehicleId);
  const proofs = s.proofs.filter((p) => p.missionId === mission.id);

  // Les actions disponibles dépendent du statut (préconditions simulées).
  const actions: { label: string; action: Parameters<typeof s.missionAction>[1]; variant?: 'primary' | 'secondary' }[] = [];
  if (mission.status === 'AFFECTEE' || mission.status === 'PLANIFIEE') {
    actions.push({ label: '▶ Démarrer la mission', action: 'DEMARRER' });
  }
  if (mission.status === 'EN_COURS') {
    actions.push({ label: 'Signaler l’arrivée', action: 'ARRIVEE', variant: 'secondary' });
    actions.push({ label: 'Confirmer le chargement', action: 'CHARGEMENT', variant: 'secondary' });
    actions.push({ label: 'Signaler le départ', action: 'DEPART', variant: 'secondary' });
    actions.push({ label: '✔ Terminer la mission', action: 'TERMINER' });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold text-gray-900">{mission.reference}</span>
        <Badge tone={MISSION_STATUS[mission.status].tone}>{MISSION_STATUS[mission.status].label}</Badge>
      </div>
      <p className="mt-1 text-sm text-gray-600">{mission.service}</p>
      <div className="mt-3 space-y-1.5 rounded-xl bg-gray-50 p-3 text-sm">
        <p><span className="text-gray-400">Client : </span><span className="font-medium">{contact?.name}</span> · {contact?.phone}</p>
        <p><span className="text-gray-400">Trajet : </span><span className="font-medium">{mission.origin} → {mission.destination}</span></p>
        <p><span className="text-gray-400">Prévu : </span>{formatDateTime(mission.plannedDate)}</p>
        {vehicle && <p><span className="text-gray-400">Véhicule : </span>{vehicle.name}</p>}
        {mission.instructions && <p className="text-gray-600"><span className="text-gray-400">Consignes : </span>{mission.instructions}</p>}
      </div>

      {mission.status === 'EN_COURS' && (
        <p className="mt-2 text-xs text-gray-500">
          Preuves attendues : photo de livraison et nom du réceptionnaire. Preuves enregistrées : {proofs.length}.
        </p>
      )}

      <div className="mt-3 grid gap-2">
        {actions.map((a) => (
          <Button key={a.action} variant={a.variant ?? 'primary'} className="w-full py-3 text-base" onClick={() => s.missionAction(mission.id, a.action)}>
            {a.label}
          </Button>
        ))}
        {mission.status === 'EN_COURS' && (
          <Button variant="secondary" className="w-full py-3 text-base" onClick={() => setProofOpen(true)}>
            📷 Enregistrer une livraison / preuve
          </Button>
        )}
        {(mission.status === 'EN_COURS' || mission.status === 'AFFECTEE') && (
          <>
            <Button variant="secondary" className="w-full py-3 text-base" onClick={() => setExpenseOpen(true)}>
              Soumettre une dépense
            </Button>
            <Button variant="danger" className="w-full py-3 text-base" onClick={() => setIncidentOpen(true)}>
              ⚠ Signaler un problème
            </Button>
          </>
        )}
        {actions.length === 0 && mission.status !== 'EN_COURS' && mission.status !== 'AFFECTEE' && (
          <p className="rounded-xl bg-gray-50 p-3 text-center text-sm text-gray-500">
            Aucune action terrain disponible dans ce statut.
          </p>
        )}
      </div>

      {/* Preuve */}
      <Modal isOpen={proofOpen} onClose={() => setProofOpen(false)} title="Preuve de livraison" description="Enregistrement local de démonstration — sans stockage serveur ni géolocalisation." className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}>
        <div className="mt-4 space-y-3">
          <Field label="Nom du réceptionnaire" required>
            <input className={inputClass} value={proof.receiverName} onChange={(e) => setProof((p) => ({ ...p, receiverName: e.target.value }))} />
          </Field>
          <Field label="Type de preuve">
            <select className={inputClass} value={proof.type} onChange={(e) => setProof((p) => ({ ...p, type: e.target.value }))}>
              <option value="PHOTO">Photo</option>
              <option value="SIGNATURE">Signature</option>
              <option value="CODE">Code de confirmation</option>
              <option value="DOCUMENT">Document signé</option>
            </select>
          </Field>
          <Field label="Résultat de livraison">
            <select className={inputClass} value={proof.result} onChange={(e) => setProof((p) => ({ ...p, result: e.target.value }))}>
              <option value="LIVRE">Livré</option>
              <option value="LIVRE_AVEC_RESERVE">Livré avec réserve</option>
              <option value="REFUSE">Refusé</option>
            </select>
          </Field>
          <Field label="Photo (nom de fichier simulé)" hint="L’ajout de pièce jointe est simulé.">
            <input className={inputClass} value={proof.fileName} onChange={(e) => setProof((p) => ({ ...p, fileName: e.target.value }))} placeholder="ex. photo-livraison.jpg" />
          </Field>
          <Field label="Commentaire">
            <textarea className={inputClass} rows={2} value={proof.comment} onChange={(e) => setProof((p) => ({ ...p, comment: e.target.value }))} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setProofOpen(false)}>Annuler</Button>
          <Button
            disabled={!proof.receiverName.trim()}
            onClick={() => {
              s.addProof({
                missionId: mission.id,
                type: proof.type as 'PHOTO' | 'SIGNATURE' | 'DOCUMENT' | 'CODE',
                receiverName: proof.receiverName.trim(),
                at: new Date().toISOString(),
                comment: proof.comment || undefined,
                fileName: proof.fileName || undefined,
                result: proof.result as 'LIVRE' | 'LIVRE_AVEC_RESERVE' | 'REFUSE',
              });
              setProofOpen(false);
            }}
          >
            Enregistrer
          </Button>
        </div>
      </Modal>

      {/* Dépense */}
      <Modal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} title="Soumettre une dépense" description="La dépense sera soumise à validation — elle n’entre pas dans la marge tant qu’elle n’est pas validée." className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}>
        <div className="mt-4 space-y-3">
          <Field label="Catégorie">
            <select className={inputClass} value={expense.category} onChange={(e) => setExpense((x) => ({ ...x, category: e.target.value }))}>
              {['Carburant', 'Péage', 'Manutention', 'Stationnement', 'Réparation', 'Divers'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Montant (XOF)" required>
            <input type="number" min={1} className={inputClass} value={expense.amount || ''} onChange={(e) => setExpense((x) => ({ ...x, amount: parseInt(e.target.value) || 0 }))} />
          </Field>
          <Field label="Description" required>
            <textarea className={inputClass} rows={2} value={expense.description} onChange={(e) => setExpense((x) => ({ ...x, description: e.target.value }))} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setExpenseOpen(false)}>Annuler</Button>
          <Button
            disabled={expense.amount <= 0 || !expense.description.trim()}
            onClick={() => {
              s.addExpense({
                missionId: mission.id,
                category: expense.category,
                description: expense.description.trim(),
                amount: expense.amount,
                currency: 'XOF',
                agent: driverName,
                date: new Date().toISOString(),
              });
              setExpenseOpen(false);
              setExpense({ category: 'Carburant', description: '', amount: 0 });
            }}
          >
            Soumettre
          </Button>
        </div>
      </Modal>

      {/* Incident */}
      <Modal isOpen={incidentOpen} onClose={() => setIncidentOpen(false)} title="Signaler un problème" className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}>
        <div className="mt-4 space-y-3">
          <Field label="Type de problème">
            <select className={inputClass} value={incident.type} onChange={(e) => setIncident((x) => ({ ...x, type: e.target.value }))}>
              {['Panne véhicule', 'Retard de chargement', 'Accident', 'Marchandise endommagée', 'Client absent', 'Autre'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Priorité">
            <select className={inputClass} value={incident.priority} onChange={(e) => setIncident((x) => ({ ...x, priority: e.target.value }))}>
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </Field>
          <Field label="Description" required>
            <textarea className={inputClass} rows={3} value={incident.description} onChange={(e) => setIncident((x) => ({ ...x, description: e.target.value }))} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIncidentOpen(false)}>Annuler</Button>
          <Button
            variant="danger"
            disabled={!incident.description.trim()}
            onClick={() => {
              s.addIncident({
                missionId: mission.id,
                type: incident.type,
                priority: incident.priority as 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE',
                description: incident.description.trim(),
                status: 'OUVERT',
                openedBy: driverName,
              });
              setIncidentOpen(false);
              setIncident({ type: 'Panne véhicule', priority: 'HAUTE', description: '' });
            }}
          >
            Signaler
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function DriverPageContent() {
  const s = useErp();
  const [driverId, setDriverId] = useState('d1');
  const driver = s.drivers.find((d) => d.id === driverId);

  const myMissions = s.missions.filter(
    (m) => m.driverId === driverId && !['CLOTUREE', 'ANNULEE', 'CONTROLEE'].includes(m.status),
  );
  const today = myMissions.filter((m) => new Date(m.plannedDate).toDateString() === new Date().toDateString());
  const others = myMissions.filter((m) => !today.includes(m));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-md px-4 pb-10">
        <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">Espace chauffeur GCS</p>
              <p className="text-xs text-gray-400">Mode démonstration — données fictives</p>
            </div>
            <Link href="/tableau-de-bord" className="text-xs font-medium text-cyan-700 hover:underline">
              ← Retour bureau
            </Link>
          </div>
          <select
            className={`${inputClass} mt-2`}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            aria-label="Choisir le chauffeur de démonstration"
          >
            {s.drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.phone}</option>
            ))}
          </select>
        </header>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Ma mission du jour</h2>
        {today.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-400">
            Aucune mission prévue aujourd’hui.
          </div>
        ) : (
          <div className="space-y-3">
            {today.map((m) => <DriverMissionCard key={m.id} mission={m} driverName={driver?.name ?? ''} />)}
          </div>
        )}

        <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">Mes autres missions</h2>
        {others.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-400">
            Aucune autre mission affectée.
          </div>
        ) : (
          <div className="space-y-3">
            {others.map((m) => <DriverMissionCard key={m.id} mission={m} driverName={driver?.name ?? ''} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriverPage() {
  return (
    <RequireOrg>
      <DriverPageContent />
    </RequireOrg>
  );
}
