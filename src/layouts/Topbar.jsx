import { Search, Bell } from 'lucide-react'

export function Topbar({ module, code, description }) {
  const now = new Date().toLocaleString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <header className="h-16 border-b border-ink-800 bg-ink-950/70 backdrop-blur-md relative z-10 flex items-center px-6 gap-6">
      {/* Module crumb */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.18em] bg-ink-850 px-2 py-1 rounded-md">
          {code || '00'}
        </span>
        <h1 className="font-display font-semibold text-ink-50 text-[20px] tracking-tight truncate">{module}</h1>
        {description && (
          <span className="text-[12.5px] text-ink-400 hidden md:inline truncate border-l border-ink-800 pl-3 ml-1">
            {description}
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full w-72 focus-within:border-steel-400 focus-within:shadow-focus transition-all">
        <Search size={14} strokeWidth={2} className="text-ink-400" />
        <input
          type="text"
          placeholder="Buscar en todo el sistema..."
          className="bg-transparent flex-1 outline-none text-[13px] placeholder:text-ink-400 text-ink-100"
        />
        <span className="font-mono text-[10px] text-ink-400 bg-ink-850 border border-ink-800 px-1.5 py-0.5 rounded-md">⌘K</span>
      </div>

      {/* Time */}
      <div className="hidden lg:block font-mono text-[11px] text-ink-300 tabular-nums">
        {now}
      </div>

      {/* Bell */}
      <button className="relative w-10 h-10 rounded-full text-ink-200 hover:text-ink-50 hover:bg-ink-850 border border-transparent hover:border-ink-800 transition-all flex items-center justify-center">
        <Bell size={17} strokeWidth={1.75} />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-signal-alert rounded-full pulse-dot ring-2 ring-ink-950" />
      </button>
    </header>
  )
}
