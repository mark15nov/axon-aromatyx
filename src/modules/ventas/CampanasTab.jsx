import { useEffect, useState } from 'react'
import { Bot, Mail, Eye, Calendar, Pause, Play, Plus, Target } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney, fmtRelative } from '@/utils/format'
import { ventas } from '@/services/api'

export function CampanasTab() {
  const [campanas, setCampanas] = useState([])

  useEffect(() => { ventas.listCampanas().then(setCampanas) }, [])

  return (
    <div className="space-y-4">
      {/* Hero del agente */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-steel-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="px-6 py-5 flex items-start gap-4 relative">
          <div className="w-12 h-12 bg-steel-50 border border-steel-200 flex items-center justify-center flex-shrink-0">
            <Bot size={20} className="text-steel-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.25em]">
                Agente de prospección automática
              </span>
              <span className="badge-ok">
                <span className="w-1 h-1 rounded-full bg-green-400 pulse-dot" />
                Activo
              </span>
            </div>
            <h3 className="font-display font-bold text-ink-50 text-xl tracking-tight mb-1">
              El sistema está prospectando 24/7
            </h3>
            <p className="text-sm text-ink-400 leading-relaxed mb-3 max-w-3xl">
              Los agentes hacen scraping de fuentes públicas (Google Maps, LinkedIn, directorios), califican prospectos
              con IA, redactan emails personalizados, y agendan citas automáticamente. <strong className="text-ink-200">Tu equipo solo entra
              cuando ya hay cita confirmada.</strong>
            </p>
            <div className="flex items-center gap-3">
              <button className="btn-primary">
                <Plus size={11} />
                Nueva campaña
              </button>
              <button className="btn-ghost">
                <Target size={11} />
                Ver oportunidades de zona
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de campañas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {campanas.map(c => {
          const tasaApertura = c.emails_enviados ? Math.round((c.emails_abiertos / c.emails_enviados) * 100) : 0
          const tasaRespuesta = c.emails_enviados ? Math.round((c.respuestas / c.emails_enviados) * 100) : 0
          const tasaCita = c.respuestas ? Math.round((c.citas_agendadas / c.respuestas) * 100) : 0

          return (
            <div key={c.id} className="panel">
              <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">CMP-{String(c.id).padStart(3, '0')}</span>
                    <span className="badge-neutral">{c.sector}</span>
                  </div>
                  <h3 className="font-display font-semibold text-ink-50 leading-tight truncate">{c.nombre}</h3>
                  <div className="font-mono text-[10px] text-ink-500 mt-1 flex items-center gap-1">
                    <Bot size={9} /> {c.fuente}
                  </div>
                </div>
                {c.status === 'activa' ? (
                  <button className="badge-ok">
                    <span className="w-1 h-1 rounded-full bg-green-400 pulse-dot" />
                    Activa
                  </button>
                ) : (
                  <span className="badge-neutral">
                    <Pause size={8} />
                    Pausada
                  </span>
                )}
              </div>

              {/* Embudo */}
              <div className="p-5">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <FunnelStep icon={Bot} label="Scrapeados" value={c.prospectos_total} sub={`+${c.prospectos_nuevos} nuevos`} />
                  <FunnelStep icon={Mail} label="Emails" value={c.emails_enviados} />
                  <FunnelStep icon={Eye} label="Abiertos" value={c.emails_abiertos} sub={`${tasaApertura}%`} />
                  <FunnelStep icon={Calendar} label="Citas" value={c.citas_agendadas} sub={`${tasaCita}% conv.`} highlight />
                </div>

                {/* Embudo visual */}
                <div className="space-y-1.5 mb-4">
                  <FunnelBar label="Emails enviados" value={c.emails_enviados} max={c.emails_enviados} color="#525252" />
                  <FunnelBar label="Abiertos" value={c.emails_abiertos} max={c.emails_enviados} color="#d97706" />
                  <FunnelBar label="Respondieron" value={c.respuestas} max={c.emails_enviados} color="#3b82f6" />
                  <FunnelBar label="Cita agendada" value={c.citas_agendadas} max={c.emails_enviados} color="#16a34a" />
                </div>

                {/* Footer */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-ink-800">
                  <div>
                    <div className="stat-label mb-0.5">Pipeline</div>
                    <div className="font-mono font-semibold text-ink-50 tabular-nums">{fmtMoney(c.valor_pipeline)}</div>
                  </div>
                  <div>
                    <div className="stat-label mb-0.5">Inicio</div>
                    <div className="font-mono text-[12px] text-ink-200">{fmtRelative(c.fecha_inicio)}</div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="border-t border-ink-800 grid grid-cols-3 divide-x divide-ink-800">
                <button className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-300 hover:bg-ink-900 transition-colors">
                  Ver prospectos
                </button>
                <button className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-300 hover:bg-ink-900 transition-colors">
                  Editar plantillas
                </button>
                <button className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-300 hover:bg-ink-900 transition-colors flex items-center justify-center gap-1.5">
                  {c.status === 'activa' ? <><Pause size={10} /> Pausar</> : <><Play size={10} /> Activar</>}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FunnelStep({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className={`p-2.5 border ${highlight ? 'border-signal-okBorder bg-green-50' : 'border-ink-800 bg-ink-950'}`}>
      <Icon size={12} className={highlight ? 'text-signal-ok mb-1' : 'text-ink-400 mb-1'} />
      <div className={`font-mono font-bold text-lg tabular-nums ${highlight ? 'text-signal-ok' : 'text-ink-100'}`}>
        {value}
      </div>
      <div className="font-mono text-[9px] text-ink-500 uppercase tracking-wider truncate">{label}</div>
      {sub && <div className="font-mono text-[9px] text-ink-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function FunnelBar({ label, value, max, color }) {
  const pct = max ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-[10px] text-ink-300 tabular-nums">{value} <span className="text-ink-500">· {Math.round(pct)}%</span></span>
      </div>
      <div className="h-1 bg-ink-800 overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
