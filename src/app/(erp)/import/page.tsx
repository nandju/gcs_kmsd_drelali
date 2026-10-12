import { ComingSoon, PageHeader } from '@/components/erp/ui';

export default function ImportPage() {
  return (
    <div>
      <PageHeader title="Import de contacts" />
      <ComingSoon
        module="Import de contacts — prévu dans une prochaine version"
        items={['Fichier CSV', 'Correspondance des colonnes', 'Détection de doublons', 'Aperçu avant import']}
      />
    </div>
  );
}
