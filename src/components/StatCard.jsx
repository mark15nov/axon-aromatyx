export function StatCard({ label, value, unit, sub, accent = false, danger = false, warn = false, icon: Icon }) {
  const tone = danger
    ? { ring: 'before:bg-signal-alert', num: 'text-signal-alert' }
    : warn
    ? { ring: 'before:bg-signal-warn', num: 'text-signal-warn' }
    : accent
    ? { ring: 'before:bg-steel-500', num: 'text-ink-50' }
    : { ring: 'before:bg-ink-700', num: 'text-ink-50' }

  return (
    <div
      className={`panel relative overflow-hidden hover:shadow-card transition-shadow before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[3px] before:rounded-r-full ${tone.ring}`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between mb-2">
          <div className="stat-label">{label}</div>
          {Icon && <Icon size={14} className="text-ink-400" strokeWidth={1.75} />}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`stat-num text-[28px] leading-none ${tone.num}`}>{value}</span>
          {unit && <span className="font-mono text-[11px] text-ink-400">{unit}</span>}
        </div>
        {sub && <div className="mt-1.5 text-[11.5px] text-ink-400">{sub}</div>}
      </div>
    </div>
  )
}
