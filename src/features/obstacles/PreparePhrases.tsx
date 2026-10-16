import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { DOCTOR_PHRASES } from '@/data/obstacles';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';

/** « Préparer ce que je vais dire au médecin ». */
export function PreparePhrases() {
  const toast = useUiStore((s) => s.toast);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DOCTOR_PHRASES.join('\n'));
      toast(strings.tracking.prepareCopied);
    } catch {
      toast('Copie impossible sur cet appareil. Vous pouvez faire une capture d’écran.', 'info');
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {DOCTOR_PHRASES.map((p) => (
          <li key={p} className="flex gap-3 rounded-card bg-white p-3 shadow-soft">
            <MessageCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-plum-700" />
            <span>« {p} »</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" onClick={copy} block>
        {strings.tracking.prepareCopy}
      </Button>
    </div>
  );
}
