import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, Building2 } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtRelative, fmtDate } from '@/utils/format'
import { rutas } from '@/services/api'

const STATUS_VARIANT = { urgente: 'alert', pendiente: 'warn', al_dia: 'ok' }

export function ClientesTab({ onClienteClick }) {
  const [clientes, setClientes] = useState([])
  const [zonas, setZonas] = useState([])
  const [q, setQ] = useState('')
  const [filtroZona, setFiltroZona] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    rutas.listClientes().then(setClientes)
    rutas.listZonas().then(setZonas)
  }, [])

  const filtered = useMemo(() => {
    return clientes.filter(c => {
      const mq = !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.codigo.toLowerCase().includes(q.toLowerCase())
      const mz = filtroZona === 'todas' || c.zona_id === filtroZona
      const ms = filtroStatus === 'todos' || c.status_visita === filtroStatus
      return mq && mz && ms
    })
  }, [clientes, q, filtroZona, filtroStatus])

  return (
    <div className="space-y-4">
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full flex-1 min-w-[200px] focus-within:border-steel-400 focus-within:shadow-focus transition-all">
            <Search size={13} className="text-ink-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar cliente o código..."
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-ink-500 text-ink-200"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mr-1">Zona:</span>
            <select
              value={filtroZona}
              onChange={e => setFiltroZona(e.target.value)}
              className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-ink-800 bg-ink-900 text-ink-100 hover:bg-ink-850"
            >
              <option value="todas">Todas</option>
              {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {[
              { v: 'todos', l: 'Todos' },
              { v: 'urgente', l: 'Urgente' },
              { v: 'pendiente', l: 'Pendiente' },
              { v: 'al_dia', l: 'Al día' },
            ].map(s => (
              <button
                key={s.v}
                onClick={() => setFiltroStatus(s.v)}
                className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  filtroStatus === s.v
                    ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                    : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel tight>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Código</th>
                <th className="table-head">Cliente</th>
                <th className="table-head">Zona</th>
                <th className="table-head text-center">Equipos</th>
                <th className="table-head">Operador</th>
                <th className="table-head">Última visita</th>
                <th className="table-head text-center">Aceite</th>
                <th className="table-head">Status</th>
                <th className="table-head">Próxima visita</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => onClienteClick && onClienteClick(c)}
                  className="cursor-pointer hover:bg-ink-900 transition-colors"
                >
                  <td className="table-cell font-mono text-[11px] text-ink-400">{c.codigo}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Building2 size={11} className="text-ink-500" />
                      <span className="text-ink-100 font-medium">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.zona_color }} />
                      <span className="text-ink-300">{c.zona_nombre}</span>
                    </span>
                  </td>
                  <td className="table-cell text-center font-mono text-ink-200 tabular-nums">{c.equipos}</td>
                  <td className="table-cell text-ink-300 text-[12px]">{c.operador_asignado}</td>
                  <td className="table-cell">
                    <div className="font-mono text-[11px] text-ink-300">{fmtRelative(c.ultima_visita)}</div>
                    <div className="font-mono text-[10px] text-ink-500">{c.dias_ultima_visita}d</div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-10 h-1 bg-ink-800 overflow-hidden">
                        <div
                          className={`h-full ${c.aceite_restante_pct < 25 ? 'bg-red-500' : c.aceite_restante_pct < 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${c.aceite_restante_pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] tabular-nums text-ink-300">{c.aceite_restante_pct}%</span>
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={c.status_visita} variant={STATUS_VARIANT[c.status_visita]} /></td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">{fmtDate(c.proxima_visita)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-ink-800 font-mono text-[10px] text-ink-500 uppercase tracking-wider">
          {filtered.length} clientes mostrados
        </div>
      </Panel>
    </div>
  )
}
