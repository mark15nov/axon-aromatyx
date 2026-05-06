import { useEffect, useMemo, useState } from 'react'
import { Search, Building2, Plus, Pencil } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtRelative, fmtDate } from '@/utils/format'
import { rutas } from '@/services/api'
import { FormCliente } from './FormCliente'

const STATUS_VARIANT = { urgente: 'alert', pendiente: 'warn', al_dia: 'ok' }

export function ClientesTab({ onClienteClick }) {
  const [clientes, setClientes] = useState([])
  const [zonas, setZonas] = useState([])
  const [q, setQ] = useState('')
  const [filtroZona, setFiltroZona] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)

  const cargar = () => {
    rutas.listClientes().then(setClientes)
    rutas.listZonas().then(setZonas)
  }
  useEffect(() => { cargar() }, [])

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
          <select
            value={filtroZona}
            onChange={e => setFiltroZona(e.target.value)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-ink-800 bg-ink-900 text-ink-100 hover:bg-ink-850"
          >
            <option value="todas">Todas las zonas</option>
            <optgroup label="CDMX">
              {zonas.filter(z => !z.foranea).map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </optgroup>
            <optgroup label="Foráneas">
              {zonas.filter(z => z.foranea).map(z => <option key={z.id} value={z.id}>{z.nombre} · {z.ciudad}</option>)}
            </optgroup>
          </select>
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
          <div className="flex-1" />
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={11} /> Nuevo cliente
          </button>
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
                <th className="table-head"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-ink-850 transition-colors group">
                  <td
                    className="table-cell font-mono text-[11px] text-ink-400 cursor-pointer"
                    onClick={() => onClienteClick && onClienteClick(c)}
                  >{c.codigo}</td>
                  <td
                    className="table-cell cursor-pointer"
                    onClick={() => onClienteClick && onClienteClick(c)}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={11} className="text-ink-400 flex-shrink-0" />
                      <span className="text-ink-50 font-medium truncate">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="table-cell" onClick={() => onClienteClick && onClienteClick(c)}>
                    <span className="inline-flex items-center gap-1.5 text-[11.5px]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.zona_color }} />
                      <span className="text-ink-200">{c.zona_nombre}</span>
                      {c.zona_foranea && <span className="font-mono text-[9.5px] text-steel-700">· {c.ciudad}</span>}
                    </span>
                  </td>
                  <td className="table-cell text-center font-mono text-ink-100 tabular-nums" onClick={() => onClienteClick && onClienteClick(c)}>{c.equipos}</td>
                  <td className="table-cell text-ink-200 text-[12px]" onClick={() => onClienteClick && onClienteClick(c)}>{c.operador_asignado}</td>
                  <td className="table-cell" onClick={() => onClienteClick && onClienteClick(c)}>
                    <div className="font-mono text-[11px] text-ink-200">{fmtRelative(c.ultima_visita)}</div>
                    <div className="font-mono text-[10px] text-ink-400">{c.dias_ultima_visita}d</div>
                  </td>
                  <td className="table-cell" onClick={() => onClienteClick && onClienteClick(c)}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-10 h-1 bg-ink-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.aceite_restante_pct < 25 ? 'bg-signal-alert' : c.aceite_restante_pct < 50 ? 'bg-signal-warn' : 'bg-signal-ok'}`}
                          style={{ width: `${c.aceite_restante_pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10.5px] tabular-nums text-ink-200">{c.aceite_restante_pct}%</span>
                    </div>
                  </td>
                  <td className="table-cell" onClick={() => onClienteClick && onClienteClick(c)}>
                    <StatusBadge status={c.status_visita} variant={STATUS_VARIANT[c.status_visita]} />
                  </td>
                  <td className="table-cell font-mono text-[11px] text-ink-400" onClick={() => onClienteClick && onClienteClick(c)}>
                    {fmtDate(c.proxima_visita)}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(c) }}
                      title="Editar cliente"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full hover:bg-ink-800 flex items-center justify-center text-ink-400 hover:text-steel-700"
                    >
                      <Pencil size={12} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <div className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em] mb-2">
                      Sin clientes con este filtro
                    </div>
                    <button onClick={() => setCreating(true)} className="btn-ghost">
                      <Plus size={11} /> Agregar primero cliente
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-ink-800 font-mono text-[10px] text-ink-400 uppercase tracking-wider flex items-center justify-between">
          <span>{filtered.length} de {clientes.length} clientes</span>
          <span>Hover sobre una fila para editar</span>
        </div>
      </Panel>

      {creating && (
        <FormCliente
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); cargar() }}
        />
      )}
      {editing && (
        <FormCliente
          cliente={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); cargar() }}
        />
      )}
    </div>
  )
}
