import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Plane, Bus, Car, Truck, BedDouble, Wallet, Calendar, MapPin,
  User, Building2,
} from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtDate } from '@/utils/format'
import { logistica } from '@/services/api'

const STATUS_VARIANT = {
  agendado: 'warn',
  en_curso: 'ok',
  completado: 'neutral',
  cotización: 'accent',
}

const TRANSPORT_ICON = {
  vuelo_redondo:   Plane,
  autobus_redondo: Bus,
  auto_rentado:    Car,
  vehiculo_propio: Truck,
}

const FILTROS = [
  { v: 'todos',      l: 'Todos' },
  { v: 'agendado',   l: 'Agendados' },
  { v: 'en_curso',   l: 'En curso' },
  { v: 'completado', l: 'Completados' },
  { v: 'cotización', l: 'Cotizaciones' },
]

export function AgendaTab() {
  const [viajes, setViajes] = useState([])
  const [filter, setFilter] = useState('todos')

  useEffect(() => { logistica.listViajes().then(setViajes) }, [])

  const filtered = useMemo(() =>
    viajes
      .filter(v => filter === 'todos' || v.status === filter)
      .sort((a, b) => new Date(a.fecha_salida) - new Date(b.fecha_salida)),
  [viajes, filter])

  const proximos     = viajes.filter(v => v.status === 'agendado' || v.status === 'en_curso').length
  const completados  = viajes.filter(v => v.status === 'completado').length
  const enCurso      = viajes.filter(v => v.status === 'en_curso').length
  const totalGastado = viajes.reduce((s, v) => s + (v.total || 0), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="En curso" value={enCurso} sub="Operadores en ruta" tone="ok" />
        <Stat label="Próximos 7 días" value={proximos} sub="Agendados" />
        <Stat label="Viajes del mes" value={completados} sub="Completados" />
        <Stat label="Gasto total" value={fmtMoney(totalGastado)} sub={`${viajes.length} viajes`} />
      </div>

      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
                filter === f.v
                  ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                  : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </Panel>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Panel>
            <div className="py-12 text-center">
              <Plane size={28} strokeWidth={1.5} className="text-ink-400 mx-auto mb-2" />
              <div className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em]">
                No hay viajes con este filtro
              </div>
            </div>
          </Panel>
        ) : (
          filtered.map(v => <ViajeCard key={v.id} v={v} />)
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="panel p-4">
      <div className="stat-label mb-1">{label}</div>
      <div className={`font-display font-semibold text-2xl tabular-nums ${
        tone === 'ok' ? 'text-signal-ok' : 'text-ink-50'
      }`}>
        {value}
      </div>
      {sub && <div className="font-mono text-[10.5px] text-ink-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function ViajeCard({ v }) {
  const TIcon = TRANSPORT_ICON[v.transporte?.tipo] || Car
  const cliente_count = v.clientes_visitar || 0
  return (
    <div className="panel hover:shadow-card transition-shadow overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 items-center">
        <div className="col-span-12 md:col-span-2">
          <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider mb-1">{v.folio}</div>
          <StatusBadge status={v.status} variant={STATUS_VARIANT[v.status]} />
        </div>

        <div className="col-span-6 md:col-span-2">
          <div className="stat-label mb-0.5 flex items-center gap-1"><User size={9} /> Operador</div>
          <div className="text-[13px] text-ink-100 font-medium truncate">{v.operador || 'Sin asignar'}</div>
        </div>

        <div className="col-span-12 md:col-span-3">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-steel-600 flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-[13px] min-w-0">
              <span className="text-ink-300">CDMX</span>
              <ArrowRight size={11} className="text-ink-400 flex-shrink-0" />
              <span className="font-semibold text-ink-50 truncate">{v.destino?.nombre}</span>
            </div>
          </div>
          <div className="font-mono text-[10.5px] text-ink-400 mt-1 flex items-center gap-2">
            <TIcon size={10} className="text-ink-300" />
            <span>{v.transporte?.label}</span>
          </div>
        </div>

        <div className="col-span-6 md:col-span-2">
          <div className="stat-label mb-0.5 flex items-center gap-1"><Calendar size={9} /> Fechas</div>
          <div className="font-mono text-[11.5px] text-ink-200">
            {fmtDate(v.fecha_salida)} → {fmtDate(v.fecha_regreso)}
          </div>
          <div className="font-mono text-[10px] text-ink-400">
            {v.dias} día{v.dias !== 1 ? 's' : ''} · {v.noches} noche{v.noches !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 md:text-right">
          <div className="stat-label mb-0.5">Total</div>
          <div className="font-display font-semibold text-ink-50 text-2xl tabular-nums">
            {fmtMoney(v.total)}
          </div>
          {cliente_count > 0 && (
            <div className="font-mono text-[10.5px] text-ink-400 mt-0.5 flex items-center gap-1 md:justify-end">
              <Building2 size={10} /> {cliente_count} cliente{cliente_count !== 1 ? 's' : ''} a visitar
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-ink-800 px-4 py-2.5 bg-ink-850/40 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-[11.5px] flex-wrap">
          <span className="flex items-center gap-1.5 text-ink-300">
            <TIcon size={11} className="text-ink-400" />
            <span className="font-mono">{fmtMoney(v.transporte?.costo)}</span>
            <span className="text-ink-400">transporte</span>
          </span>
          {v.hospedaje?.incluido && v.hospedaje?.costo > 0 && (
            <span className="flex items-center gap-1.5 text-ink-300">
              <BedDouble size={11} className="text-ink-400" />
              <span className="font-mono">{fmtMoney(v.hospedaje.costo)}</span>
              <span className="text-ink-400">hotel {v.hospedaje.label}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-ink-300">
            <Wallet size={11} className="text-ink-400" />
            <span className="font-mono">{fmtMoney(v.viaticos?.costo)}</span>
            <span className="text-ink-400">viáticos</span>
          </span>
        </div>
        {v.proposito && (
          <span className="font-mono text-[10.5px] text-ink-400 italic truncate max-w-md">
            {v.proposito}
          </span>
        )}
      </div>
    </div>
  )
}
