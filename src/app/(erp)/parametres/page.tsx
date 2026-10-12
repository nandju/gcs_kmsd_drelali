'use client';

import { useState } from 'react';
import { Badge, Button, Card, DemoNotice, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [floorRule, setFloorRule] = useState(80);
  const [validity, setValidity] = useState(30);
  const [signatureRequired, setSignatureRequired] = useState(true);

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Paramètres métier de démonstration — stockés localement, aucune persistance serveur." />
      <DemoNotice />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Règles commerciales">
          <div className="space-y-4">
            <Field label="Prix plancher (% du prix commercial)" hint="En dessous de ce seuil, une autorisation de direction est requise (règle paramétrable de démonstration).">
              <input type="number" min={0} max={100} className={inputClass} value={floorRule} onChange={(e) => setFloorRule(parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Validité par défaut des cotations (jours)">
              <input type="number" min={1} className={inputClass} value={validity} onChange={(e) => setValidity(parseInt(e.target.value) || 30)} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
              <span className="text-sm text-gray-700">Signature obligatoire à la livraison</span>
              <button
                role="switch"
                aria-checked={signatureRequired}
                onClick={() => setSignatureRequired((v) => !v)}
                className={`h-6 w-11 rounded-full transition ${signatureRequired ? 'bg-cyan-700' : 'bg-gray-300'}`}
              >
                <span className={`block size-5 rounded-full bg-white shadow transition ${signatureRequired ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <Button onClick={() => toast.success('Paramètres enregistrés localement (démonstration).')}>Enregistrer</Button>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Modes de paiement autorisés">
            <ul className="space-y-2 text-sm text-gray-600">
              {['Espèces', 'Virement bancaire', 'Mobile money', 'Autre moyen autorisé'].map((m) => (
                <li key={m} className="flex items-center justify-between">
                  {m}
                  <Badge tone="green">Actif</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400">Options d’interface uniquement — aucune intégration de paiement réelle.</p>
          </Card>
          <Card title="Informations techniques">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Mode</dt><dd className="font-medium">Démonstration frontend</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Persistance</dt><dd className="font-medium">Mémoire locale uniquement</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Backend</dt><dd className="font-medium">Non connecté (prévu ultérieurement)</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
