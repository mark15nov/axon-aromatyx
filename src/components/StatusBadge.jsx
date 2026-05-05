const VARIANTS = {
  ok: 'badge-ok',
  warn: 'badge-warn',
  alert: 'badge-alert',
  neutral: 'badge-neutral',
  accent: 'badge-accent',
}

const STOCK_MAP = { ok: 'ok', bajo: 'warn', critico: 'alert' }
const STATUS_MAP = {
  al_dia: 'ok', por_vencer: 'warn', vencido: 'alert', parcial: 'warn', pagado: 'ok',
  abierto: 'alert', en_proceso: 'warn', resuelto: 'ok', cerrado: 'neutral',
  alta: 'alert', media: 'warn', baja: 'neutral',
  urgente: 'alert', pendiente: 'warn',
  agendado: 'warn', en_curso: 'ok', completado: 'neutral',
  nuevo: 'accent', contactado: 'warn', cita_agendada: 'ok', descartado: 'neutral',
}

const DOT_COLOR = {
  ok: 'bg-signal-ok',
  warn: 'bg-signal-warn',
  alert: 'bg-signal-alert',
  neutral: 'bg-ink-400',
  accent: 'bg-steel-500',
}

export function StatusBadge({ status, label, variant }) {
  const v = variant || STOCK_MAP[status] || STATUS_MAP[status] || 'neutral'
  const text = label || (status || '').replace(/_/g, ' ')
  return (
    <span className={VARIANTS[v]}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[v]} ${v === 'alert' ? 'pulse-dot' : ''}`} />
      <span className="capitalize">{text}</span>
    </span>
  )
}
