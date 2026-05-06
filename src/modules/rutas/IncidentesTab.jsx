import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle, CheckCircle2, Plus, X, Sparkles, MapPin,
  Building2, Clock, ArrowRight, RefreshCw,
} from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtRelative, fmtMoney, fmtNumber } from '@/utils/format'
import { rutas } from '@/services/api'

export function IncidentesTab() {
  const [items, setItems] = useState([])
  const [tipos, setTipos] = useState([])
  const [clientes, setClientes] = useState([])
  const [filter, setFilter] = useState('abiertos')
  const [showForm, setShowForm] = useState(false)

  const cargar = async () => {
    const [inc, tps, cls] = await Promise.all([
      rutas.listIncidentes(),
      rutas.listTiposIncidente(),
      rutas.listClientes(),
    ])
    setItems(inc)
    setTipos(tps)
    setClientes(cls)
  }
  useEffect(() => { cargar() }, [])

  const filtered = useMemo(() => {
    if (filter === 'todos') return items
    if (filter === 'abiertos') return items.filter(i => !i.resuelto)
    return items.filter(i => i.resuelto)
  }, [items, filter])

  const abiertos  = items.filter(i => !i.resuelto).length
  const resueltos = items.filter(i => i.resuelto).length

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="panel">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-signal-alertBg border border-signal-alertBorder flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} strokeWidth={1.5} className="text-signal-alert" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-ink-50 text-[18px] leading-tight">
              Incidentes de campo
            </h3>
            <p className="text-[12.5px] text-ink-400 mt-0.5">
              Cuando algo sale mal, el sistema sugiere una nueva ruta sin perder tiempo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">Abiertos</div>
              <div className="font-display font-semibold text-signal-alert text-2xl tabular-nums">{abiertos}</div>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={11} /> Reportar incidente
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {[
          { v: 'abiertos', l: `Abiertos (${abiertos})` },
          { v: 'resueltos', l: `Resueltos (${resueltos})` },
          { v: 'todos', l: 'Todos' },
        ].map(f => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`font-mono text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
              filter === f.v
                ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <Panel>
          <div className="py-12 text-center">
            <CheckCircle2 size={28} strokeWidth={1.5} className="text-signal-ok mx-auto mb-2" />
            <div className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em]">
              {filter === 'abiertos' ? 'Sin incidentes abiertos' : 'No hay incidentes con este filtro'}
            </div>
          </div>
        </Panel>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(inc => (
            <IncidenteCard key={inc.id} inc={inc} />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <FormIncidente
          tipos={tipos}
          clientes={clientes}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); cargar() }}
        />
      )}
    </div>
  )
}

function IncidenteCard({ inc }) {
  return (
    <div className={`panel ${inc.resuelto ? 'opacity-70' : ''}`}>
      <div className="px-5 py-4 flex items-start gap-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          inc.resuelto
            ? 'bg-signal-okBg border border-signal-okBorder text-signal-ok'
            : 'bg-signal-alertBg border border-signal-alertBorder text-signal-alert'
        }`}>
          {inc.resuelto ? <CheckCircle2 size={16} strokeWidth={1.75} /> : <AlertTriangle size={16} strokeWidth={1.75} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[10px] text-ink-400">{inc.folio}</span>
            <span className={inc.resuelto ? 'badge-ok' : 'badge-alert'}>
              {inc.tipo_label}
            </span>
            <span className="font-mono text-[10px] text-ink-400 ml-auto">{fmtRelative(inc.fecha)}</span>
          </div>
          <div className="text-[13.5px] text-ink-50 font-medium mb-1">{inc.cliente_nombre || '—'}</div>
          <div className="text-[12px] text-ink-300 mb-2">{inc.descripcion}</div>
          <div className="flex items-center gap-3 text-[11px] text-ink-400 flex-wrap">
            {inc.zona_nombre && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={10} /> {inc.zona_nombre}
              </span>
            )}
            {inc.operador && (
              <span className="inline-flex items-center gap-1">
                Operador: <span className="text-ink-200">{inc.operador}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormIncidente({ tipos, clientes, onClose, onSaved }) {
  const [form, setForm] = useState({
    cliente_id: '',
    tipo: '',
    descripcion: '',
    operador: '',
  })
  const [saving, setSaving] = useState(false)
  const [resultado, setResultado] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    const res = await rutas.reportarIncidente({
      cliente_id: +form.cliente_id,
      tipo: form.tipo,
      descripcion: form.descripcion,
      operador: form.operador || null,
    })
    setSaving(false)
    setResultado(res)
  }

  if (resultado) {
    const { incidente, ruta_sugerida } = resultado
    return (
      <Backdrop onClose={onClose}>
        <div className="panel max-w-xl w-full shadow-lift">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-signal-okBg border border-signal-okBorder flex items-center justify-center">
                <CheckCircle2 size={14} strokeWidth={2} className="text-signal-ok" />
              </span>
              <span className="panel-title">Incidente registrado · {incidente.folio}</span>
            </div>
            <button onClick={() => { onClose(); onSaved() }} className="w-8 h-8 rounded-full hover:bg-ink-850 flex items-center justify-center text-ink-400 hover:text-ink-100">
              <X size={16} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-alert">{incidente.tipo_label}</span>
              </div>
              <div className="text-[13px] text-ink-100 font-medium">{incidente.cliente_nombre}</div>
              <div className="text-[11.5px] text-ink-400 mt-0.5">{incidente.descripcion}</div>
            </div>

            {ruta_sugerida && (
              <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-steel-700" />
                  <span className="font-mono text-[10px] text-steel-700 uppercase tracking-[0.18em]">
                    Ruta nueva sugerida — sin este cliente
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <Stat label="Clientes" value={ruta_sugerida.total_clientes} />
                  <Stat label="Recorrido" value={`${fmtNumber(ruta_sugerida.km_total, 0)} km`} />
                  <Stat label="Tiempo" value={`${ruta_sugerida.tiempo_total_horas}h`} />
                </div>
                <div className="text-[12px] text-ink-300">
                  Próxima parada sugerida: <strong className="text-ink-50">{ruta_sugerida.clientes[0]?.nombre}</strong>
                  {' '}<ArrowRight size={10} className="inline text-ink-400" /> {fmtNumber(ruta_sugerida.clientes[0]?.km_desde_anterior || 0, 1)} km
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={() => { onClose(); onSaved() }} className="btn-primary">
                Listo
              </button>
            </div>
          </div>
        </div>
      </Backdrop>
    )
  }

  return (
    <Backdrop onClose={onClose}>
      <form onSubmit={submit} className="panel max-w-lg w-full shadow-lift">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-signal-alertBg text-signal-alert flex items-center justify-center">
              <AlertTriangle size={14} strokeWidth={2} />
            </span>
            <span className="panel-title">Reportar incidente</span>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-ink-850 flex items-center justify-center text-ink-400 hover:text-ink-100">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="stat-label block mb-2">Cliente afectado</label>
            <select
              required
              value={form.cliente_id}
              onChange={e => setForm({ ...form, cliente_id: e.target.value })}
              className="input"
            >
              <option value="">Selecciona cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} · {c.nombre} ({c.zona_nombre})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="stat-label block mb-2">Tipo de incidente</label>
            <div className="grid grid-cols-1 gap-2">
              {tipos.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, tipo: t.id, descripcion: t.desc })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.tipo === t.id
                      ? 'border-steel-500 bg-steel-50 shadow-soft'
                      : 'border-ink-800 bg-ink-900 hover:border-ink-700 hover:bg-ink-850'
                  }`}
                >
                  <div className={`text-[13px] font-semibold ${form.tipo === t.id ? 'text-steel-700' : 'text-ink-100'}`}>
                    {t.label}
                  </div>
                  <div className="text-[11px] text-ink-400">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="stat-label block mb-2">Notas adicionales</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={2}
              className="input resize-none"
              placeholder="¿Algo importante que agregar?"
            />
          </div>
          <div>
            <label className="stat-label block mb-2">Operador (opcional)</label>
            <input
              value={form.operador}
              onChange={e => setForm({ ...form, operador: e.target.value })}
              className="input"
              placeholder="Quien reporta"
            />
          </div>
        </div>
        <div className="border-t border-ink-800 p-4 flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !form.cliente_id || !form.tipo}
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {saving ? 'Reportando…' : <><AlertTriangle size={11} /> Reportar y reoptimizar</>}
          </button>
        </div>
      </form>
    </Backdrop>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="font-display font-semibold text-ink-50 text-[15px] tabular-nums">{value}</div>
    </div>
  )
}

function Backdrop({ onClose, children }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-ink-50/30 backdrop-blur-sm flex items-center justify-center p-4 modal-pop"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="w-full flex justify-center">
        {children}
      </div>
    </div>,
    document.body,
  )
}
