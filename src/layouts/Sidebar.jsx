import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Wallet, MessageSquare,
  Truck, Map, BellRing, Bot, Target, ChevronRight,
} from 'lucide-react'

const MODULES = [
  { to: '/',            label: 'Inicio',      icon: LayoutDashboard, code: '00' },
  { to: '/inventarios', label: 'Inventarios', icon: Package,         code: '01' },
  { to: '/finanzas',    label: 'Finanzas',    icon: Wallet,          code: '02' },
  { to: '/atencion',    label: 'Atención',    icon: MessageSquare,   code: '03' },
  { to: '/logistica',   label: 'Logística',   icon: Truck,           code: '04' },
  { to: '/rutas',       label: 'Rutas',       icon: Map,             code: '05' },
  { to: '/alertas',     label: 'Alertas',     icon: BellRing,        code: '06' },
  { to: '/chat-ia',     label: 'Asistente',   icon: Bot,             code: '07' },
  { to: '/ventas',      label: 'Ventas',      icon: Target,          code: '08' },
]

function BrandMark({ size = 36 }) {
  // Custom mark: a stylized aroma droplet — unique, warm, organic
  return (
    <span
      className="brand-mark rounded-2xl"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" width={size * 0.55} height={size * 0.55} fill="none">
        <path
          d="M16 5c5 4 8 8 8 13a8 8 0 1 1-16 0c0-5 3-9 8-13z"
          fill="currentColor"
          opacity="0.95"
        />
        <circle cx="13" cy="17" r="2" fill="rgba(255,255,255,0.5)" />
      </svg>
    </span>
  )
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-ink-900/60 backdrop-blur-sm border-r border-ink-800 flex flex-col relative z-10">
      {/* Brand */}
      <Link to="/" className="px-5 py-5 flex items-center gap-3 hover:bg-ink-850/60 transition-colors">
        <BrandMark />
        <div className="leading-tight">
          <div className="font-display font-semibold text-ink-50 text-[19px] tracking-tight">Aromatyx</div>
          <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-[0.2em] mt-0.5">Sistema operativo</div>
        </div>
      </Link>

      <div className="px-4">
        <div className="h-px bg-ink-800" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-3">
        <div className="px-2 py-1.5 mb-1">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-400">Módulos</span>
        </div>
        <div className="space-y-0.5">
          {MODULES.map(({ to, label, icon: Icon, code }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                  isActive
                    ? 'bg-steel-600 text-white shadow-card'
                    : 'text-ink-200 hover:text-ink-50 hover:bg-ink-850'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.75} />
                  <span className={`flex-1 font-medium ${isActive ? '' : 'tracking-tight'}`}>{label}</span>
                  <span
                    className={`font-mono text-[9.5px] tracking-wider ${
                      isActive ? 'text-white/70' : 'text-ink-400 group-hover:text-ink-300'
                    }`}
                  >
                    {code}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer / user */}
      <div className="border-t border-ink-800 px-4 py-4">
        <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-ink-850 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-steel-400 to-steel-600 flex items-center justify-center font-display font-semibold text-[13px] text-white shadow-soft">
            FE
          </div>
          <div className="flex-1 leading-tight text-left">
            <div className="text-[13px] text-ink-50 font-semibold">Fernando Espinosa</div>
            <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-wider">Administrador</div>
          </div>
          <ChevronRight size={14} className="text-ink-400" />
        </button>
        <div className="mt-3 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-wider text-ink-400 px-2">
          <span className="w-1.5 h-1.5 bg-signal-ok rounded-full pulse-dot" />
          Sistema en línea
        </div>
      </div>
    </aside>
  )
}
