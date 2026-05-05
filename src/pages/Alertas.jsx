import { useEffect, useState } from 'react'
import {
  AlertTriangle, AlertCircle, Bell, ShoppingCart, Route, Mail, Users,
  Target, Calendar, TrendingUp, ChevronDown, Check, Zap, Filter, Clock,
} from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatCard } from '@/components/StatCard'
import { fmtRelative, fmtMoney } from '@/utils/format'
import { alertas } from '@/services/api'

const ICONS = {
  ShoppingCart, Route, Mail, Users, Target, Calendar, TrendingUp,
}

const SEVERIDAD = {
  alta: {
    color: 'border-l-signal-alert',
    bg: 'bg-red-50',
    icon: AlertTriangle,
    iconColor: 'text-signal-alert',
    label: 'Crítico',
    badge: 'badge-alert',
  },
  media: {
    color: 'border-l-signal-warn',
    bg: 'bg-amber-50',
    icon: AlertCircle,
    iconColor: 'text-signal-warn',
    label: 'Medio',
    badge: 'badge-warn',
  },
  baja: {
    color: 'border-l-steel-500',
    bg: 'bg-steel-50/40',
    icon: Bell,
    iconColor: 'text-steel-700',
    label: 'Informativo',
    badge: 'badge-neutral',
  },
}

