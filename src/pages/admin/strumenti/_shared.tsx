import { ReactNode } from 'react';
import { Slider } from '@/components/ui/slider';

export const fmtEur = (n: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

export const fmtPct = (n: number) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;

export const fmtNum = (n: number, d = 0) =>
  new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number.isFinite(n) ? n : 0);

export function ToolPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1
          className="font-heading text-[26px] leading-tight"
          style={{ color: '#3B2314' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] mt-1" style={{ color: '#8A7060' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function ToolCard({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 ${className}`}
      style={{ borderColor: 'rgba(59,35,20,0.10)' }}
    >
      {title && (
        <h3
          className="text-[12px] uppercase tracking-[0.12em] mb-4"
          style={{ color: '#8A7060' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'gold' | 'green' | 'red' | 'neutral';
}) {
  const color =
    accent === 'gold'
      ? '#C8A96E'
      : accent === 'green'
        ? '#3F7A4E'
        : accent === 'red'
          ? '#A8443C'
          : '#3B2314';
  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'rgba(59,35,20,0.10)', background: '#FFFFFF' }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.12em] mb-1"
        style={{ color: '#8A7060' }}
      >
        {label}
      </div>
      <div className="font-heading text-[22px]" style={{ color }}>
        {value}
      </div>
      {hint && (
        <div className="text-[11px] mt-1" style={{ color: '#8A7060' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '€',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[13px]" style={{ color: '#3B2314' }}>
          {label}
        </label>
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: '#3B2314' }}
        >
          {suffix === '€' ? fmtEur(value) : `${fmtNum(value, step < 1 ? 2 : 0)} ${suffix}`}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
