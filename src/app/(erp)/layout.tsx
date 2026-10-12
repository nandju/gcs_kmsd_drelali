import { ErpShell } from '@/components/erp/shell/shell';
import type { ReactNode } from 'react';

export default function ErpLayout({ children }: { children: ReactNode }) {
  return <ErpShell>{children}</ErpShell>;
}
