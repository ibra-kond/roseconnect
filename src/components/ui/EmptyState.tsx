import type { ReactNode } from 'react';

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card bg-white px-6 py-8 text-center shadow-soft">
      <span aria-hidden="true" className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-pink-50 text-plum-700">
        {icon}
      </span>
      <p className="font-heading text-lg font-extrabold">{title}</p>
      {text && <p className="mt-1 text-ink-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
