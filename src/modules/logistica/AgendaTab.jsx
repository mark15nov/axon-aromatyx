import { useEffect, useState } from 'react'
import { Truck, MapPin, Clock, User, Package, ArrowRight } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtDateTime, fmtNumber } from '@/utils/format'
import { logistica } from '@/services/api'

const STATUS_VARIANT = {
  agendado: 'warn',
  en_curso: 'ok',
  completado: 'neutral',
  cotización: 'neutral',
}

export function AgendaTab() {
  const [viajes, setViajes] = useState([])
  const [filter, setFilter] = useState('todos')

  useEffect(() => { logistica.listViajes().then(setViajes) }, [])

  const filtered = viajes.filter(v => filter === 'todos' || v.status === filter)
    .sort((a, b) => new Date(a.fecha_salida) - new Date(b.fecha_salida))

  const proximos = viajes.filter(v => v.status === 'agendado' || v.status === 'en_curso').length
  const completados = viajes.filter(v => v.status === 'completado').length
  const enCurso = viajes.filter(v => v.status === 'en_curso').length

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="panel p-4">
          <div className="stat-label mb-1">En curso</div>
          <div className="flex items-baseline gap-2">
            <span className="stat-num text-2xl text-signal-ok">{enCurso}</span>
            <span className="font-mono text-[10px] text-ink-500">viajes activos</span>
          </div>
        </div>
        <div className="panel p-4">
          <div className="stat-label mb-1">Próximos 7 días</div>
          <div className="flex items-baseline gap-2">
            <span className="stat-num text-2xl">{proximos}</span>
            <span className="font-mono text-[10px] text-ink-500">agendados</span>
          </div>
        </div>
        <div className="panel p-4">
          <div className="stat-label mb-1">Completados mes</div>
          <div className="flex items-baseline gap-2">
            <span className="stat-num text-2xl">{completados}</span>
            <span className="font-mono text-[10px] text-ink-500">entregas</span>
          </div>
        </div>
        <div className="panel p-4">
          <div className="stat-label mb-1">Total facturado</div>
          <div className="flex items-baseline gap-1">
            <span className="stat-num text-2xl">{fmtMoney(viajes.reduce((s, v) => s + v.total, 0)).replace('MXN', '').trim()}</span>
            <span className="font-mono text-[10px] text-ink-500">MXN</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          {[
            { v: 'todos', l: 'Todos' },
            { v: 'agendado', l: 'Agendados' },
            { v: 'en_curso', l: 'En curso' },
            { v: 'completado', l: 'Completados' },
            { v: 'cotización', l: 'Cotizaciones' },
          ].map(s => (
            <button
              key={s.v}
              onClick={() => setFilter(s.v)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                filter === s.v
                  ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                  : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
              }`}
            >
              {s.l}
            </button>
          ))}
        </div>
      </Panel>

      {/* Cards de viajes */}
      <div className="space-y-3">
        {filtered.map(v => (
          <div key={v.id} className="panel hover:border-steel-600 transition-colors">
            <div className="grid grid-cols-12 gap-4 p-4 items-center">
              {/* Folio + status */}
              <div className="col-span-12 md:col-span-2">
                <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-1">{v.folio}</div>
                <StatusBadge status={v.status} variant={STATUS_VARIANT[v.status]} />
              </div>

              {/* Ruta */}
              <div className="col-span-12 md:col-span-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-100 font-medium truncate">{v.origen.nombre}</div>
                    <div className="font-mono text-[10px] text-ink-500">{v.origen.estado}</div>
                  </div>
                  <ArrowRight size={14} className="text-ink-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-100 font-medium truncate">{v.destino.nombre}</div>
                    <div className="font-mono text-[10px] text-ink-500">{v.destino.estado}</div>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-ink-400 mt-1.5 flex items-center gap-3">
                  <span><Truck size={9} className="inline mr-1" />{v.tipo} · {v.placa}</span>
                  <span>{fmtNumber(v.km)} km</span>
                </div>
              </div>

              {/* Operador */}
              <div className="col-span-6 md:col-span-2">
                <div className="stat-label mb-0.5 flex items-center gap-1"><User size={9} /> Operador</div>
                <div className="text-[12px] text-ink-200">{v.operador}</div>
              </div>

              {/* Fecha */}
              <div className="col-span-6 md:col-span-2">
                <div className="stat-label mb-0.5 flex items-center gap-1"><Clock size={9} /> Salida</div>
                <div className="font-mono text-[11px] text-ink-200">{fmtDateTime(v.fecha_salida)}</div>
              </div>

              {/* Total */}
              <div className="col-span-12 md:col-span-2 md:text-right">
                <div className="stat-label mb-0.5">Total</div>
                <div className="stat-num text-lg">{fmtMoney(v.total)}</div>
              </div>
            </div>

            {/* Carga */}
            <div className="border-t border-ink-800 px-4 py-2.5 flex items-center justify-between bg-ink-900/40">
              <div className="flex items-center gap-2 text-[12px] text-ink-300">
                <Package size={11} className="text-ink-500" />
                <span className="text-ink-400 font-mono text-[10px] uppercase tracking-wider">Carga:</span>
                <span>{v.carga}</span>
              </div>
              <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">
                {v.clientes_visitar} clientes en ruta
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
