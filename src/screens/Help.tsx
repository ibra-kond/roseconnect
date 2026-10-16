import { useSearchParams } from 'react-router-dom';
import { Hospital, MessageCircleHeart } from 'lucide-react';
import { SegmentedControl } from '@/components/ui';
import { FacilitiesList } from './help/FacilitiesList';
import { ChatWindow } from '@/features/chatbot/ChatWindow';
import { FACILITY_TYPES, isCity, type FacilityType } from '@/data/facilities';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const S = strings.help;
type Tab = 'discuter' | 'structures';

export default function Help() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('onglet') === 'structures' ? 'structures' : 'discuter';
  const villeParam = params.get('ville') ?? '';
  const typeParam = params.get('type') ?? '';
  const city = isCity(villeParam) ? villeParam : null;
  const type = typeParam in FACILITY_TYPES ? (typeParam as FacilityType) : null;
  const query = params.get('q') ?? '';

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  return (
    <div className={cn('container-app flex flex-col gap-4 py-4', tab === 'structures' && 'lg:max-w-5xl')}>
      <h1 className="text-2xl">{S.title}</h1>
      <div className="lg:max-w-md">
        <SegmentedControl<Tab>
          idPrefix="help"
          label={S.tabsLabel}
          value={tab}
          onChange={(v) => update({ onglet: v })}
          segments={[
            { value: 'discuter', label: S.tabChat, icon: <MessageCircleHeart aria-hidden="true" className="hidden h-5 w-5 min-[400px]:block" /> },
            { value: 'structures', label: S.tabFacilities, icon: <Hospital aria-hidden="true" className="hidden h-5 w-5 min-[400px]:block" /> },
          ]}
        />
      </div>
      <div className="min-w-0" role="tabpanel" id={`help-panel-${tab}`} aria-labelledby={`help-tab-${tab}`}>
        {tab === 'discuter' ? (
          <ChatWindow />
        ) : (
          <FacilitiesList
            city={city}
            type={type}
            query={query}
            onChange={(n) =>
              update({
                ...(n.city !== undefined && { ville: n.city }),
                ...(n.type !== undefined && { type: n.type }),
                ...(n.query !== undefined && { q: n.query }),
              })
            }
          />
        )}
      </div>
    </div>
  );
}
