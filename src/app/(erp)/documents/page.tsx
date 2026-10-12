import { ComingSoon, PageHeader } from '@/components/erp/ui';

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader title="Documents" />
      <ComingSoon
        module="Bibliothèque documentaire — prévue dans une prochaine version"
        items={['Contrats', 'Bordereaux', 'Pièces jointes de preuves', 'Documents de transport']}
      />
    </div>
  );
}
