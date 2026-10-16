import { House } from 'lucide-react';
import { EmptyState, LinkButton } from '@/components/ui';
import { strings } from '@/lib/strings.fr';

export default function NotFound() {
  return (
    <div className="container-app py-8">
      <h1 className="sr-only">{strings.common.notFoundTitle}</h1>
      <EmptyState
        icon={<House className="h-8 w-8" />}
        title={strings.common.notFoundTitle}
        text={strings.common.notFoundText}
        action={<LinkButton to="/">{strings.common.backHome}</LinkButton>}
      />
    </div>
  );
}
