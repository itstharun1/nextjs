import dynamic from "next/dynamic";

export default function MiniAnalytics() {
  // static demo values for safe hydration
  const revenue = "124,000";
  const occupancy = 72;
  const data = [40, 60, 72, 80, 68, 76, 92];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-black/70">Monthly revenue</div>
          <div className="text-lg font-bold text-black">₹ {revenue}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-black/70">Occupancy</div>
          <div className="text-lg font-semibold text-black">{occupancy}%</div>
        </div>
      </div>

      <div className="mt-3 h-20 flex items-end gap-2">
        {data.map((h, i) => (
          <div key={i} className="w-2 bg-black/80 rounded-sm" style={{ height: `${h}px` }} />
        ))}
      </div>

      <div className="text-xs mt-2 text-black/60">Trends shown for last 7 periods • Exportable CSV/PDF</div>
    </div>
  );
}
