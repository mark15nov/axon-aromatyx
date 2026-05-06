import { useEffect, useMemo, useState } from 'react'
import {
  Sparkles, Clock, Fuel, MapPin, ArrowRight, Building2, Droplet, Zap,
  TrendingUp, AlertTriangle, ChevronDown, Plane, Calendar, RefreshCw,
} from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney, fmtNumber, fmtDate } from '@/utils/format'
import { rutas } from '@/services/api'

const formatTime = (mins) => {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const PrioridadBadge = ({ score }) => {
  const tone = score >= 70 ? 'alert' : score >= 40 ? 'warn' : 'neutral'
  const label = score >= 70 ? 'Urgente' : score >= 40 ? 'Media' : 'Baja'
  const colors = {
    alert: 'bg-signal-alertBg text-signal-alert border-signal-alertBorder',
    warn:  'bg-signal-warnBg text-signal-warn border-signal-warnBorder',
    neutral:'bg-ink-850 text-ink-400 border-ink-800',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[9.5px] uppercase tracking-wider ${colors[tone]}`}>
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">· {label}</span>
    </span>
  )
}

export function RutasInteligentesTab({ onClienteClick }) {
  const [plan, setPlan] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(0) // primer día expandido por default
  const [refreshing, setRefreshing] = useState(false)

  const cargar = async () => {
    setLoading(true)
    const p = await rutas.planSemanal(7)
    setPlan(p || [])
    setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  const recalcular = async () => {
    setRefreshing(true)
    await cargar()
    setRefreshing(false)
  }

  const totales = useMemo(() => {
    return {
      dias: plan.length,
      clientes: plan.reduce((s, d) => s + d.total_clientes, 0),
      equipos: plan.reduce((s, d) => s + d.total_equipos, 0),
      km: plan.reduce((s, d) => s + d.km_total, 0),
      horas: plan.reduce((s, d) => s + d.tiempo_total_horas, 0),
      costo: plan.reduce((s, d) => s + d.costo_gasolina + d.costo_casetas, 0),
    }
  }, [plan])

  return (
    <div className="space-y-5">
      {/* Hero del optimizador */}
      <div className="panel relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-steel-200 to-steel-100 opacity-60 blur-3xl pointer-events-none" />
        <div className="px-6 py-5 flex items-start gap-4 relative">
          <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-steel-500 to-steel-700 flex items-center justify-center shadow-card">
            <Sparkles size={22} strokeWidth={1.5} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.2em] mb-1">
              Algoritmo de optimización · {totales.dias} días planeados
            </div>
            <h3 className="font-display font-semibold text-ink-50 text-2xl tracking-tight mb-1.5">
              Estas son las rutas óptimas <span className="italic text-steel-600">para esta semana</span>
            </h3>
            <p className="text-[13px] text-ink-300 leading-relaxed max-w-3xl">
              <strong className="text-ink-50">Qué zona cada día</strong> se decide por prioridad — cruza aceite restante,
              días sin visita, tamaño del cliente y cobertura mínima mensual. <strong className="text-ink-50">Dentro de cada ruta</strong>,
              los clientes se ordenan por <strong className="text-ink-50">cercanía geográfica</strong> (nearest-neighbor) para minimizar
              kilómetros y tiempo de traslado.
            </p>
          </div>
          <button
            onClick={recalcular}
            disabled={refreshing}
            className="btn-ghost flex-shrink-0"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Recalcular
          </button>
        </div>

        <div className="border-t border-ink-800 px-6 py-4 grid grid-cols-2 md:grid-cols-6 gap-5">
          <Mini label="Días" value={totales.dias} />
          <Mini label="Clientes" value={totales.clientes} />
          <Mini label="Equipos" value={totales.equipos} />
          <Mini label="Recorrido" value={`${fmtNumber(totales.km, 0)} km`} />
          <Mini label="Tiempo total" value={`${totales.horas.toFixed(1)} h`} />
          <Mini label="Costo combustible" value={fmtMoney(totales.costo)} />
        </div>
      </div>

      {/* Plan semanal */}
      {loading ? (
        <Panel>
          <div className="py-16 text-center font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em]">
            Calculando rutas óptimas…
          </div>
        </Panel>
      ) : plan.length === 0 ? (
        <Panel>
          <div className="py-16 text-center">
            <Sparkles size={28} className="text-ink-400 mx-auto mb-2" />
            <div className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em]">
              No hay rutas urgentes — todo está al día
            </div>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {plan.map((dia, idx) => (
            <DiaCard
              key={`${dia.zona.id}-${dia.fecha}`}
              dia={dia}
              expandido={expanded === idx}
              onToggle={() => setExpanded(expanded === idx ? -1 : idx)}
              onClienteClick={onClienteClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <div>
      <div className="stat-label mb-1">{label}</div>
      <div className="font-display font-semibold text-ink-50 text-[18px] tabular-nums">{value}</div>
    </div>
  )
}

function DiaCard({ dia, expandido, onToggle, onClienteClick }) {
  const { zona, clientes, total_clientes, total_equipos, km_total, tiempo_total_min, tiempo_total_horas,
          costo_gasolina, costo_casetas, cabe_en_dia, score_promedio } = dia
  const fechaFmt = new Date(dia.fecha).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const esForanea = zona.foranea

  return (
    <div className={`panel transition-all ${expandido ? 'shadow-card' : 'hover:shadow-soft'}`}>
      {/* Header del día */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-ink-850/40 transition-colors rounded-t-2xl"
      >
        {/* Día numerado */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center"
             style={{ background: `${zona.color}22`, border: `1px solid ${zona.color}55` }}>
          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: zona.color }}>
            día
          </span>
          <span className="font-display font-semibold text-[19px] leading-none" style={{ color: zona.color }}>
            {dia.dia}
          </span>
        </div>

        {/* Zona */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">{fechaFmt}</span>
            {esForanea && (
              <span className="badge-accent">
                <Plane size={9} /> Foránea · {zona.ciudad}
              </span>
            )}
            {!cabe_en_dia && (
              <span className="badge-warn">
                <AlertTriangle size={9} /> Excede 8h
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: zona.color }} />
            <h3 className="font-display font-semibold text-ink-50 text-[19px] leading-tight truncate">
              {zona.nombre}
            </h3>
          </div>
        </div>

        {/* Métricas resumen */}
        <div className="hidden md:grid grid-cols-4 gap-5 flex-shrink-0">
          <ResumenStat icon={Building2} value={total_clientes} label="clientes" />
          <ResumenStat icon={Droplet}   value={total_equipos} label="equipos" />
          <ResumenStat icon={MapPin}    value={`${fmtNumber(km_total, 0)} km`} label="recorrido" />
          <ResumenStat icon={Clock}     value={formatTime(tiempo_total_min)} label="tiempo" />
        </div>

        {/* Prioridad + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <PrioridadBadge score={score_promedio} />
          <ChevronDown
            size={18}
            className={`text-ink-400 transition-transform ${expandido ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded — detalle de la ruta */}
      {expandido && (
        <div className="border-t border-ink-800">
          {/* Sub-resumen */}
          <div className="px-5 py-3.5 bg-ink-850/40 grid grid-cols-2 md:grid-cols-5 gap-4 border-b border-ink-800">
            <Pequeño label="Clientes" value={total_clientes} />
            <Pequeño label="Tiempo total" value={formatTime(tiempo_total_min)} sub={`${tiempo_total_horas}h jornada`} />
            <Pequeño label="Combustible" value={fmtMoney(costo_gasolina)} />
            <Pequeño label="Casetas" value={costo_casetas > 0 ? fmtMoney(costo_casetas) : '—'} />
            <Pequeño label="Score promedio" value={score_promedio} />
          </div>

          {/* Lista ordenada de paradas */}
          <div className="px-5 py-4">
            <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5">
              <Zap size={10} /> Orden por proximidad · nearest-neighbor de cliente a cliente
            </div>

            <ol className="space-y-2 relative">
              {/* línea conectora */}
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-ink-800" />
              {clientes.map((c, i) => (
                <li
                  key={c.id}
                  onClick={() => onClienteClick && onClienteClick(c)}
                  className="relative flex items-start gap-3 pl-0 py-1.5 px-2 -mx-2 rounded-xl hover:bg-ink-850 transition-colors cursor-pointer"
                >
                  {/* Marker numerado */}
                  <span
                    className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono font-semibold text-[12px] shadow-soft"
                    style={{
                      background: i === 0 ? zona.color : '#ffffff',
                      color: i === 0 ? '#ffffff' : '#1a1410',
                      border: `1.5px solid ${zona.color}`,
                    }}
                  >
                    {c.orden}
                  </span>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-baseline justify-between gap-3 mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14px] font-semibold text-ink-50 truncate">{c.nombre}</span>
                        <span className="font-mono text-[10px] text-ink-400 flex-shrink-0">{c.codigo}</span>
                      </div>
                      <PrioridadBadge score={c.prioridad_score} />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-[11.5px] text-ink-300">
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={10} className="text-ink-400" />
                        {c.equipos} equipos
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Droplet size={10} className={c.aceite_restante_pct < 25 ? 'text-signal-alert' : c.aceite_restante_pct < 50 ? 'text-signal-warn' : 'text-signal-ok'} />
                        Aceite {c.aceite_restante_pct}%
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={10} className="text-ink-400" />
                        Última: hace {c.dias_ultima_visita}d
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} className="text-ink-400" />
                        ~{formatTime(c.tiempo_servicio_min)} servicio
                      </span>
                      {c.km_desde_anterior > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono text-ink-400">
                          <ArrowRight size={10} />
                          {fmtNumber(c.km_desde_anterior, 1)} km del anterior
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* Footer del día */}
            <div className="mt-5 pt-4 border-t border-ink-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-[12px] text-ink-300">
                <TrendingUp size={12} className="text-signal-ok" />
                <span>
                  <strong className="text-ink-50">{clientes.filter(c => c.prioridad_score >= 50).length} clientes urgentes</strong> incluidos en esta ruta.
                  Orden optimizado por cercanía — recorrido mínimo de {fmtNumber(km_total, 0)} km.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost">
                  <Fuel size={11} /> Asignar a operador
                </button>
                <button className="btn-primary">
                  <Sparkles size={11} /> Ejecutar ruta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResumenStat({ icon: Icon, value, label }) {
  return (
    <div className="text-center">
      <Icon size={13} strokeWidth={1.75} className="text-ink-400 mx-auto mb-0.5" />
      <div className="font-mono font-semibold text-ink-50 text-[13px] tabular-nums">{value}</div>
      <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function Pequeño({ label, value, sub }) {
  return (
    <div>
      <div className="stat-label mb-0.5">{label}</div>
      <div className="font-display font-semibold text-ink-50 text-[14px] tabular-nums">{value}</div>
      {sub && <div className="font-mono text-[10px] text-ink-400 mt-0.5">{sub}</div>}
    </div>
  )
}
