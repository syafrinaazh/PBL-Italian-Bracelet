import { revenue } from "@/lib/data";

export default function RevenueChart() {
  const W = 560, H = 210, pl = 20, pr = 20, pt = 20, pb = 30;
  const max = Math.max(...revenue.values) * 1.1;
  const x = (i: number) => pl + (i * (W - pl - pr)) / (revenue.values.length - 1);
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max);
  const pts = revenue.values.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grafik pendapatan 7 hari terakhir">
      <polygon points={`${pl},${H - pb} ${line} ${W - pr},${H - pb}`} fill="#F3E4DE" />
      <polyline points={line} fill="none" stroke="#5C3A32" strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#5C3A32" />)}
      {revenue.labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 8} textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}