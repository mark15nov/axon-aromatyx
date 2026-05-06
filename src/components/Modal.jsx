import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modal centrado con portal, ESC, click-outside.
 * Props:
 *  - title (string|node)        — título del header
 *  - icon (component)           — icono opcional en el header (sm)
 *  - tone ('ok'|'warn'|'alert'|'accent') — color del icono badge
 *  - footer (node)              — contenido del footer (botones)
 *  - width (number)             — ancho en px (default 520)
 *  - onClose (fn)               — required
 *  - children                   — body
 */
export function Modal({
  title,
  icon: Icon,
  tone = 'accent',
  footer,
  width = 520,
  onClose,
  children,
}) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toneClass = {
    ok:     'bg-signal-okBg text-signal-ok',
    warn:   'bg-signal-warnBg text-signal-warn',
    alert:  'bg-signal-alertBg text-signal-alert',
    accent: 'bg-steel-50 text-steel-700',
  }[tone] || 'bg-steel-50 text-steel-700'

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-ink-50/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="panel fixed z-50 shadow-lift flex flex-col max-h-[88vh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 modal-pop"
        style={{ width, maxWidth: 'calc(100vw - 24px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="panel-header flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${toneClass}`}>
                <Icon size={14} strokeWidth={2} />
              </span>
            )}
            <span className="panel-title truncate">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-ink-850 flex items-center justify-center text-ink-400 hover:text-ink-100 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {children}
        </div>

        {footer && (
          <div className="border-t border-ink-800 p-4 flex-shrink-0 bg-ink-900 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body,
  )
}

export function FormField({ label, hint, required, children }) {
  return (
    <div>
      <label className="stat-label block mb-2">
        {label} {required && <span className="text-steel-600">*</span>}
      </label>
      {children}
      {hint && <div className="font-mono text-[10.5px] text-ink-400 mt-1.5">{hint}</div>}
    </div>
  )
}