export default function Alertas() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('todas')
  const [expanded, setExpanded] = useState(null)
  const [executed, setExecuted] = useState({})

  useEffect(() => { alertas.list().then(setItems) }, [])

  const filtered = filter === 'todas'
    ? items
    : items.filter(a => a.severidad === filter || a.modulo === filter)

  const altas = items.filter(a => a.severidad === 'alta').length
  const medias = items.filter(a => a.severidad === 'media').length
  const bajas = items.filter(a => a.severidad === 'baja').length

  const ejecutar = async (alertId, accionId) => {
    setExecuted(e => ({ ...e, [`${alertId}-${accionId}`]: 'ejecutando' }))
    await alertas.ejecutarAccion(alertId, accionId)
    setExecuted(e => ({ ...e, [`${alertId}-${accionId}`]: 'ok' }))
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total alertas" value={items.length} sub="Detectadas hoy" accent />
        <StatCard label="Críticas" value={altas} sub="Acción inmediata" danger />
        <StatCard label="Medias" value={medias} sub="Atender esta semana" warn />
        <StatCard label="Informativas" value={bajas} sub="Tendencias y oportunidades" />
      </div>

      {/* Hero explicativo */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-steel-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="px-6 py-5 flex items-start gap-4 relative">
          <div className="w-10 h-10 bg-steel-50 border border-steel-200 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-steel-700" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.25em] mb-1">
              Motor de alertas tempranas
            </div>
            <h3 className="font-display font-bold text-ink-50 text-xl tracking-tight mb-1">
              El sistema detectó {items.length} situaciones que requieren atención
            </h3>
            <p className="text-sm text-ink-400 leading-relaxed">
              Cada alerta cruza datos entre módulos: inventario × rutas × finanzas × atención. Las acciones ejecutables
              llaman directamente a los módulos correspondientes — un click y se ejecuta.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          <Filter size={12} className="text-ink-500" />
          <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Filtrar:</span>
          {[
            { v: 'todas', l: 'Todas' },
            { v: 'alta', l: 'Críticas' },
            { v: 'media', l: 'Medias' },
            { v: 'baja', l: 'Bajas' },
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                filter === f.v
                  ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                  : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
              }`}
            >
              {f.l}
            </button>
          ))}
          <div className="h-5 w-px bg-ink-700" />
          {['inventarios', 'finanzas', 'rutas', 'atencion', 'ventas'].map(m => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                filter === m
                  ? 'bg-steel-600 border-steel-600 text-white'
                  : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Panel>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {filtered.map(alert => {
          const sev = SEVERIDAD[alert.severidad]
          const Icon = sev.icon
          const isExpanded = expanded === alert.id

          return (
            <div
              key={alert.id}
              className={`panel border-l-2 ${sev.color} ${sev.bg} relative overflow-hidden transition-all`}
            >
              <div className="px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-9 h-9 border flex items-center justify-center ${
                    alert.severidad === 'alta' ? 'border-signal-alertBorder bg-red-50' :
                    alert.severidad === 'media' ? 'border-signal-warnBorder bg-amber-50' :
                    'border-steel-300 bg-steel-100/50'
                  }`}>
                    <Icon size={16} className={sev.iconColor} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={sev.badge}>{sev.label}</span>
                        <span className="badge-neutral">{alert.modulo_label}</span>
                        <span className="font-mono text-[10px] text-ink-500 flex items-center gap-1">
                          <Clock size={9} />
                          {fmtRelative(alert.fecha)}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display font-semibold text-ink-50 mb-1 leading-tight">
                      {alert.titulo}
                    </h3>
                    <p className="text-sm text-ink-300 leading-relaxed mb-3">
                      {alert.descripcion}
                    </p>

                    {/* Contexto numérico (si aplica) */}
                    {alert.contexto && Object.keys(alert.contexto).filter(k => typeof alert.contexto[k] === 'number').length > 0 && (
                      <div className="flex items-center gap-4 mb-3 pb-3 border-b border-ink-800">
                        {Object.entries(alert.contexto).filter(([_, v]) => typeof v === 'number').map(([k, v]) => (
                          <div key={k}>
                            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-0.5">
                              {k.replace(/_/g, ' ')}
                            </div>
                            <div className="font-mono font-semibold text-ink-100 text-base tabular-nums">
                              {k.includes('monto') || k.includes('costo')
                                ? fmtMoney(v)
                                : v.toLocaleString('es-MX')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {alert.acciones.map(accion => {
                        const AccIcon = accion.icono ? ICONS[accion.icono] : null
                        const state = executed[`${alert.id}-${accion.id}`]
                        return (
                          <button
                            key={accion.id}
                            onClick={() => ejecutar(alert.id, accion.id)}
                            disabled={state === 'ejecutando' || state === 'ok'}
                            className={state === 'ok'
                              ? 'btn bg-green-50 border-signal-okBorder text-signal-ok cursor-default'
                              : accion.tipo === 'primary' ? 'btn-primary' : 'btn-ghost'
                            }
                          >
                            {state === 'ok' ? (
                              <><Check size={11} /> Ejecutado</>
                            ) : state === 'ejecutando' ? (
                              <>Ejecutando...</>
                            ) : (
                              <>
                                {AccIcon && <AccIcon size={11} />}
                                {accion.label}
                              </>
                            )}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : alert.id)}
                        className="ml-auto font-mono text-[10px] text-ink-500 hover:text-ink-200 uppercase tracking-wider flex items-center gap-1"
                      >
                        {isExpanded ? 'Ocultar plan' : 'Ver plan completo'}
                        <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Plan expandido */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-ink-800 space-y-2">
                        <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.2em] mb-2">
                          Plan de acción detallado
                        </div>
                        <PlanAccion alert={alert} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="panel py-16 text-center">
          <Bell size={28} className="text-ink-700 mx-auto mb-3" />
          <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
            No hay alertas con este filtro
          </div>
        </div>
      )}
    </div>
  )
}

function PlanAccion({ alert }) {
  // Mini plan generado contextualmente
  const planes = {
    inventario: [
      'Sistema genera orden de compra al proveedor preferido',
      'Email automático al equipo de compras con desglose',
      'Notificación a producción del próximo abasto estimado',
      'Actualización del módulo Inventarios con la OC pendiente',
    ],
    rutas: [
      'Sistema agrupa clientes urgentes por proximidad geográfica',
      'Asigna automáticamente al operador con menos carga',
      'Genera ruta optimizada con tiempo estimado',
      'Envía notificación al operador con la nueva agenda',
    ],
    finanzas: [
      'Sistema redacta correos de cobranza personalizados por antigüedad',
      'Envía recordatorios escalonados (cordial → directo → escalada)',
      'Registra cada interacción en el historial del cliente',
      'Genera reporte para el área de cobranza',
    ],
    atencion: [
      'Identifica operadores disponibles con menor carga',
      'Reasigna tickets manteniendo prioridad alta arriba',
      'Notifica a los nuevos asignados en Slack/Email',
      'Reinicia el contador SLA con el nuevo responsable',
    ],
    oportunidad: [
      'Cruza zona con base de prospectos disponibles',
      'Filtra por sector más afín al portfolio actual',
      'Genera campaña de email automatizada al lote',
      'Conecta resultados directamente al CRM del módulo Ventas',
    ],
    tendencia: [
      'Analiza serie histórica de salidas',
      'Calcula stock óptimo con factor de seguridad ajustado',
      'Genera proyección de demanda a 90 días',
      'Sugiere nivel mínimo y de reorden actualizado',
    ],
  }

  const pasos = planes[alert.tipo] || planes['inventario']

  return (
    <ol className="space-y-2">
      {pasos.map((paso, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-5 h-5 bg-ink-800 border border-ink-700 flex items-center justify-center font-mono text-[10px] text-ink-300">
            {i + 1}
          </span>
          <span className="text-sm text-ink-200 leading-relaxed">{paso}</span>
        </li>
      ))}
    </ol>
  )
}
