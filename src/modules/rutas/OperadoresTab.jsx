import { useEffect, useState } from 'react'
import { MapPin, ExternalLink, Activity, Plus, Pencil, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel } from '@/components/Panel'
import { rutas } from '@/services/api'
import { FormOperador } from './FormOperador'

export function OperadoresTab() {
  const [operadores, setOperadores] = useState([])
  const [zonas, setZonas] = useState([])
  const [reportes, setReportes] = useState([])
  const [editing, setEditing] = useState(null)        // operador a editar
  const [creating, setCreating] = useState(false)

  const cargar = () => {
    rutas.listOperadores().then(setOperadores)
    rutas.listZonas().then(setZonas)
    rutas.listReportes().then(setReportes)
  }
  useEffect(() => { cargar() }, [])

  const getZonaInfo = (id) => zonas.find(z => z.id === id)

  return (
    <div className="space-y-4">
      {/* Banner para app de operador */}
      <div className="panel relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-steel-50/60 to-transparent pointer-events-none" />
        <div className="px-5 py-4 flex items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-steel-50 border border-steel-200 flex items-center justify-center">
              <Activity size={16} className="text-steel-700" />
            </div>
            <div>
              <div className="font-display font-semibold text-ink-50">App del operador</div>
              <div className="text-[12px] text-ink-400">
                Tus operadores reportan visitas en{' '}
                <span className="font-mono text-steel-700">aromatyx.com/operador</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/operador" target="_blank" className="btn-ghost">
              <ExternalLink size={11} />
              Abrir app
            </Link>
            <button onClick={() => setCreating(true)} className="btn-primary">
              <Plus size={11} /> Nuevo operador
            </button>
          </div>
        </div>
      </div>

      {/* Cards de operadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {operadores.map(op => {
          const reportesOp = reportes.filter(r => r.operador === op.nombre)
          const reportesMes = reportesOp.filter(r => Date.now() - new Date(r.fecha) < 30 * 86400000).length

          return (
            <div key={op.id} className="panel hover:shadow-card transition-shadow">
              <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-semibold text-base flex-shrink-0 ${
                    op.activo
                      ? 'bg-gradient-to-br from-steel-400 to-steel-600 text-white shadow-soft'
                      : 'bg-ink-850 border border-ink-800 text-ink-400'
                  }`}>
                    {op.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-ink-50 text-lg leading-tight truncate">{op.nombre}</div>
                    <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">
                      OP-{String(op.id).padStart(3, '0')} · Operador de ruta
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {op.activo ? (
                    <span className="badge-ok">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-ok pulse-dot" />
                      Activo
                    </span>
                  ) : (
                    <span className="badge-neutral">Inactivo</span>
                  )}
                  <button
                    onClick={() => setEditing(op)}
                    title="Editar"
                    className="w-8 h-8 rounded-full hover:bg-ink-850 flex items-center justify-center text-ink-400 hover:text-ink-100 transition-colors"
                  >
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="p-5 grid grid-cols-3 gap-4">
                <div>
                  <div className="stat-label mb-1">Zonas</div>
                  <div className="stat-num text-2xl">{op.zonas.length}</div>
                </div>
                <div>
                  <div className="stat-label mb-1">Reportes mes</div>
                  <div className="stat-num text-2xl">{reportesMes}</div>
                </div>
                <div>
                  <div className="stat-label mb-1">Total visitas</div>
                  <div className="stat-num text-2xl">{reportesOp.length}</div>
                </div>
              </div>

              {op.zonas.length > 0 ? (
                <div className="px-5 pb-4">
                  <div className="stat-label mb-2 flex items-center gap-1.5"><MapPin size={9} /> Zonas asignadas</div>
                  <div className="flex flex-wrap gap-1.5">
                    {op.zonas.map(zid => {
                      const z = getZonaInfo(zid)
                      return z ? (
                        <span
                          key={zid}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10.5px] font-medium"
                          style={{ borderColor: z.color + '55', background: z.color + '12', color: z.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: z.color }} />
                          {z.nombre}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setEditing(op)}
                    className="w-full text-[11.5px] text-ink-400 italic py-2 rounded-lg border border-dashed border-ink-800 hover:border-steel-300 hover:text-steel-700 transition-colors"
                  >
                    Sin zonas — click para asignar
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Card nuevo operador */}
        <button
          onClick={() => setCreating(true)}
          className="rounded-2xl border-2 border-dashed border-ink-800 hover:border-steel-300 bg-ink-900/40 hover:bg-ink-850 transition-all flex flex-col items-center justify-center gap-2 py-10 text-ink-400 hover:text-steel-700 group"
        >
          <span className="w-12 h-12 rounded-full bg-ink-850 group-hover:bg-steel-50 group-hover:text-steel-700 transition-colors flex items-center justify-center">
            <Plus size={20} strokeWidth={1.75} />
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]">Agregar operador</span>
        </button>
      </div>

      {/* Reportes recientes */}
      <Panel title="Reportes recientes de campo" accent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Folio</th>
                <th className="table-head">Operador</th>
                <th className="table-head">Cliente</th>
                <th className="table-head">Fecha</th>
                <th className="table-head text-center">Aceite restante</th>
                <th className="table-head text-center">Acciones</th>
                <th className="table-head">Próx. acción</th>
              </tr>
            </thead>
            <tbody>
              {reportes.slice(0, 12).map(r => (
                <tr key={r.id} className="hover:bg-ink-850 transition-colors">
                  <td className="table-cell font-mono text-[11px] text-ink-300">{r.folio}</td>
                  <td className="table-cell text-ink-200 text-[12px]">{r.operador}</td>
                  <td className="table-cell text-ink-50 font-medium text-[12px]">{r.cliente_nombre}</td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">
                    {new Date(r.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-1 bg-ink-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.aceite_restante_pct < 25 ? 'bg-signal-alert' : r.aceite_restante_pct < 50 ? 'bg-signal-warn' : 'bg-signal-ok'}`}
                          style={{ width: `${r.aceite_restante_pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10.5px] text-ink-200 tabular-nums">{r.aceite_restante_pct}%</span>
                    </div>
                  </td>
                  <td className="table-cell text-center">
                    <div className="inline-flex gap-1">
                      {r.necesita_recarga && <span className="badge-warn">Recarga</span>}
                      {r.necesita_servicio && <span className="badge-alert">Servicio</span>}
                      {!r.necesita_recarga && !r.necesita_servicio && <span className="font-mono text-[10px] text-ink-400">—</span>}
                    </div>
                  </td>
                  <td className="table-cell font-mono text-[10.5px] uppercase tracking-wider text-ink-300">
                    {r.proxima_accion.replace('_', ' ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modales */}
      {creating && (
        <FormOperador
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); cargar() }}
        />
      )}
      {editing && (
        <FormOperador
          operador={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); cargar() }}
        />
      )}
    </div>
  )
}
