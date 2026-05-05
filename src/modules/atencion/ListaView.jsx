import { Globe, MessageCircle, Mail, AlertCircle } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtRelative } from '@/utils/format'

const CANAL_ICON = { web_publico: Globe, whatsapp: MessageCircle, email: Mail }

export function ListaView({ tickets, onSelect, selectedId }) {
  return (
    <div className="panel">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-head">Folio</th>
              <th className="table-head">Asunto</th>
              <th className="table-head">Cliente</th>
              <th className="table-head">Canal</th>
              <th className="table-head">Prioridad</th>
              <th className="table-head">SLA</th>
              <th className="table-head">Estado</th>
              <th className="table-head">Asignado</th>
              <th className="table-head">Recibido</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => {
              const Canal = CANAL_ICON[t.canal] || Mail
              const slaPct = (t.horas_abierto / t.sla_horas) * 100
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className={`cursor-pointer transition-colors ${selectedId === t.id ? 'bg-ink-800' : 'hover:bg-ink-900'}`}
                >
                  <td className="table-cell font-mono text-[11px] text-ink-300">{t.folio}</td>
                  <td className="table-cell">
                    <div className="text-ink-100 font-medium truncate max-w-xs">{t.asunto}</div>
                  </td>
                  <td className="table-cell text-ink-300 text-[12px] truncate max-w-[180px]">{t.cliente}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase text-ink-400">
                      <Canal size={11} /> {t.canal.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="table-cell"><StatusBadge status={t.prioridad} /></td>
                  <td className="table-cell">
                    {t.status === 'resuelto' || t.status === 'cerrado' ? (
                      <span className="font-mono text-[10px] text-ink-500">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {slaPct > 80 && <AlertCircle size={10} className="text-signal-alert" />}
                        <div className="w-12 h-1 bg-ink-800">
                          <div className={`h-full ${
                            slaPct > 100 ? 'bg-red-500' : slaPct > 80 ? 'bg-amber-500' : 'bg-steel-600'
                          }`} style={{ width: `${Math.min(100, slaPct)}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-ink-400 tabular-nums">{Math.round(slaPct)}%</span>
                      </div>
                    )}
                  </td>
                  <td className="table-cell"><StatusBadge status={t.status} /></td>
                  <td className="table-cell text-ink-300 text-[12px]">{t.asignado || '—'}</td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">{fmtRelative(t.fecha)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
