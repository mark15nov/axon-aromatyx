import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import {
  Package, Wallet, MessageSquare, Truck, Map, BellRing, Bot, Target,
  ArrowUpRight, TrendingUp, Sparkles, Activity, Coffee,
} from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtNumber, fmtRelative } from '@/utils/format'
import { inventarios, financieros, tickets } from '@/services/api'

const MOD_LIST = [
  { to: '/inventarios', code: '01', label: 'Inventarios', icon: Package,         tagline: 'Aromas y difusores' },
  { to: '/finanzas',    code: '02', label: 'Finanzas',    icon: Wallet,          tagline: 'Cobros y pagos' },
  { to: '/atencion',    code: '03', label: 'Atención',    icon: MessageSquare,   tagline: 'Tickets y soporte' },
  { to: '/logistica',   code: '04', label: 'Logística',   icon: Truck,           tagline: 'Cotiza y agenda' },
  { to: '/rutas',       code: '05', label: 'Rutas',       icon: Map,             tagline: 'Operadores y zonas' },
  { to: '/alertas',     code: '06', label: 'Alertas',     icon: BellRing,        tagline: 'Acciones automáticas' },
  { to: '/chat-ia',     code: '07', label: 'Asistente',   icon: Bot,             tagline: 'Pregunta lo que sea' },
  { to: '/ventas',      code: '08', label: 'Ventas',      icon: Target,          tagline: 'Prospección activa' },
]

const SERIE_OPS = [
  { d: 'Lun', v: 12 }, { d: 'Mar', v: 18 }, { d: 'Mié', v: 14 }, { d: 'Jue', v: 22 },
  { d: 'Vie', v: 26 }, { d: 'Sáb', v: 9 }, { d: 'Dom', v: 4 },
]
const SERIE_INGRESOS = [
  { mes: 'Ene', ingresos: 480, gastos: 320 },
  { mes: 'Feb', ingresos: 520, gastos: 340 },
  { mes: 'Mar', ingresos: 610, gastos: 380 },
  { mes: 'Abr', ingresos: 590, gastos: 360 },
  { mes: 'May', ingresos: 720, gastos: 420 },
  { mes: 'Jun', ingresos: 780, gastos: 450 },
]

