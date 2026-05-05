import { useEffect, useState } from 'react'
import { Users, Box, AlertCircle, MapPin, ChevronRight } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { rutas } from '@/services/api'
import { MapaZonas } from '@/modules/rutas/MapaZonas'

export function ZonasTab({ onClienteClick }) {
  const [zonas, setZonas] = useState([])
  const [filtroZona, setFiltroZona] = useState('todas')

  useEffect(() => { rutas.listZonas().then(setZonas) }, [])

  return (
    <div className="space-y-4">
      {/* Mapa */}
      <Panel title="Mapa operativo · CDMX y zona metropolitana" tight action={
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
            {filtroZona === 'todas' ? `${zonas.reduce((s, z) => s + z.clientes_total, 0)} clientes` : `${zonas.find(z => z.id === filtroZona)?.clientes_total || 0} en zona`}
          </span>
        </div>
      }>
        <MapaZonas filtroZona={filtroZona} onClienteClick={onClienteClick} />
      </Panel>

      {/* Filtro de zona */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Filtrar:</span>
        <button
          onClick={() => setFiltroZona('todas')}
          className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
            filtroZona === 'todas'
              ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
              : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
          }`}
        >
          Todas
        </button>
        {zonas.map(z => (
          <button
            key={z.id}
            onClick={() => setFiltroZona(z.id)}
            className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              filtroZona === z.id
                ? 'border-steel-600 text-steel-700 bg-steel-50'
                : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: z.color }} />
            {z.nombre}
          </button>
        ))}
      </div>

      {/* Cards de zona */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {zonas.map(z => (
          <button
            key={z.id}
            onClick={() => setFiltroZona(z.id)}
            className={`panel text-left hover:border-steel-600 transition-all group p-4 relative overflow-hidden ${
              filtroZona === z.id ? 'border-steel-600' : ''
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: z.color }} />

            <div className="flex items-start justify-between mb-3 pt-1">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={12} style={{ color: z.color }} />
                  <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Zona</span>
                </div>
                <div className="font-display font-semibold text-ink-50 leading-tight">{z.nombre}</div>
              </div>
              <ChevronRight size={14} className="text-ink-600 group-hover:text-steel-600 transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="stat-label mb-0.5">Clientes</div>
                <div className="flex items-baseline gap-1">
                  <span className="stat-num text-xl">{z.clientes_total}</span>
                </div>
              </div>
              <div>
                <div className="stat-label mb-0.5">Equipos</div>
                <div className="flex items-baseline gap-1">
                  <span className="stat-num text-xl">{z.equipos_total}</span>
                </div>
              </div>
            </div>

            {z.visitas_urgentes > 0 ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-signal-alertBg/50 border border-signal-alert/30">
                <AlertCircle size={10} className="text-signal-alert" />
                <span className="font-mono text-[10px] text-signal-alert uppercase tracking-wider">
                  {z.visitas_urgentes} visita{z.visitas_urgentes > 1 ? 's' : ''} urgente{z.visitas_urgentes > 1 ? 's' : ''}
                </span>
              </div>
            ) : z.visitas_pendientes > 0 ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-signal-warnBg/50 border border-signal-warn/30">
                <AlertCircle size={10} className="text-signal-warn" />
                <span className="font-mono text-[10px] text-signal-warn uppercase tracking-wider">
                  {z.visitas_pendientes} pendiente{z.visitas_pendientes > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-signal-okBg/50 border border-signal-ok/30">
                <span className="font-mono text-[10px] text-signal-ok uppercase tracking-wider">
                  Todas al día
                </span>
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-ink-800 flex items-center gap-1.5 font-mono text-[10px] text-ink-400">
              <Users size={10} />
              <span>Operador:</span>
              <span className="text-ink-200">{z.operador}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
