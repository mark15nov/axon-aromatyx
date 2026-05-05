import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { tickets } from '@/services/api'

export default function ReportePublico() {
  const [sent, setSent] = useState(null)
  const [form, setForm] = useState({
    cliente: '', empresa: '', email: '', telefono: '',
    asunto: '', prioridad: 'media', mensaje: '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ticket = await tickets.create({
      cliente: `${form.empresa} — ${form.cliente}`,
      asunto: form.asunto,
      prioridad: form.prioridad,
      canal: 'web_publico',
      contacto: { email: form.email, telefono: form.telefono },
      mensaje: form.mensaje,
    })
    setSent(ticket)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="panel max-w-md w-full text-center shadow-lift float-in">
          <div className="px-8 py-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-signal-okBg border border-signal-okBorder flex items-center justify-center mb-5">
              <CheckCircle2 size={28} strokeWidth={1.75} className="text-signal-ok" />
            </div>
            <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.22em] mb-2">
              Reporte recibido
            </div>
            <h2 className="font-display font-semibold text-ink-50 text-3xl tracking-tight mb-2">
              ¡Gracias, <span className="italic text-steel-600">{form.cliente.split(' ')[0]}</span>!
            </h2>
            <p className="text-[14px] text-ink-300 leading-relaxed mb-6">
              Tu reporte fue registrado. Un asesor de Aromatyx te contactará en las próximas horas hábiles.
            </p>
            <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 mb-6">
              <div className="stat-label mb-1">Folio de seguimiento</div>
              <div className="font-mono font-semibold text-ink-50 text-lg tracking-wider">{sent.folio}</div>
            </div>
            <button
              onClick={() => { setSent(null); setForm({ cliente: '', empresa: '', email: '', telefono: '', asunto: '', prioridad: 'media', mensaje: '' }) }}
              className="btn-ghost"
            >
              Reportar algo más
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 relative">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-10">
          <span className="brand-mark rounded-2xl w-11 h-11">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <path d="M16 5c5 4 8 8 8 13a8 8 0 1 1-16 0c0-5 3-9 8-13z" fill="currentColor" opacity="0.95" />
              <circle cx="13" cy="17" r="2" fill="rgba(255,255,255,0.5)" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="font-display font-semibold text-ink-50 text-xl tracking-tight">Aromatyx</div>
            <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.2em]">Centro de soporte</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-steel-50 border border-steel-200">
            <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />
            <span className="font-mono text-[10px] text-steel-700 uppercase tracking-[0.18em]">Formulario de soporte</span>
          </div>
          <h1 className="font-display font-semibold text-ink-50 text-[40px] leading-[1.05] tracking-tight mb-3">
            ¿En qué <span className="italic text-steel-600">podemos ayudarte</span>?
          </h1>
          <p className="text-ink-300 text-[14.5px] leading-relaxed">
            Cuéntanos lo que está pasando con tus difusores. Nuestro equipo revisará tu reporte
            y te contactará para resolverlo lo antes posible.
          </p>
        </div>

        <form onSubmit={submit} className="panel">
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tu nombre" required>
                <input
                  required
                  value={form.cliente}
                  onChange={e => setForm({ ...form, cliente: e.target.value })}
                  className="input"
                  placeholder="Ej. Juan Pérez"
                />
              </Field>
              <Field label="Empresa" required>
                <input
                  required
                  value={form.empresa}
                  onChange={e => setForm({ ...form, empresa: e.target.value })}
                  className="input"
                  placeholder="Ej. Hotel Camino Real"
                />
              </Field>
              <Field label="Email" required>
                <input
                  required type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="tu@empresa.com"
                />
              </Field>
              <Field label="Teléfono">
                <input
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className="input font-mono"
                  placeholder="55 0000 0000"
                />
              </Field>
            </div>

            <div className="border-t border-ink-800 pt-5 space-y-4">
              <Field label="Asunto" required>
                <input
                  required
                  value={form.asunto}
                  onChange={e => setForm({ ...form, asunto: e.target.value })}
                  className="input"
                  placeholder="Ej. El difusor del lobby no está prendiendo"
                />
              </Field>

              <Field label="Prioridad">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'baja', l: 'Baja', d: 'No es urgente' },
                    { v: 'media', l: 'Media', d: 'Esta semana' },
                    { v: 'alta', l: 'Alta', d: 'Atención inmediata' },
                  ].map(p => (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => setForm({ ...form, prioridad: p.v })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        form.prioridad === p.v
                          ? 'border-steel-500 bg-steel-50 shadow-soft'
                          : 'border-ink-800 bg-ink-900 hover:border-ink-700 hover:bg-ink-850'
                      }`}
                    >
                      <div className={`font-medium text-[12.5px] mb-0.5 ${
                        form.prioridad === p.v ? 'text-steel-700' : 'text-ink-100'
                      }`}>
                        {p.l}
                      </div>
                      <div className="text-[11px] text-ink-400">{p.d}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Describe el problema" required>
                <textarea
                  required rows={5}
                  value={form.mensaje}
                  onChange={e => setForm({ ...form, mensaje: e.target.value })}
                  className="input resize-none"
                  placeholder="Cuéntanos lo más detallado posible: cuándo empezó, qué difusor es, en qué zona del establecimiento, etc."
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-ink-800 px-6 py-4 flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
              Tiempo de respuesta: 4-6 hrs hábiles
            </span>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Enviando...' : <>Enviar reporte <Send size={11} /></>}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center font-mono text-[10px] text-ink-600 uppercase tracking-wider">
          Aromatyx · Soluciones de aroma para empresas · CDMX
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="stat-label block mb-2">
        {label} {required && <span className="text-steel-600">*</span>}
      </label>
      {children}
    </div>
  )
}
