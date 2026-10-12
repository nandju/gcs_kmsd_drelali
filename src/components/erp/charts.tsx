'use client';

// Graphiques SVG simples et lisibles, alimentés par les données de démonstration.
import { formatNumber } from '@/lib/erp/format';
import type { Tone } from '@/lib/erp/labels';

const TONE_COLORS: Record<Tone, string> = {
  gray: '#9ca3af',
  blue: '#3b82f6',
  amber: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
  violet: '#8b5cf6',
  cyan: '#0e7490',
};

export function BarChart({
  data,
  height = 180,
}: {
  data: { label: string; value: number; tone?: Tone }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1 h-full">
            <span className="text-xs font-medium text-gray-600">{formatNumber(d.value)}</span>
            <div
              className="w-full max-w-12 rounded-t-md transition-all"
              style={{
                height: `${Math.max(3, (d.value / max) * (height - 40))}px`,
                backgroundColor: TONE_COLORS[d.tone ?? 'cyan'],
                opacity: 0.85,
              }}
              title={`${d.label} : ${formatNumber(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-xs text-gray-500" title={d.label}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({
  data,
  size = 150,
}: {
  data: { label: string; value: number; tone: Tone }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return <p className="text-sm text-gray-400">Aucune donnée à afficher.</p>;
  }
  const r = 40;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Répartition">
        {data.map((d) => {
          const frac = d.value / total;
          const dash = frac * circumference;
          const el = (
            <circle
              key={d.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={TONE_COLORS[d.tone]}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="50" y="54" textAnchor="middle" className="fill-gray-800" fontSize="16" fontWeight="700">
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-gray-600">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: TONE_COLORS[d.tone] }} />
            {d.label}
            <span className="font-semibold text-gray-800">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineChart({
  data,
  height = 160,
  color = '#0e7490',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return <p className="text-sm text-gray-400">Aucune donnée.</p>;
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100;
  const h = 40;
  const points = data.map((d, i) => ({
    x: data.length === 1 ? w / 2 : (i / (data.length - 1)) * w,
    y: h - (d.value / max) * (h - 6) - 2,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
        role="img"
        aria-label="Évolution"
      >
        <path d={`${path} L${w},${h} L0,${h} Z`} fill={color} opacity="0.08" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.6" fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
