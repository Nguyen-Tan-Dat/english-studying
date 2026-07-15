import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger';

export function Badge({
  children,
  tone = 'neutral'
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={clsx('badge', `badge-${tone}`)}>{children}</span>;
}
