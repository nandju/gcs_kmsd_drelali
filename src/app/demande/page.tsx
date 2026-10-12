'use client';

// Page publique de demande de service — GCS.
// Prête à être connectée à une API ; en démonstration, la demande crée un
// prospect local dans le store (visible dans l'espace Prospects).
import Link from 'next/link';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { ORGANIZATIONS } from '@/config/organizations';
import { Button, Field, inputClass } from '@/components/erp/ui';

const SERVICES = [
  'Transport de marchandises',
  'Déménagement résidentiel',
  'Distribution de produits',
  'Entreposage',
  'Transport express / urgent',
  'Autre service',
];

export default function PublicRequestPage() {
  const { submitPublicRequest } = useErp();
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', email: '', service: SERVICES[0],
    origin: '', destination: '', description: '', volume: '', wishedDate: '',
    comment: '', photoName: '',
  });
  const org = ORGANIZATIONS.GCS;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Votre nom est obligatoire.';
    if (!form.phone.trim()) errs.phone = 'Un numéro de téléphone est obligatoire.';
    if (!form.description.trim()) errs.description = 'Décrivez votre besoin.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Adresse e-mail invalide.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    submitPublicRequest({
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      service: form.service,
      origin: form.origin || undefined,
      destination: form.destination || undefined,
      description: form.description.trim(),
      volume: form.volume || undefined,
      wishedDate: form.wishedDate || undefined,
      comment: form.comment || undefined,
      photoName: form.photoName || undefined,
    });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <header className="mb-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: org.accentColor }}>
            GC
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Demande de prestation — GCS</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transmettez votre demande de transport, distribution ou entreposage en Côte d’Ivoire.
          </p>
        </header>

        {sent ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-theme-xs">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Demande bien reçue</h2>
            <p className="mt-2 text-sm text-gray-600">
              Votre demande a été enregistrée en mode démonstration. Notre équipe vous recontactera.
            </p>
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Cette demande ne constitue ni une cotation acceptée, ni une réservation ferme,
              ni une preuve de prise en charge physique.
            </p>
            <Link href="/demande" onClick={() => setSent(false)} className="mt-4 inline-block text-sm font-medium text-cyan-700 hover:underline">
              Soumettre une autre demande
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom" required error={errors.name}>
                <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Nom ou société" />
              </Field>
              <Field label="Téléphone" required error={errors.phone}>
                <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+225 …" />
              </Field>
              <Field label="WhatsApp">
                <input className={inputClass} value={form.whatsapp} onChange={set('whatsapp')} />
              </Field>
              <Field label="E-mail (facultatif)" error={errors.email}>
                <input className={inputClass} value={form.email} onChange={set('email')} />
              </Field>
              <Field label="Service souhaité" required>
                <select className={inputClass} value={form.service} onChange={set('service')}>
                  {SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Date souhaitée">
                <input type="date" className={inputClass} value={form.wishedDate} onChange={set('wishedDate')} />
              </Field>
              <Field label="Origine">
                <input className={inputClass} value={form.origin} onChange={set('origin')} placeholder="ex. Abidjan — Zone 4" />
              </Field>
              <Field label="Destination">
                <input className={inputClass} value={form.destination} onChange={set('destination')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description des marchandises ou du service" required error={errors.description}>
                  <textarea className={inputClass} rows={3} value={form.description} onChange={set('description')} placeholder="Décrivez ce que vous souhaitez transporter ou le service attendu…" />
                </Field>
              </div>
              <Field label="Quantité ou volume (facultatif)">
                <input className={inputClass} value={form.volume} onChange={set('volume')} placeholder="ex. 2 palettes, 12 cartons" />
              </Field>
              <Field label="Photo (facultative)" hint="Simulée en démonstration — nom de fichier uniquement.">
                <input className={inputClass} value={form.photoName} onChange={set('photoName')} placeholder="ex. marchandises.jpg" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Commentaire">
                  <textarea className={inputClass} rows={2} value={form.comment} onChange={set('comment')} />
                </Field>
              </div>
            </div>
            <Button type="submit" className="mt-5 w-full py-3 text-base">
              Envoyer ma demande
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
              Démonstration : la soumission crée une demande locale et n’envoie aucune donnée vers un serveur.
              Elle ne constitue ni une cotation acceptée, ni une réservation ferme, ni une prise en charge.
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          <Link href="/tableau-de-bord" className="text-cyan-700 hover:underline">Espace de gestion GCS</Link>
        </p>
      </div>
    </div>
  );
}
