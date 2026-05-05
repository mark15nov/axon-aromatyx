import { useEffect, useState } from 'react'
import { X, MapPin, Box, User, Calendar, Droplet } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtRelative, fmtDate } from '@/utils/format'
import { rutas } from '@/services/api'

export function ClienteDrawer({ cliente, onClose }) {
  const [reportes, setReportes] = useState([])

  useEffect(() => {
    if (!cliente) return
    rutas.listReportes().then(rs =>
      setReportes(rs.filter(r => r.cliente_id === cliente.id).slice(0, 5))
    )
  }, [cliente])

  if (!cliente) return null

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-ink-950 border-l border-ink-800 z-40 flex flex-col shadow-2xl">
      <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">{cliente.codigo}</span>
            <StatusBadge
              status={cliente.status_visita}
              variant={cliente.status_visita === 'urgente' ? 'alert' : cliente.status_visita === 'pendiente' ? 'warn' : 'ok'}
            />
          </div>
          <h2 className="font-display font-semibold text-ink-50 text-lg leading-tight">{cliente.nombre}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cliente.zona_color }} />
            <span className="font-mono text-[11px] text-ink-400">{cliente.zona_nombre}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-500 hover:text-ink-100 p-1">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="panel p-3">
            <div className="stat-label mb-1 flex items-center gap-1"><Box size={9} /> Equipos</div>
            <div className="stat-num text-2xl">{cliente.equipos}</div>
          </div>
          <div className="panel p-3">
            <div className="stat-label mb-1 flex items-center gap-1"><Droplet size={9} /> Aceite restante</div>
            <div className="flex items-baseline gap-1">
              <span className={`stat-num text-2xl ${cliente.aceite_restante_pct < 25 ? 'text-signal-alert' : ''}`}>
                {cliente.aceite_restante_pct}
              </span>
              <span className="font-mono text-xs text-ink-500">%</span>
            </div>
          </div>
          <div className="panel p-3">
            <div className="stat-label mb-1 flex items-center gap-1"><Calendar size={9} /> Última visita</div>
            <div className="text-sm text-ink-100 font-medium">{fmtRelative(cliente.ultima_visita)}</div>
            <div className="font-mono text-[10px] text-ink-500">{cliente.dias_ultima_visita} días</div>
          </div>
          <div className="panel p-3">
            <div className="stat-label mb-1 flex items-center gap-1"><Calendar size={9} /> Próxima visita</div>
            <div className="text-sm text-ink-100 font-medium">{fmtDate(cliente.proxima_visita)}</div>
          </div>
        </div>

        {/* Operador */}
        <div className="panel p-4">
          <div className="stat-label mb-2 flex items-center gap-1"><User size={9} /> Operador asignado</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-steel-600 flex items-center justify-center font-mono font-bold text-sm text-white">
              {cliente.operador_asignado?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="text-ink-100 font-medium">{cliente.operador_asignado}</div>
              <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
                Responsable de zona {cliente.zona_nombre}
              </div>
            </div>
          </div>
        </div>

        {/* Coordenadas */}
        <div className="panel p-4">
          <div className="stat-label mb-2 flex items-center gap-1"><MapPin size={9} /> Ubicación</div>
          <div className="font-mono text-[11px] text-ink-300 tabular-nums">
            {cliente.lat.toFixed(4)}°N · {cliente.lng.toFixed(4)}°O
          </div>
          <a
            href={`https://www.google.com/maps?q=${cliente.lat},${cliente.lng}`}
            target="_blank" rel="noreferrer"
            className="font-mono text-[10px] text-steel-700 hover:text-steel-700 uppercase tracking-wider mt-2 inline-block"
          >
            Abrir en Google Maps →
          </a>
        </div>

        {/* Historial */}
        <div>
          <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.2em] mb-3">
            Últimos reportes ({reportes.length})
          </div>
          <div className="space-y-2">
            {reportes.length === 0 ? (
              <div className="font-mono text-[11px] text-ink-500 text-center py-4">
                Sin reportes registrados
              </div>
            ) : reportes.map(r => (
              <div key={r.id} className="border border-ink-800 p-3 bg-ink-900/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-ink-400">{r.folio}</span>
                  <span className="font-mono text-[10px] text-ink-500">{fmtRelative(r.fecha)}</span>
                </div>
                <div className="text-[12px] text-ink-200 mb-2 leading-relaxed">{r.observaciones}</div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-ink-400">{r.operador} · {r.equipos_revisados} equipos</span>
                  <div className="flex items-center gap-2">
                    {r.necesita_recarga && <span className="text-signal-warn">+ recarga</span>}
                    {r.necesita_servicio && <span className="text-signal-alert">+ servicio</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800 p-4 flex gap-2">
        <button className="btn-ghost flex-1 justify-center">Programar visita</button>
        <button className="btn-primary flex-1 justify-center">Asignar operador</button>
      </div>
    </div>
  )
}
