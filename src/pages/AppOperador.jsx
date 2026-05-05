import { useEffect, useState } from 'react'
import { CheckCircle2, MapPin, Building2, Droplet, Wrench, ChevronRight, ArrowLeft, User } from 'lucide-react'
import { rutas } from '@/services/api'

export default function AppOperador() {
  const [step, setStep] = useState('login') // login | clientes | reporte | enviado
  const [operador, setOperador] = useState(null)
  const [clientes, setClientes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [zonas, setZonas] = useState([])
  const [clienteSel, setClienteSel] = useState(null)
  const [reporte, setReporte] = useState({
    aceite_restante_pct: 50,
    necesita_recarga: false,
    necesita_servicio: false,
    equipos_revisados: 1,
    observaciones: '',
    proxima_accion: 'recarga',
  })
  const [folioEnviado, setFolioEnviado] = useState(null)

  useEffect(() => {
    rutas.listOperadores().then(setOperadores)
    rutas.listZonas().then(setZonas)
  }, [])

  useEffect(() => {
    if (operador) {
      rutas.listClientes().then(cs =>
        setClientes(cs.filter(c => c.operador_id === operador.id))
      )
    }
  }, [operador])

  const submit = async () => {
    const r = await rutas.registrarVisita({
      cliente_id: clienteSel.id,
      cliente_nombre: clienteSel.nombre,
      zona: clienteSel.zona_id,
      operador: operador.nombre,
      ...reporte,
    })
    setFolioEnviado(r.folio)
    setStep('enviado')
  }

  // ─────────── LOGIN ───────────
  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center gap-3 mb-10">
            <span className="brand-mark rounded-2xl w-11 h-11">
              <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                <path d="M16 5c5 4 8 8 8 13a8 8 0 1 1-16 0c0-5 3-9 8-13z" fill="currentColor" opacity="0.95" />
                <circle cx="13" cy="17" r="2" fill="rgba(255,255,255,0.5)" />
              </svg>
            </span>
            <div className="leading-tight">
              <div className="font-display font-semibold text-ink-50 text-xl tracking-tight">Aromatyx</div>
              <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.2em]">App de operador</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-steel-50 border border-steel-200">
            <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />
            <span className="font-mono text-[10px] text-steel-700 uppercase tracking-[0.18em]">Selecciona tu perfil</span>
          </div>
          <h1 className="font-display font-semibold text-ink-50 text-[36px] leading-tight tracking-tight mb-8">
            ¿Quién <span className="italic text-steel-600">eres</span>?
          </h1>

          <div className="space-y-2.5">
            {operadores.filter(o => o.activo).map(op => (
              <button
                key={op.id}
                onClick={() => { setOperador(op); setStep('clientes') }}
                className="w-full panel hover:shadow-card hover:border-steel-300 transition-all p-4 flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-steel-400 to-steel-600 flex items-center justify-center font-display font-semibold text-white shadow-soft">
                  {op.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold text-ink-50 text-[17px]">{op.nombre}</div>
                  <div className="text-[12px] text-ink-300">
                    {op.zonas.length} zonas asignadas
                  </div>
                </div>
                <ChevronRight size={18} strokeWidth={1.75} className="text-ink-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─────────── LISTA DE CLIENTES ───────────
  if (step === 'clientes') {
    return (
      <div className="min-h-screen p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7 pt-4">
          <button onClick={() => { setOperador(null); setStep('login') }} className="w-10 h-10 rounded-full border border-ink-800 bg-ink-900 text-ink-200 hover:bg-ink-850 transition-colors flex items-center justify-center">
            <ArrowLeft size={17} strokeWidth={1.75} />
          </button>
          <div className="flex-1">
            <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">Operador</div>
            <div className="font-display font-semibold text-ink-50 text-[17px]">{operador.nombre}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-steel-400 to-steel-600 flex items-center justify-center font-display font-semibold text-white shadow-soft">
            {operador.avatar}
          </div>
        </div>

        <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.22em] mb-2">
          Tus clientes asignados
        </div>
        <h1 className="font-display font-semibold text-ink-50 text-[30px] leading-tight tracking-tight mb-1">
          Reporta <span className="italic text-steel-600">una visita</span>
        </h1>
        <p className="text-[14px] text-ink-300 mb-7">Selecciona el cliente que acabas de visitar.</p>

        {/* Lista por zona */}
        {operador.zonas.map(zid => {
          const z = zonas.find(z => z.id === zid)
          const clientesZona = clientes.filter(c => c.zona_id === zid)
          if (!z || !clientesZona.length) return null

          return (
            <div key={zid} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-300 font-medium">
                  {z.nombre} · {clientesZona.length} clientes
                </span>
              </div>
              <div className="space-y-2">
                {clientesZona.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setClienteSel(c); setStep('reporte') }}
                    className="w-full panel hover:border-steel-600 transition-colors p-3 flex items-center gap-3 text-left"
                  >
                    <Building2 size={14} className="text-ink-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink-100 font-medium truncate">{c.nombre}</div>
                      <div className="font-mono text-[10px] text-ink-500 mt-0.5 flex items-center gap-2">
                        <span>{c.equipos} equipos</span>
                        <span>·</span>
                        <span className={c.dias_ultima_visita > 30 ? 'text-signal-warn' : ''}>
                          última: {c.dias_ultima_visita}d
                        </span>
                      </div>
                    </div>
                    {c.status_visita === 'urgente' && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-signal-alert bg-red-100 border border-signal-alertBorder px-1.5 py-0.5">
                        Urgente
                      </span>
                    )}
                    <ChevronRight size={14} className="text-ink-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ─────────── REPORTE ───────────
  if (step === 'reporte') {
    return (
      <div className="min-h-screen p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button onClick={() => { setClienteSel(null); setStep('clientes') }} className="text-ink-400 hover:text-ink-100">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Reporte</div>
            <div className="font-display font-bold text-ink-50 text-base leading-tight">{clienteSel.nombre}</div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Aceite */}
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-label flex items-center gap-1.5">
                <Droplet size={11} /> Aceite restante
              </div>
              <span className={`font-mono font-bold text-2xl tabular-nums ${
                reporte.aceite_restante_pct < 25 ? 'text-signal-alert' :
                reporte.aceite_restante_pct < 50 ? 'text-signal-warn' : 'text-signal-ok'
              }`}>
                {reporte.aceite_restante_pct}%
              </span>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={reporte.aceite_restante_pct}
              onChange={e => setReporte({ ...reporte, aceite_restante_pct: +e.target.value })}
              className="w-full accent-steel-600"
            />
            <div className="flex justify-between font-mono text-[10px] text-ink-500 mt-1">
              <span>Vacío</span><span>50%</span><span>Lleno</span>
            </div>
          </div>

          {/* Equipos revisados */}
          <div className="panel p-4">
            <div className="stat-label mb-3">Equipos revisados</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReporte({ ...reporte, equipos_revisados: Math.max(1, reporte.equipos_revisados - 1) })}
                className="w-11 h-11 rounded-full border border-ink-800 bg-ink-900 hover:bg-ink-850 text-ink-100 text-xl font-light transition-colors"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="stat-num text-[28px]">{reporte.equipos_revisados}</span>
                <span className="font-mono text-[11px] text-ink-400 ml-1.5">/ {clienteSel.equipos}</span>
              </div>
              <button
                onClick={() => setReporte({ ...reporte, equipos_revisados: Math.min(clienteSel.equipos, reporte.equipos_revisados + 1) })}
                className="w-11 h-11 rounded-full border border-ink-800 bg-ink-900 hover:bg-ink-850 text-ink-100 text-xl font-light transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Necesidades */}
          <div className="space-y-2.5">
            <button
              onClick={() => setReporte({ ...reporte, necesita_recarga: !reporte.necesita_recarga })}
              className={`w-full panel p-3.5 flex items-center gap-3 transition-all ${
                reporte.necesita_recarga ? '!border-signal-warn !bg-signal-warnBg shadow-soft' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                reporte.necesita_recarga ? 'border-signal-warn bg-signal-warn' : 'border-ink-700 bg-ink-900'
              }`}>
                {reporte.necesita_recarga && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <Droplet size={16} strokeWidth={1.75} className={reporte.necesita_recarga ? 'text-signal-warn' : 'text-ink-400'} />
              <div className="flex-1 text-left">
                <div className="text-[14px] text-ink-50 font-semibold">Necesita recarga</div>
                <div className="text-[11.5px] text-ink-300">Programar próxima visita con aceite</div>
              </div>
            </button>

            <button
              onClick={() => setReporte({ ...reporte, necesita_servicio: !reporte.necesita_servicio })}
              className={`w-full panel p-3.5 flex items-center gap-3 transition-all ${
                reporte.necesita_servicio ? '!border-signal-alert !bg-signal-alertBg shadow-soft' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                reporte.necesita_servicio ? 'border-signal-alert bg-signal-alert' : 'border-ink-700 bg-ink-900'
              }`}>
                {reporte.necesita_servicio && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <Wrench size={16} strokeWidth={1.75} className={reporte.necesita_servicio ? 'text-signal-alert' : 'text-ink-400'} />
              <div className="flex-1 text-left">
                <div className="text-[14px] text-ink-50 font-semibold">Necesita servicio técnico</div>
                <div className="text-[11.5px] text-ink-300">Falla detectada — agendar técnico</div>
              </div>
            </button>
          </div>

          {/* Próxima acción */}
          <div className="panel p-4">
            <div className="stat-label mb-3">Próxima acción sugerida</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'recarga', l: 'Recarga' },
                { v: 'servicio_tecnico', l: 'Servicio técnico' },
                { v: 'revision_general', l: 'Revisión general' },
                { v: 'visita_comercial', l: 'Visita comercial' },
              ].map(a => (
                <button
                  key={a.v}
                  onClick={() => setReporte({ ...reporte, proxima_accion: a.v })}
                  className={`text-[12px] font-medium py-2.5 rounded-full border transition-all ${
                    reporte.proxima_accion === a.v
                      ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                      : 'border-ink-800 bg-ink-900 text-ink-200 hover:bg-ink-850'
                  }`}
                >
                  {a.l}
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="panel p-4">
            <div className="stat-label mb-2">Observaciones</div>
            <textarea
              rows={3}
              value={reporte.observaciones}
              onChange={e => setReporte({ ...reporte, observaciones: e.target.value })}
              placeholder="¿Algo importante que reportar?"
              className="input resize-none"
            />
          </div>

          <button
            onClick={submit}
            className="w-full btn-primary justify-center py-3.5 text-[14px]"
          >
            Enviar reporte
          </button>
        </div>
      </div>
    )
  }

  // ─────────── ENVIADO ───────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full panel shadow-lift float-in">
        <div className="px-8 py-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-signal-okBg border border-signal-okBorder flex items-center justify-center mb-5">
            <CheckCircle2 size={28} strokeWidth={1.75} className="text-signal-ok" />
          </div>
          <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.22em] mb-2">
            Reporte enviado
          </div>
          <h2 className="font-display font-semibold text-ink-50 text-[28px] tracking-tight mb-2">
            ¡Excelente <span className="italic text-steel-600">trabajo</span>!
          </h2>
          <p className="text-[14px] text-ink-300 mb-6">
            El reporte de <strong className="text-ink-50">{clienteSel.nombre}</strong> fue registrado.
          </p>
          <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 mb-6">
            <div className="stat-label mb-1">Folio</div>
            <div className="font-mono font-semibold text-ink-50 text-lg tracking-wider">{folioEnviado}</div>
          </div>
          <button
            onClick={() => {
              setClienteSel(null)
              setReporte({ aceite_restante_pct: 50, necesita_recarga: false, necesita_servicio: false, equipos_revisados: 1, observaciones: '', proxima_accion: 'recarga' })
              setFolioEnviado(null)
              setStep('clientes')
            }}
            className="btn-primary w-full justify-center"
          >
            Reportar otro cliente
          </button>
        </div>
      </div>
    </div>
  )
}
