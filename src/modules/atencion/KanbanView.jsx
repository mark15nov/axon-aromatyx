import { Globe, MessageCircle, Mail, Clock, User } from 'lucide-react'
import { fmtRelative } from '@/utils/format'

const COLUMNS = [
  { id: 'abierto', label: 'Abiertos', color: 'border-signal-alertBorder' },
  { id: 'en_proceso', label: 'En proceso', color: 'border-signal-warnBorder' },
  { id: 'resuelto', label: 'Resueltos', color: 'border-signal-okBorder' },
  { id: 'cerrado', label: 'Cerrados', color: 'border-ink-700' },
]

const CANAL_ICON = {
  web_publico: Globe,
  whatsapp: MessageCircle,
  email: Mail,
}

const PRIO_DOT = {
  alta: 'bg-red-500',
  media: 'bg-amber-500',
  baja: 'bg-ink-500',
}

export function KanbanView({ tickets, onSelect, selectedId }) {
  const grouped = COLUMNS.map(c => ({
    ...c,
    items: tickets.filter(t => t.status === c.id),
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {grouped.map(col => (
        <div key={col.id} className={`bg-ink-950/50 border-t-2 ${col.color}`}>
          <div className="px-3 py-3 flex items-center justify-between border-b border-ink-800">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-300 font-medium">
                {col.label}
              </h3>
              <span className="font-mono text-[10px] bg-ink-800 px-1.5 py-0.5 text-ink-400">
                {col.items.length}
              </span>
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {col.items.map(t => {
              const Canal = CANAL_ICON[t.canal] || Mail
              const slaPct = Math.min(100, (t.horas_abierto / t.sla_horas) * 100)
              const slaCritico = slaPct > 80
              return (
                <button
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className={`w-full text-left bg-ink-900 border p-3 hover:border-steel-600 transition-all ${
                    selectedId === t.id ? 'border-steel-600 bg-ink-800' : 'border-ink-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${PRIO_DOT[t.prioridad]}`} />
                      <span className="font-mono text-[10px] text-ink-500">{t.folio}</span>
                    </div>
                    <Canal size={11} className="text-ink-500" />
                  </div>
                  <div className="text-sm text-ink-100 leading-snug mb-2 line-clamp-2">{t.asunto}</div>
                  <div className="text-[11px] text-ink-400 truncate mb-3">{t.cliente}</div>

                  {t.status !== 'resuelto' && t.status !== 'cerrado' && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between font-mono text-[9px] mb-0.5">
                        <span className="text-ink-500 uppercase">SLA</span>
                        <span className={slaCritico ? 'text-signal-alert' : 'text-ink-400'}>
                          {Math.round(slaPct)}%
                        </span>
                      </div>
                      <div className="h-0.5 bg-ink-800">
                        <div className={`h-full ${slaCritico ? 'bg-red-500' : 'bg-steel-600'}`} style={{ width: `${slaPct}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between font-mono text-[10px] text-ink-500">
                    <span className="flex items-center gap-1">
                      <User size={9} />
                      {t.asignado || 'Sin asignar'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={9} />
                      {fmtRelative(t.fecha)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
