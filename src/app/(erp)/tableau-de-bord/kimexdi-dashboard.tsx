'use client';

// Tableau de bord KIMEXDI : pilotage de la plateforme publique —
// formulaires configurables, demandes reçues, activité récente.
// Les KPI sont calculés à partir du store de formulaires (démonstration).

import Link from 'next/link';
import { useMemo } from 'react';
import { ORGANIZATIONS, FUTURE_MODULES } from '@/config/organizations';
import { useForms } from '@/context/forms-store';
import { publishedVersion } from '@/modules/forms/logic';
import {
  FORM_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
  type SubmissionStatus,
} from '@/modules/forms/types';
import { formatDateTime } from '@/lib/erp/format';
import {
  Badge,
  Card,
  ComingSoon,
  DemoNotice,
  EmptyState,
  LinkButton,
  PageHeader,
} from '@/components/erp/ui';
import { DonutChart } from '@/components/erp/charts';
import type { Tone } from '@/lib/erp/labels';

const STATUS_TONE: Record<SubmissionStatus, Tone> = {
  NOUVELLE: 'blue',
  EN_TRAITEMENT: 'amber',
  TRAITEE: 'green',
  ARCHIVEE: 'gray',
};

function Kpi({
  label,
  value,
  sub,
  href,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  sub?: string;
  href: string;
  tone?: Tone;
}) {
  const toneBar: Record<Tone, string> = {
    gray: 'bg-gray-400',
    blue: 'bg-[#1769aa]',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-700',
  };
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs transition hover:border-[#1769aa]/40 hover:shadow-theme-sm"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${toneBar[tone]}`} />
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1.5 text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1769aa] opacity-0 transition group-hover:opacity-100">
        Voir le détail →
      </span>
    </Link>
  );
}

export function KimexdiDashboard() {
  const org = ORGANIZATIONS.KIMEXDI;
  const { forms, submissions, auditEvents, hydrated } = useForms();

  const data = useMemo(() => {
    const orgForms = forms.filter((f) => f.org === 'KIMEXDI');
    const orgSubs = submissions.filter((s) => s.org === 'KIMEXDI');
    const published = orgForms.filter((f) => f.status === 'PUBLIE');
    const drafts = orgForms.filter((f) => f.status === 'BROUILLON');
    const byStatus = (st: SubmissionStatus) => orgSubs.filter((s) => s.status === st);
    return {
      orgForms,
      orgSubs,
      published,
      drafts,
      nouvelles: byStatus('NOUVELLE'),
      enTraitement: byStatus('EN_TRAITEMENT'),
      traitees: byStatus('TRAITEE'),
      archivees: byStatus('ARCHIVEE'),
      events: auditEvents.filter((e) => e.org === 'KIMEXDI').slice(0, 8),
      recentSubs: orgSubs.slice(0, 6),
    };
  }, [forms, submissions, auditEvents]);

  return (
    <div>
      <PageHeader
        title={org.displayName}
        subtitle={org.description}
        action={
          <>
            <LinkButton href="/formulaires" variant="secondary">
              Gérer les formulaires
            </LinkButton>
            <LinkButton href="/kimexdi" variant="primary">
              Voir le site public ↗
            </LinkButton>
          </>
        }
      />
      <DemoNotice>
        Espace de démonstration — {org.legalNote ?? 'données fictives.'} Devise : {org.currency}.
        Les demandes et formulaires sont stockés localement (navigateur).
      </DemoNotice>

      {/* KPI plateforme publique */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Nouvelles demandes"
          value={data.nouvelles.length}
          sub="À prendre en charge"
          href="/demandes"
          tone="blue"
        />
        <Kpi
          label="Demandes en traitement"
          value={data.enTraitement.length}
          sub="Dossiers en cours"
          href="/demandes"
          tone="amber"
        />
        <Kpi
          label="Formulaires publiés"
          value={data.published.length}
          sub={`${data.drafts.length} brouillon${data.drafts.length > 1 ? 's' : ''} en préparation`}
          href="/formulaires"
          tone="green"
        />
        <Kpi
          label="Demandes reçues (total)"
          value={data.orgSubs.length}
          sub={`${data.traitees.length} traitée${data.traitees.length > 1 ? 's' : ''}`}
          href="/demandes"
          tone="violet"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Dernières demandes */}
        <Card title="Dernières demandes reçues" className="xl:col-span-2" padded={false}>
          {!hydrated || data.recentSubs.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Aucune demande pour le moment"
                description="Les soumissions du site public KIMEXDI apparaîtront ici."
              />
            </div>
          ) : (
            <ul>
              {data.recentSubs.map((s) => (
                <li key={s.id} className="border-b border-gray-50 last:border-0">
                  <Link
                    href={`/demandes/${s.id}`}
                    className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-50/70 sm:px-5"
                  >
                    <span className="text-sm font-semibold text-[#1769aa]">{s.reference}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-600">
                      {s.formName}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(s.submittedAt)}</span>
                    <Badge tone={STATUS_TONE[s.status]}>
                      {SUBMISSION_STATUS_LABELS[s.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Répartition par statut */}
        <Card title="Demandes par statut">
          {data.orgSubs.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Aucune donnée à afficher.
            </p>
          ) : (
            <DonutChart
              data={[
                { label: 'Nouvelles', value: data.nouvelles.length, tone: 'blue' },
                { label: 'En traitement', value: data.enTraitement.length, tone: 'amber' },
                { label: 'Traitées', value: data.traitees.length, tone: 'green' },
                { label: 'Archivées', value: data.archivees.length, tone: 'gray' },
              ]}
            />
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Formulaires de la plateforme */}
        <Card title="Formulaires KIMEXDI" className="xl:col-span-2" padded={false}>
          {data.orgForms.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Aucun formulaire"
                description="Créez le premier formulaire public de KIMEXDI."
                action={<LinkButton href="/formulaires" variant="primary">Créer un formulaire</LinkButton>}
              />
            </div>
          ) : (
            <ul>
              {data.orgForms.map((f) => {
                const v = publishedVersion(f);
                const subCount = data.orgSubs.filter((s) => s.formId === f.id).length;
                return (
                  <li key={f.id} className="border-b border-gray-50 last:border-0">
                    <Link
                      href={`/formulaires/${f.id}`}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-50/70 sm:px-5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-800">
                          {f.name}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {v ? `Version publiée v${v.version}` : 'Jamais publié'} · {subCount} demande{subCount > 1 ? 's' : ''}
                        </span>
                      </span>
                      <Badge
                        tone={
                          f.status === 'PUBLIE' ? 'green' : f.status === 'BROUILLON' ? 'amber' : 'gray'
                        }
                      >
                        {FORM_STATUS_LABELS[f.status]}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Activité récente */}
        <Card title="Activité récente">
          {data.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucun événement.</p>
          ) : (
            <ul className="space-y-3">
              {data.events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#1769aa]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-700">{e.label}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(e.at)} · {e.actor}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Accès rapides plateforme publique */}
      <Card title="Plateforme publique KIMEXDI" className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Page d’accueil', href: '/kimexdi' },
            { label: 'Services', href: '/kimexdi/services' },
            { label: 'Demande de devis', href: '/kimexdi/devis' },
            { label: 'Contact', href: '/kimexdi/contact' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-[#1769aa]/40 hover:bg-white"
            >
              {l.label}
              <span className="text-[#1769aa]">↗</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Modules métier futurs */}
      <div className="mt-5">
        <ComingSoon
          module="Modules logistiques KIMEXDI prévus dans les prochaines versions"
          items={[...FUTURE_MODULES.KIMEXDI]}
        />
      </div>
    </div>
  );
}
