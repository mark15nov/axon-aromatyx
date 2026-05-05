import { useEffect, useState } from 'react'
import { User, MapPin, ExternalLink, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel } from '@/components/Panel'
import { rutas } from '@/services/api'

export function OperadoresTab() {
  const [operadores, setOperadores] = useState([])
  const [zonas, setZonas] = useState([])
  const [reportes, setReportes] = useState([])

  useEffect(() => {
    rutas.listOperadores().then(setOperadores)
    rutas.listZonas().then(setZonas)
    rutas.listReportes().then(setReportes)
  }, [])

  const getZonaInfo = (id) => zonas.find(z => z.id === id)

  return (
    <div className="space-y-4">
      {/* Banner para app de operador */}
      <div className="panel relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-steel-900/30 to-transparent pointer-events-none" />
        <div className="px-5 py-4 flex items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-steel-50 border border-steel-200 flex items-center justify-center">
              <Activity size={16} className="text-steel-700" />
            </div>
            <div>
              <div className="font-display font-semibold text-ink-50">App del operador</div>
              <div className="text-xs text-ink-400">
                Tus operadores reportan visitas en{' '}
                <span className="font-mono text-steel-700">aromatyx.com/operador</span>
              </div>
            </div>
          </div>
          <Link to="/operador" target="_blank" className="btn-ghost">
            <ExternalLink size={11} />
            Abrir app operador
          </Link>
        </div>
      </div>

      {/* Cards de operadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {operadores.map(op => {
          const reportesOp = reportes.filter(r => r.operador === op.nombre)
          const reportesMes = reportesOp.filter(r => Date.now() - new Date(r.fecha) < 30 * 86400000).length

          return (
            <div key={op.id} className="panel">
              <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 flex items-center justify-center font-mono font-bold text-base border ${
                    op.activo
                      ? 'bg-steel-600 border-steel-500 text-white'
                      : 'bg-ink-800 border-ink-700 text-ink-500'
                  }`}>
                    {op.avatar}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-ink-50 text-lg leading-tight">{op.nombre}</div>
                    <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
                      OP-{String(op.id).padStart(3, '0')} · Operador de ruta
                    </div>
                  </div>
                </div>
                {op.activo ? (
                  <span className="badge-ok">
                    <span className="w-1 h-1 rounded-full bg-green-400 pulse-dot" />
                    Activo
                  </span>
                ) : (
                  <span className="badge-neutral">Inactivo</span>
                )}
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

              {op.zonas.length > 0 && (
                <div className="px-5 pb-4">
                  <div className="stat-label mb-2 flex items-center gap-1.5"><MapPin size={9} /> Zonas asignadas</div>
                  <div className="flex flex-wrap gap-1.5">
                    {op.zonas.map(zid => {
                      const z = getZonaInfo(zid)
                      return z ? (
                        <span
                          key={zid}
                          className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border border-ink-700 flex items-center gap-1.5"
                          style={{ borderColor: z.color + '40', background: z.color + '10', color: z.color }}
                        >
                          <span className="w-1 h-1 rounded-full" style={{ background: z.color }} />
                          {z.nombre}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Reportes recientes */}
      <Panel title="Reportes recientes de campo">
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
                <tr key={r.id} className="hover:bg-ink-900 transition-colors">
                  <td className="table-cell font-mono text-[11px] text-ink-300">{r.folio}</td>
                  <td className="table-cell text-ink-200 text-[12px]">{r.operador}</td>
                  <td className="table-cell text-ink-100 font-medium text-[12px]">{r.cliente_nombre}</td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">
                    {new Date(r.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-1 bg-ink-800 overflow-hidden">
                        <div
                          className={`h-full ${r.aceite_restante_pct < 25 ? 'bg-red-500' : r.aceite_restante_pct < 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${r.aceite_restante_pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-ink-300 tabular-nums">{r.aceite_restante_pct}%</span>
                    </div>
                  </td>
                  <td className="table-cell text-center">
                    <div className="inline-flex gap-1">
                      {r.necesita_recarga && <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 border border-signal-warnBorder text-signal-warn">Recarga</span>}
                      {r.necesita_servicio && <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-red-100 border border-signal-alertBorder text-signal-alert">Servicio</span>}
                      {!r.necesita_recarga && !r.necesita_servicio && <span className="font-mono text-[10px] text-ink-500">—</span>}
                    </div>
                  </td>
                  <td className="table-cell font-mono text-[10px] uppercase tracking-wider text-ink-300">
                    {r.proxima_accion.replace('_', ' ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
