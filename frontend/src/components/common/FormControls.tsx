import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return <label className="field">{label && <span>{label}</span>}<select className="select" {...props}>{children}</select></label>;
}

export function TextArea({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return <label className="field">{label && <span>{label}</span>}<textarea className="textarea" {...props} /></label>;
}

export function Tabs({ value, onChange, items }: { value: string; onChange: (value: string) => void; items: Array<{ value: string; label: string; badge?: number }> }) {
  return <div className="tabs" role="tablist">{items.map((item) => <button key={item.value} type="button" className={value === item.value ? 'active' : ''} onClick={() => onChange(item.value)}>{item.label}{item.badge !== undefined && <span>{item.badge}</span>}</button>)}</div>;
}

export function InlineNotice({ tone = 'info', children }: { tone?: 'info' | 'success' | 'error' | 'warning'; children: ReactNode }) {
  return <div className={`notice ${tone}`}>{children}</div>;
}