function saludoHora() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Dashboard() {
  const [kpisInv, setKpisInv] = useState(null)
  const [kpisFin, setKpisFin] = useState(null)
  const [tks, setTks] = useState([])

  useEffect(() => {
    inventarios.getKpis().then(setKpisInv)
    financieros.getKpis().then(setKpisFin)
    tickets.list().then(t => setTks(t.slice(0, 5)))
  }, [])

  const ticketsAbiertos = tks.filter(t => t.status === 'abierto').length

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 panel relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-steel-200 to-steel-100 opacity-60 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-zone-mint/20 blur-2xl pointer-events-none" />
          <div className="px-7 py-7 flex items-start justify-between gap-6 relative">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-ink-850 border border-ink-800">
                <Coffee size={12} strokeWidth={1.75} className="text-steel-600" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                  {saludoHora()} · sesión activa
                </span>
              </div>
              <h2 className="font-display font-semibold text-ink-50 text-[40px] leading-[1.05] tracking-tight mb-2">
                Hola Mario, <span className="text-steel-600 italic">esto es lo que te espera hoy.</span>
              </h2>
              <p className="text-ink-300 text-[14px] leading-relaxed max-w-xl">
                Tienes <strong className="text-ink-50">{ticketsAbiertos} tickets</strong> esperando respuesta,
                {' '}<strong className="text-signal-alert">{kpisInv?.aromas_criticos || 0} aromas</strong> en stock crítico
                y <strong className="text-signal-warn">{fmtMoney(kpisFin?.cxc_vencido)}</strong> en cobranza vencida.
              </p>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Ingresos junio</div>
                <div className="font-display font-semibold text-3xl text-ink-50 tabular-nums">$780K</div>
              </div>
              <div className="inline-flex items-center gap-1 text-signal-ok px-2.5 py-1 rounded-full border border-signal-okBorder bg-signal-okBg">
                <TrendingUp size={12} strokeWidth={2} />
                <span className="font-mono text-[11px] tabular-nums">+8.3%</span>
              </div>
            </div>
          </div>
          <div className="border-t border-ink-800 px-7 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
            <MiniMetric label="Operaciones hoy" value="42" delta="+12%" />
            <MiniMetric label="Visitas pendientes" value="9" />
            <MiniMetric label="Clientes activos" value="187" delta="+3" />
            <MiniMetric label="Litros en stock" value={fmtNumber(kpisInv?.litros_totales, 1)} unit="L" />
          </div>
        </div>

        {/* Mini gráfica de actividad */}
        <div className="col-span-12 lg:col-span-4 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Activity size={13} strokeWidth={1.75} className="text-steel-600" />
              <span className="panel-title">Actividad · 7 días</span>
            </div>
            <span className="font-mono text-[10px] text-ink-400">ops/día</span>
          </div>
          <div className="px-2 pt-3 pb-2">
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={SERIE_OPS} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c2592b" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c2592b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7a6f63', fontFamily: 'DM Mono' }} />
                <Tooltip
                  cursor={{ stroke: '#d6cdc1' }}
                  contentStyle={{ background: '#ffffff', border: '1px solid #ebe4d8', borderRadius: 12, fontSize: 11, fontFamily: 'DM Mono' }}
                  labelStyle={{ color: '#7a6f63' }}
                />
                <Area type="monotone" dataKey="v" stroke="#c2592b" fill="url(#g1)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Valor inventario" value={fmtMoney(kpisInv?.valor_total).replace('MXN', '').trim()} sub="MXN total" accent icon={Package} />
        <StatCard label="CxC pendiente" value={fmtMoney(kpisFin?.cxc_total).replace('MXN', '').trim()} sub="Por cobrar este mes" icon={Wallet} />
        <StatCard label="Aromas críticos" value={kpisInv?.aromas_criticos || 0} unit="SKU" sub="Reordenar pronto" danger icon={Sparkles} />
        <StatCard label="Tickets abiertos" value={tks.filter(t => t.status !== 'cerrado').length} sub="Atención pendiente" warn icon={MessageSquare} />
      </div>

      {/* Módulos grid */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-ink-50 text-[22px] tracking-tight">¿A dónde quieres ir?</h3>
            <p className="text-[13px] text-ink-400 mt-0.5">Todos tus módulos a un click de distancia.</p>
          </div>
          <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">8 módulos activos</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MOD_LIST.map(({ to, code, label, icon: Icon, tagline }) => (
            <Link
              key={to}
              to={to}
              className="panel hover:shadow-card hover:border-steel-300 transition-all duration-200 group p-5 relative overflow-hidden"
            >
              <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-steel-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-ink-850 border border-ink-800 flex items-center justify-center group-hover:bg-steel-50 group-hover:border-steel-200 transition-colors">
                    <Icon size={18} strokeWidth={1.75} className="text-ink-200 group-hover:text-steel-600 transition-colors" />
                  </div>
                  <ArrowUpRight size={16} className="text-ink-400 group-hover:text-steel-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-[0.18em] mb-1">Módulo {code}</div>
                <div className="font-display font-semibold text-ink-50 text-[17px] mb-0.5">{label}</div>
                <div className="text-[12px] text-ink-300">{tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chart + Tickets recientes */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />
              <span className="panel-title">Ingresos vs gastos · 6 meses</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-steel-600" /><span className="text-ink-300">Ingresos</span></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-ink-700" /><span className="text-ink-300">Gastos</span></span>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={SERIE_INGRESOS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#ebe4d8" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7a6f63', fontFamily: 'DM Mono' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7a6f63', fontFamily: 'DM Mono' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(194,89,43,0.06)' }}
                  contentStyle={{ background: '#ffffff', border: '1px solid #ebe4d8', borderRadius: 12, fontSize: 11, fontFamily: 'DM Mono' }}
                />
                <Bar dataKey="ingresos" fill="#c2592b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="gastos" fill="#d6cdc1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-warn" />
              <span className="panel-title">Tickets recientes</span>
            </div>
            <Link to="/atencion" className="font-mono text-[10px] text-steel-700 hover:text-steel-600 uppercase tracking-wider">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-ink-800">
            {tks.map(t => (
              <Link
                key={t.id}
                to="/atencion"
                className="block px-5 py-3.5 hover:bg-ink-850/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-ink-400">{t.folio}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="text-[14px] text-ink-50 truncate font-medium">{t.asunto}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11.5px] text-ink-300 truncate">{t.cliente}</span>
                  <span className="font-mono text-[10px] text-ink-400">{fmtRelative(t.fecha)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value, unit, delta }) {
  return (
    <div>
      <div className="stat-label mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-num text-[20px]">{value}</span>
        {unit && <span className="font-mono text-[10px] text-ink-400">{unit}</span>}
        {delta && <span className="font-mono text-[10px] text-signal-ok ml-1">{delta}</span>}
      </div>
    </div>
  )
}
