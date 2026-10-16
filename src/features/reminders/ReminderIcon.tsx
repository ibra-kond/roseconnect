import { Hand, ScanSearch } from 'lucide-react';
import type { ReminderKind } from '@/store/useAppStore';

export function ReminderIcon({ kind, className = 'h-5 w-5' }: { kind: ReminderKind; className?: string }) {
  if (kind === 'self-exam') return <Hand aria-hidden="true" className={className} />;
  return <ScanSearch aria-hidden="true" className={className} />;
}
