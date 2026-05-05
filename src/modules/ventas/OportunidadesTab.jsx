import { useEffect, useState } from 'react'
import { Map as MapIcon, Truck, Target, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel } from '@/components/Panel'
import { fmtMoney } from '@/utils/format'
import { ventas } from '@/services/api'
import { rawData } from '@/data/mockDb'

export function OportunidadesTab() {
  const [oportunidades, setOportunidades] = useState([])

  useEffect(() => { ventas.getOportunidadesZona().then(setOportunidades) }, [])

  // Cruce: prospectos disponibles por zona
  const { prospectos, clientesRutas } = rawData

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-steel-50 rounded-full blur-3xl pointer-events-none" />
        <div className="px-6 py-5 flex items-start gap-4 relative">
          <div className="w-12 h-12 bg-steel-50 border border-steel-200 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-steel-700" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.25em] mb-1">
              Sinergia con módulo Rutas
            </div>
            <h3 className="font-display font-bold text-ink-50 text-xl tracking-tight mb-1">
              Optimización de rutas con prospectos en zona
            </h3>
            <p className="text-sm text-ink-400 leading-relaxed max-w-3xl">
              Cuando una zona tiene pocos clientes pero el operador ya viaja ahí, el sistema sugiere
              prospectos en esa misma área para optimizar el viaje. Cada nuevo cliente cerrado en una zona
              activa <strong className="text-ink-200">multiplica la rentabilidad de la ruta sin agregar costo logístico</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de zonas con oportunidad */}
      <div className="space-y-3">
        {oportunidades.map(o => {
          const prospectosZona = prospectos.filter(p => p.zona_id === o.zona.id)
          const valorZona = prospectosZona.filter(p => p.status !== 'descartado' && p.status !== 'cerrado')
            .reduce((s, p) => s + p.valor_estimado, 0)

          return (
            <div key={o.zona.id} className="panel">
              <div className="grid grid-cols-12 gap-4 p-5">
                {/* Info zona */}
                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: o.zona.color }} />
                    <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Zona</span>
                  </div>
                  <div className="font-display font-bold text-ink-50 text-xl leading-tight mb-1">
                    {o.zona.nombre}
                  </div>
                  <div className="font-mono text-[10px] text-ink-500 mt-1 flex items-center gap-1.5">
                    <Truck size={10} />
                    Operador: <span className="text-ink-300">{o.zona.operador}</span>
                  </div>
                </div>

                {/* Métricas actuales */}
                <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-3 border-l border-ink-800 pl-4">
                  <div>
                    <div className="stat-label mb-0.5">Clientes actuales</div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-ink-100 text-2xl tabular-nums">{o.zona.clientes_total}</span>
                      <span className="font-mono text-[10px] text-signal-warn">baja densidad</span>
                    </div>
                  </div>
                  <div>
                    <div className="stat-label mb-0.5">Equipos</div>
                    <span className="font-mono font-bold text-ink-100 text-2xl tabular-nums">{o.zona.equipos_total}</span>
                  </div>
                  <div>
                    <div className="stat-label mb-0.5">Prospectos disponibles</div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-steel-700 text-2xl tabular-nums">{prospectosZona.length}</span>
                      <span className="font-mono text-[10px] text-ink-500">scrapeados</span>
                    </div>
                  </div>
                </div>

                {/* Pipeline potencial */}
                <div className="col-span-12 md:col-span-4 border-l border-ink-800 pl-4 flex flex-col justify-between">
                  <div>
                    <div className="stat-label mb-0.5 flex items-center gap-1">
                      <Zap size={9} /> Pipeline potencial en zona
                    </div>
                    <div className="font-mono font-bold text-2xl text-signal-ok tabular-nums">
                      {fmtMoney(valorZona)}
                    </div>
                    <div className="font-mono text-[10px] text-ink-500 mt-1">
                      Sin costo logístico adicional
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-primary flex-1 justify-center">
                      <Target size={11} />
                      Activar campaña
                    </button>
                    <Link to="/rutas" className="btn-ghost">
                      <MapIcon size={11} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Lista de prospectos en zona */}
              {prospectosZona.length > 0 && (
                <div className="border-t border-ink-800 px-5 py-3 bg-ink-900/40">
                  <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.2em] mb-2">
                    Top prospectos en zona ({prospectosZona.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {prospectosZona.slice(0, 6).map(p => (
                      <div key={p.id} className="flex items-center gap-2 p-2 border border-ink-800 hover:border-ink-700 transition-colors">
                        <div className="w-6 h-6 bg-ink-800 border border-ink-700 flex items-center justify-center font-mono text-[10px] text-ink-300">
                          {p.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-ink-100 truncate">{p.nombre}</div>
                          <div className="font-mono text-[10px] text-ink-500 truncate">{p.sector} · {fmtMoney(p.valor_estimado)}</div>
                        </div>
                        <ArrowRight size={10} className="text-ink-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {oportunidades.length === 0 && (
          <div className="panel py-16 text-center">
            <Sparkles size={28} className="text-ink-700 mx-auto mb-3" />
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
              No hay zonas con baja densidad por el momento
            </div>
            <div className="text-sm text-ink-400 mt-2">
              Todas las zonas operativas tienen una buena densidad de clientes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
