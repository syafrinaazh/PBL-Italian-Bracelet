type BestSellerChartProps = {
  charms: { name: string; qty: number; dark: boolean }[];
};

export default function BestSellerChart({ charms }: BestSellerChartProps) {
  if (charms.length === 0) {
    return <p style={{ textAlign: "center", padding: "40px 0" }}>Belum ada penjualan.</p>;
  }
  const W = 300, H = 210, pb = 34, pt = 24, gap = 14;
  const bw = (W - gap * (charms.length + 1)) / charms.length;
  const max = Math.max(1, ...charms.map((c) => c.qty));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grafik charm terlaris">
      {charms.map((c, i) => {
        const h = ((H - pb - pt) * c.qty) / max;
        const bx = gap + i * (bw + gap);
        const by = H - pb - h;
        return (
          <g key={c.name}>
            <rect x={bx} y={by} width={bw} height={h} rx="3" fill={c.dark ? "#5C3A32" : "#D9A89A"} />
            <text x={bx + bw / 2} y={by - 6} textAnchor="middle" style={{ fill: "#2B1B17", fontWeight: 700 }}>{c.qty}</text>
            <text x={bx + bw / 2} y={H - 12} textAnchor="middle">{c.name}</text>
          </g>
        );
      })}
    </svg>
  );
}