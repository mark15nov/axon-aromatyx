import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Globe, MessageCircle, Mail, User, Clock, AlertCircle, Phone } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtRelative, fmtDateTime } from '@/utils/format'
import { tickets as ticketsApi } from '@/services/api'

const CANAL_ICON = { web_publico: Globe, whatsapp: MessageCircle, email: Mail }
const CANAL_LABEL = { web_publico: 'Portal web', whatsapp: 'WhatsApp', email: 'Email' }

export function TicketDrawer({ ticket, onClose, onUpdate }) {
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  if (!ticket) return null
  const Canal = CANAL_ICON[ticket.canal] || Mail

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    const updated = await ticketsApi.update(ticket.id, {
      status: ticket.status === 'abierto' ? 'en_proceso' : ticket.status,
      mensajes: [
        ...(ticket.mensajes || []),
        {
          autor: 'equipo',
          nombre: 'Fernando Espinosa',
          texto: reply,
          fecha: new Date().toISOString(),
        },
      ],
    })
    setReply('')
    setSending(false)
    onUpdate(updated)
  }

  const cambiarStatus = async (nuevoStatus) => {
    const updated = await ticketsApi.update(ticket.id, { status: nuevoStatus })
    onUpdate(updated)
  }

  return createPortal(
    <div className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-ink-950 border-l border-ink-800 z-40 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">{ticket.folio}</span>
            <StatusBadge status={ticket.status} />
            <StatusBadge status={ticket.prioridad} label={`Prio. ${ticket.prioridad}`} />
          </div>
          <h2 className="font-display font-semibold text-ink-50 text-lg leading-tight">{ticket.asunto}</h2>
        </div>
        <button onClick={onClose} className="text-ink-500 hover:text-ink-100 p-1">
          <X size={18} />
        </button>
      </div>

      {/* Cliente */}
      <div className="px-5 py-3 border-b border-ink-800 bg-ink-900/40">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-0.5">Cliente</div>
            <div className="text-ink-100 font-medium truncate">{ticket.cliente}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Canal size={9} /> {CANAL_LABEL[ticket.canal]}
            </div>
            <div className="text-ink-300 font-mono text-[11px] truncate">
              {ticket.contacto?.email || '—'}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <User size={9} /> Asignado
            </div>
            <div className="text-ink-200 truncate">{ticket.asignado || 'Sin asignar'}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Clock size={9} /> Abierto
            </div>
            <div className="text-ink-200 font-mono text-[11px]">{fmtRelative(ticket.fecha)}</div>
          </div>
        </div>

        {ticket.status !== 'resuelto' && ticket.status !== 'cerrado' && (
          <div className="mt-3 pt-3 border-t border-ink-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={9} /> SLA · {ticket.sla_horas}h
              </span>
              <span className={`font-mono text-[11px] tabular-nums ${
                ticket.horas_abierto > ticket.sla_horas ? 'text-signal-alert' : 'text-ink-300'
              }`}>
                {ticket.horas_abierto}h / {ticket.sla_horas}h
              </span>
            </div>
            <div className="h-1 bg-ink-800 overflow-hidden">
              <div
                className={`h-full ${
                  ticket.horas_abierto > ticket.sla_horas
                    ? 'bg-red-500'
                    : ticket.horas_abierto > ticket.sla_horas * 0.8
                    ? 'bg-amber-500'
                    : 'bg-steel-600'
                }`}
                style={{ width: `${Math.min(100, (ticket.horas_abierto / ticket.sla_horas) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline mensajes */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.2em] mb-2">
          Conversación · {ticket.mensajes?.length || 0}
        </div>
        {(ticket.mensajes || []).map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.autor === 'equipo' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-mono text-[11px] ${
              m.autor === 'equipo'
                ? 'bg-steel-600 text-white'
                : 'bg-ink-800 border border-ink-700 text-ink-300'
            }`}>
              {m.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className={`flex-1 max-w-[80%] ${m.autor === 'equipo' ? 'text-right' : ''}`}>
              <div className={`flex items-baseline gap-2 mb-1 ${m.autor === 'equipo' ? 'justify-end' : ''}`}>
                <span className="text-xs text-ink-200 font-medium">{m.nombre}</span>
                <span className="font-mono text-[10px] text-ink-500">{fmtRelative(m.fecha)}</span>
              </div>
              <div className={`p-3 text-sm leading-relaxed border ${
                m.autor === 'equipo'
                  ? 'bg-steel-50 border-steel-200 text-ink-100'
                  : 'bg-ink-900 border-ink-800 text-ink-200'
              }`}>
                {m.texto}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status switcher */}
      <div className="border-t border-ink-800 px-5 py-3 flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Cambiar a:</span>
        {['abierto', 'en_proceso', 'resuelto', 'cerrado'].filter(s => s !== ticket.status).map(s => (
          <button
            key={s}
            onClick={() => cambiarStatus(s)}
            className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border border-ink-700 text-ink-300 hover:border-steel-600 hover:text-steel-700 transition-colors"
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Reply box */}
      <div className="border-t border-ink-800 p-4">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Escribe una respuesta al cliente..."
          rows={3}
          className="input resize-none mb-3 text-sm"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button title="Adjuntar email" className="p-2 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
              <Mail size={14} />
            </button>
            <button title="Llamar" className="p-2 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
              <Phone size={14} />
            </button>
          </div>
          <button
            onClick={sendReply}
            disabled={!reply.trim() || sending}
            className="btn-primary disabled:opacity-50"
          >
            {sending ? 'Enviando...' : <>Responder <Send size={11} /></>}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
