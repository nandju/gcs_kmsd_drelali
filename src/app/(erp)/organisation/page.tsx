'use client';

import { useState } from 'react';
import { ORG_LIST } from '@/config/organizations';
import { useErp } from '@/context/erp-store';
import { Badge, Button, Card, DemoNotice, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { toast } from 'sonner';

export default function OrganizationPage() {
  const { org } = useErp();
  const [form, setForm] = useState({ contact: '', address: '', phone: '', email: '' });

  return (
    <div>
      <PageHeader title="Organisation" subtitle="Configuration multi-entreprises — centralisée dans src/config/organizations.ts." />
      <DemoNotice />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Espaces</h2>
          {ORG_LIST.map((o) => (
            <Card key={o.code} className={o.code === org ? 'border-cyan-700/50 ring-1 ring-cyan-700/30' : ''}>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: o.accentColor }} />
                <span className="text-sm font-semibold text-gray-800">{o.displayName}</span>
                {o.code === org && <Badge tone="cyan">Actif</Badge>}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">{o.description}</p>
              <p className="mt-1 text-xs text-gray-400">{o.country} · Devise : {o.currency} · {o.timezone}</p>
              {o.legalNote && <p className="mt-1 text-[11px] italic text-amber-600">{o.legalNote}</p>}
            </Card>
          ))}
        </div>
        <div className="lg:col-span-2">
          <Card title="Profil société — GCS (formulaire de démonstration)">
            <p className="mb-4 text-xs text-gray-400">Emplacements prévus pour le logo et les informations légales — charte graphique non fournie.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom commercial"><input className={inputClass} defaultValue="GCS — Côte d’Ivoire" /></Field>
              <Field label="Téléphone"><input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+225 …" /></Field>
              <Field label="Adresse"><input className={inputClass} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Abidjan" /></Field>
              <Field label="E-mail"><input className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => toast.success('Profil enregistré localement (démonstration, sans backend).')}>Enregistrer</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
