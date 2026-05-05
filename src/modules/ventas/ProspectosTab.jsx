import { useEffect, useMemo, useState } from 'react'
import { Search, Mail, Phone, Calendar, Target, ChevronRight, Bot } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtRelative } from '@/utils/format'
import { ventas } from '@/services/api'

const STATUS_VARIANT = {
  nuevo: 'neutral',
  contactado: 'warn',
  cita_agendada: 'ok',
  descartado: 'neutral',
  cerrado: 'ok',
}

const STATUS_LABEL = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  cita_agendada: 'Cita agendada',
  descartado: 'Descartado',
  cerrado: 'Cerrado',
}

export function ProspectosTab() {
  const [prospectos, setProspectos] = useState([])
  const [q, setQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterSector, setFilterSector] = useState('todos')

  useEffect(() => { ventas.listProspectos().then(setProspectos) }, [])

  const sectores = [...new Set(prospectos.map(p => p.sector))]

  const filtered = useMemo(() => {
    return prospectos.filter(p => {
      const mq = !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.codigo.toLowerCase().includes(q.toLowerCase())
      const ms = filterStatus === 'todos' || p.status === filterStatus
      const msec = filterSector === 'todos' || p.sector === filterSector
      return mq && ms && msec
    })
  }, [prospectos, q, filterStatus, filterSector])

  return (
    <div className="space-y-4">
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full flex-1 min-w-[200px] focus-within:border-steel-400 focus-within:shadow-focus transition-all">
            <Search size={13} className="text-ink-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar prospecto o código..."
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-ink-500 text-ink-200"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { v: 'todos', l: 'Todos' },
              { v: 'nuevo', l: 'Nuevos' },
              { v: 'contactado', l: 'Contactados' },
              { v: 'cita_agendada', l: 'Citas' },
              { v: 'cerrado', l: 'Cerrados' },
            ].map(s => (
              <button
                key={s.v}
                onClick={() => setFilterStatus(s.v)}
                className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  filterStatus === s.v
                    ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                    : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
          <select
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-ink-800 bg-ink-900 text-ink-100 hover:bg-ink-850"
          >
            <option value="todos">Todos los sectores</option>
            {sectores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Panel>

      <Panel tight>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Código</th>
                <th className="table-head">Prospecto</th>
                <th className="table-head">Sector</th>
                <th className="table-head">Zona</th>
                <th className="table-head text-center">Score</th>
                <th className="table-head text-center">Emails</th>
                <th className="table-head text-right">Valor</th>
                <th className="table-head">Status</th>
                <th className="table-head">Fuente</th>
                <th className="table-head text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-ink-900 transition-colors">
                  <td className="table-cell font-mono text-[11px] text-ink-400">{p.codigo}</td>
                  <td className="table-cell">
                    <div className="text-ink-100 font-medium">{p.nombre}</div>
                    <div className="font-mono text-[10px] text-ink-500">{p.contacto}</div>
                  </td>
                  <td className="table-cell text-ink-300 text-[12px]">{p.sector}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.zona_color }} />
                      <span className="text-ink-300">{p.zona_nombre}</span>
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-10 h-1 bg-ink-800 overflow-hidden">
                        <div
                          className={`h-full ${p.score >= 80 ? 'bg-green-500' : p.score >= 70 ? 'bg-amber-500' : 'bg-ink-500'}`}
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] tabular-nums text-ink-200">{p.score}</span>
                    </div>
                  </td>
                  <td className="table-cell text-center">
                    {p.emails_enviados > 0 ? (
                      <div className="inline-flex items-center gap-1 text-[11px]">
                        <span className="font-mono text-ink-200 tabular-nums">{p.emails_enviados}</span>
                        {p.abierto && <span title="Abierto" className="w-1.5 h-1.5 bg-amber-400" />}
                        {p.respondio && <span title="Respondió" className="w-1.5 h-1.5 bg-green-400" />}
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-ink-500">—</span>
                    )}
                  </td>
                  <td className="table-cell text-right font-mono text-ink-200 tabular-nums">{fmtMoney(p.valor_estimado)}</td>
                  <td className="table-cell">
                    <StatusBadge status={p.status} variant={STATUS_VARIANT[p.status]} label={STATUS_LABEL[p.status]} />
                  </td>
                  <td className="table-cell">
                    <div className="font-mono text-[10px] text-ink-400 truncate max-w-[180px]">{p.fuente}</div>
                    <div className="font-mono text-[9px] text-ink-500">{fmtRelative(p.fecha_scraping)}</div>
                  </td>
                  <td className="table-cell text-right">
                    <div className="inline-flex gap-1">
                      <button title="Email" className="p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
                        <Mail size={12} />
                      </button>
                      <button title="Llamar" className="p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
                        <Phone size={12} />
                      </button>
                      {p.status === 'cita_agendada' && (
                        <button title="Ver cita" className="p-1.5 text-signal-ok hover:text-signal-ok hover:bg-ink-800">
                          <Calendar size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-ink-800 font-mono text-[10px] text-ink-500 uppercase tracking-wider flex items-center justify-between">
          <span>{filtered.length} de {prospectos.length} prospectos</span>
          <span>Pipeline filtrado: <span className="text-ink-200">{fmtMoney(filtered.filter(p => p.status !== 'descartado' && p.status !== 'cerrado').reduce((s, p) => s + p.valor_estimado, 0))}</span></span>
        </div>
      </Panel>
    </div>
  )
}
