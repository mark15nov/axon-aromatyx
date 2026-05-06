import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, MapPin, Calendar, User, Plane, Bus, Car, Truck,
  BedDouble, Wallet, Receipt, Sparkles, Building2,
} from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney, fmtNumber, fmtDate } from '@/utils/format'
import { logistica, rutas } from '@/services/api'

const TRANSPORT_ICON = {
  vuelo_redondo:   Plane,
  autobus_redondo: Bus,
  auto_rentado:    Car,
  vehiculo_propio: Truck,
}

const todayISO = () => new Date().toISOString().slice(0, 10)
const addDaysISO = (iso, n) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function CotizadorTab() {
  const [origen, setOrigen] = useState(null)
  const [ciudades, setCiudades] = useState([])
  const [transportes, setTransportes] = useState([])
  const [hoteles, setHoteles] = useState([])
  const [operadores, setOperadores] = useState([])

  const [form, setForm] = useState({
    operador_id: '',
    destino_id: '',
    fecha_salida: todayISO(),
    fecha_regreso: addDaysISO(todayISO(), 2),
    transporte: 'vuelo_redondo',
    categoria_hotel: '4',
    incluye_hotel: true,
    viaticos_diarios: 600,
    proposito: '',
    clientes_visitar: 1,
  })
  const [cot, setCot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [agendando, setAgendando] = useState(false)
  const [agendado, setAgendado] = useState(null)

  useEffect(() => {
    logistica.getOrigen().then(setOrigen)
    logistica.listCiudades().then(setCiudades)
    logistica.listTransportes().then(setTransportes)
    logistica.listHoteles().then(setHoteles)
    rutas.listOperadores().then(ops => setOperadores(ops.filter(o => o.activo)))
  }, [])

  // Auto-cotizar al cambiar el formulario
  useEffect(() => {
    if (!form.destino_id || !form.fecha_salida || !form.fecha_regreso) {
      setCot(null)
      return
    }
    let cancelled = false
    setLoading(true)
    logistica.cotizar({
      destino_id: form.destino_id,
      fecha_salida: new Date(form.fecha_salida).toISOString(),
      fecha_regreso: new Date(form.fecha_regreso).toISOString(),
      transporte: form.transporte,
      categoria_hotel: form.categoria_hotel,
      incluye_hotel: form.incluye_hotel,
      viaticos_diarios: +form.viaticos_diarios || 0,
      operador_id: form.operador_id || null,
    }).then(res => {
      if (cancelled) return
      setCot(res)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [
    form.destino_id, form.fecha_salida, form.fecha_regreso,
    form.transporte, form.categoria_hotel, form.incluye_hotel,
    form.viaticos_diarios, form.operador_id,
  ])

  const operadorSeleccionado = useMemo(
    () => operadores.find(o => String(o.id) === String(form.operador_id)),
    [operadores, form.operador_id],
  )

  const agendar = async () => {
    if (!cot || agendando) return
    setAgendando(true)
    const res = await logistica.agendar({
      destino_id: form.destino_id,
      fecha_salida: new Date(form.fecha_salida).toISOString(),
      fecha_regreso: new Date(form.fecha_regreso).toISOString(),
      transporte: form.transporte,
      categoria_hotel: form.categoria_hotel,
      incluye_hotel: form.incluye_hotel,
      viaticos_diarios: +form.viaticos_diarios || 0,
      operador_id: form.operador_id || null,
      operador_nombre: operadorSeleccionado?.nombre,
      proposito: form.proposito || 'Visita programada',
      clientes_visitar: +form.clientes_visitar || 0,
    })
    setAgendando(false)
    setAgendado(res)
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* ───── Configurar ───── */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <Panel title="Configurar viaje" accent>
          <div className="space-y-4">
            <Field label="Operador" icon={User}>
              <select
                value={form.operador_id}
                onChange={e => setForm({ ...form, operador_id: e.target.value })}
                className="input"
              >
                <option value="">Selecciona operador...</option>
                {operadores.map(o => (
                  <option key={o.id} value={o.id}>{o.nombre} · {o.zonas.length} zonas asignadas</option>
                ))}
              </select>
            </Field>

            <Field label="Destino" icon={MapPin}>
              <select
                required
                value={form.destino_id}
                onChange={e => setForm({ ...form, destino_id: e.target.value })}
                className="input"
              >
                <option value="">¿A dónde va?</option>
                {ciudades.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} · {c.estado} ({c.km_a_cdmx} km)
                  </option>
                ))}
              </select>
              {origen && form.destino_id && (
                <div className="mt-2 flex items-center gap-2 text-[11.5px] text-ink-300">
                  <span className="font-mono text-ink-100">{origen.nombre}</span>
                  <ArrowRight size={11} className="text-steel-600" />
                  <span className="font-mono text-ink-100">
                    {ciudades.find(c => c.id === form.destino_id)?.nombre}
                  </span>
                </div>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Salida" icon={Calendar}>
                <input
                  type="date"
                  required
                  value={form.fecha_salida}
                  min={todayISO()}
                  onChange={e => {
                    const newSalida = e.target.value
                    setForm(f => ({
                      ...f,
                      fecha_salida: newSalida,
                      fecha_regreso: f.fecha_regreso < newSalida ? addDaysISO(newSalida, 1) : f.fecha_regreso,
                    }))
                  }}
                  className="input font-mono"
                />
              </Field>
              <Field label="Regreso" icon={Calendar}>
                <input
                  type="date"
                  required
                  value={form.fecha_regreso}
                  min={form.fecha_salida}
                  onChange={e => setForm({ ...form, fecha_regreso: e.target.value })}
                  className="input font-mono"
                />
              </Field>
            </div>

            <div className="border-t border-ink-800 pt-4">
              <label className="stat-label block mb-3">Tipo de transporte</label>
              <div className="grid grid-cols-2 gap-2">
                {transportes.map(t => {
                  const Icon = TRANSPORT_ICON[t.id] || Car
                  const active = form.transporte === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, transporte: t.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-steel-500 bg-steel-50 shadow-soft'
                          : 'border-ink-800 bg-ink-900 hover:border-ink-700 hover:bg-ink-850'
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.75} className={active ? 'text-steel-700' : 'text-ink-300'} />
                      <div className={`mt-1.5 text-[12.5px] font-semibold ${active ? 'text-steel-700' : 'text-ink-100'}`}>
                        {t.label}
                      </div>
                      <div className="text-[10.5px] text-ink-400 leading-snug">{t.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-ink-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="stat-label flex items-center gap-1.5">
                  <BedDouble size={11} /> Hospedaje
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.incluye_hotel}
                    onChange={e => setForm({ ...form, incluye_hotel: e.target.checked })}
                    className="accent-steel-600 w-4 h-4 rounded"
                  />
                  <span className="text-[11.5px] text-ink-200">Incluir hotel</span>
                </label>
              </div>
              {form.incluye_hotel && (
                <div className="grid grid-cols-3 gap-2">
                  {hoteles.map(h => {
                    const active = form.categoria_hotel === h.id
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setForm({ ...form, categoria_hotel: h.id })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          active
                            ? 'border-steel-500 bg-steel-50 shadow-soft'
                            : 'border-ink-800 bg-ink-900 hover:border-ink-700 hover:bg-ink-850'
                        }`}
                      >
                        <div className={`font-display text-[15px] font-semibold ${active ? 'text-steel-700' : 'text-ink-100'}`}>
                          {h.id} ★
                        </div>
                        <div className="font-mono text-[10px] text-ink-400 mt-0.5">
                          {fmtMoney(h.precio_noche)}/noche
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-ink-800 pt-4 grid grid-cols-2 gap-3">
              <Field label="Viáticos / día" icon={Wallet}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-[13px]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={form.viaticos_diarios}
                    onChange={e => setForm({ ...form, viaticos_diarios: e.target.value })}
                    className="input font-mono pl-7"
                  />
                </div>
              </Field>
              <Field label="Clientes a visitar" icon={Building2}>
                <input
                  type="number"
                  min="0"
                  value={form.clientes_visitar}
                  onChange={e => setForm({ ...form, clientes_visitar: e.target.value })}
                  className="input font-mono"
                />
              </Field>
            </div>

            <Field label="Propósito del viaje">
              <input
                value={form.proposito}
                onChange={e => setForm({ ...form, proposito: e.target.value })}
                placeholder="Ej. Mantenimiento trimestral + atención a falla"
                className="input"
              />
            </Field>
          </div>
        </Panel>
      </div>

      {/* ───── Resultado ───── */}
      <div className="col-span-12 lg:col-span-7">
        {!form.destino_id ? (
          <Panel>
            <div className="py-16 text-center">
              <Plane size={32} strokeWidth={1.5} className="text-ink-400 mx-auto mb-3" />
              <div className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em] mb-1">
                Selecciona un destino para cotizar
              </div>
              <div className="text-[12.5px] text-ink-400 max-w-md mx-auto">
                Elige a dónde viajará el operador y el sistema calcula transporte + hospedaje + viáticos al instante.
              </div>
            </div>
          </Panel>
        ) : agendado ? (
          <Panel accent title="Viaje agendado" action={
            <span className="badge-ok">{agendado.folio}</span>
          }>
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-signal-okBg border border-signal-okBorder flex items-center justify-center mb-4">
                <Sparkles size={26} strokeWidth={1.5} className="text-signal-ok" />
              </div>
              <h3 className="font-display font-semibold text-ink-50 text-2xl mb-1">¡Listo, viaje agendado!</h3>
              <p className="text-[13.5px] text-ink-300 mb-6">
                {agendado.operador} viaja a {agendado.destino?.nombre} del {fmtDate(agendado.fecha_salida)} al {fmtDate(agendado.fecha_regreso)}.
              </p>
              <div className="rounded-xl border border-ink-800 bg-ink-850 px-5 py-4 inline-block">
                <div className="stat-label mb-1">Total aprobado</div>
                <div className="font-display font-semibold text-ink-50 text-3xl tabular-nums">{fmtMoney(agendado.total)}</div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => { setAgendado(null); setCot(null); setForm(f => ({ ...f, operador_id: '', destino_id: '', proposito: '' })) }}
                  className="btn-ghost"
                >
                  Cotizar otro viaje
                </button>
              </div>
            </div>
          </Panel>
        ) : !cot ? (
          <Panel>
            <div className="py-16 text-center font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.18em]">
              {loading ? 'Calculando…' : 'Esperando datos válidos…'}
            </div>
          </Panel>
        ) : (
          <ResumenCotizacion
            cot={cot}
            operador={operadorSeleccionado}
            proposito={form.proposito}
            clientesVisitar={+form.clientes_visitar || 0}
            agendar={agendar}
            agendando={agendando}
          />
        )}
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="stat-label flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={11} />} {label}
      </label>
      {children}
    </div>
  )
}

function ResumenCotizacion({ cot, operador, proposito, clientesVisitar, agendar, agendando }) {
  const Icon = TRANSPORT_ICON[cot.transporte.tipo] || Car
  return (
    <div className="space-y-4">
      <div className="panel">
        {/* Header con ruta */}
        <div className="px-6 py-5 border-b border-ink-800 bg-gradient-to-br from-steel-50/60 to-ink-900 rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">Cotización generada</span>
            <span className="font-mono text-[10px] text-ink-400">QTE-{Date.now().toString().slice(-6)}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex-1">
              <div className="stat-label mb-0.5">Origen</div>
              <div className="font-display font-semibold text-ink-50 text-[19px]">{cot.origen.nombre}</div>
              <div className="text-[11px] text-ink-400">{cot.origen.estado}</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-2">
              <div className="w-10 h-10 rounded-full bg-ink-900 border border-ink-800 flex items-center justify-center">
                <Icon size={18} strokeWidth={1.75} className="text-steel-600" />
              </div>
              <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">{cot.transporte.label}</div>
            </div>
            <div className="flex-1 text-right">
              <div className="stat-label mb-0.5">Destino</div>
              <div className="font-display font-semibold text-ink-50 text-[19px]">{cot.destino.nombre}</div>
              <div className="text-[11px] text-ink-400">{cot.destino.estado}</div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 divide-x divide-ink-800 border-b border-ink-800">
          <Metric label="Operador" value={operador?.nombre?.split(' ')[0] || '—'} sub={operador ? operador.nombre.split(' ').slice(1).join(' ') : 'Sin asignar'} />
          <Metric label="Días" value={cot.dias} sub={`${cot.noches} noche${cot.noches !== 1 ? 's' : ''}`} />
          <Metric label="Salida" value={fmtDate(cot.fecha_salida)} />
          <Metric label="Regreso" value={fmtDate(cot.fecha_regreso)} />
        </div>

        {/* Desglose */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
            <Receipt size={10} /> Desglose
          </div>

          <Linea
            icon={Icon}
            label={cot.transporte.label}
            sub={cot.transporte.detalle}
            value={cot.transporte.costo}
          />

          {cot.hospedaje.incluido ? (
            <Linea
              icon={BedDouble}
              label={`Hospedaje · ${cot.hospedaje.label}`}
              sub={`${cot.hospedaje.noches} noche${cot.hospedaje.noches !== 1 ? 's' : ''} × ${fmtMoney(cot.hospedaje.precio_noche)}`}
              value={cot.hospedaje.costo}
            />
          ) : (
            <Linea
              icon={BedDouble}
              label="Hospedaje"
              sub="No incluido en este viaje"
              value={0}
              muted
            />
          )}

          <Linea
            icon={Wallet}
            label="Viáticos"
            sub={`${cot.viaticos.dias} día${cot.viaticos.dias !== 1 ? 's' : ''} × ${fmtMoney(cot.viaticos.diarios)}`}
            value={cot.viaticos.costo}
          />

          <div className="border-t border-ink-800 mt-3 pt-3 space-y-1">
            <Linea label="Subtotal" value={cot.subtotal} compact />
            <Linea label="IVA · 16%" value={cot.iva} compact />
          </div>
        </div>

        {/* Total + acción */}
        <div className="px-6 py-5 bg-steel-50 border-t border-steel-200 rounded-b-2xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-steel-700 uppercase tracking-[0.2em]">Total del viaje</div>
              <div className="font-display font-semibold text-ink-50 text-[36px] leading-none tabular-nums tracking-tight mt-1">
                {fmtMoney(cot.total)}
              </div>
              <div className="font-mono text-[10.5px] text-ink-400 mt-1.5">
                {fmtMoney(Math.round(cot.total / cot.dias))} / día · {fmtNumber(cot.km_aprox)} km aprox.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={agendar}
                disabled={agendando || !operador}
                className="btn-primary disabled:opacity-50"
                title={!operador ? 'Selecciona un operador para agendar' : ''}
              >
                {agendando ? 'Agendando…' : <>Agendar viaje <ArrowRight size={11} /></>}
              </button>
            </div>
          </div>
          {!operador && (
            <div className="mt-3 text-[11.5px] text-ink-400">
              Selecciona un operador en el formulario para poder agendar.
            </div>
          )}
        </div>
      </div>

      {(proposito || clientesVisitar > 0) && (
        <Panel tight>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="stat-label mb-0.5">Propósito del viaje</div>
              <div className="text-[13.5px] text-ink-100 truncate">{proposito || 'Visita programada'}</div>
            </div>
            {clientesVisitar > 0 && (
              <div className="text-right flex-shrink-0">
                <div className="stat-label mb-0.5">Clientes a visitar</div>
                <div className="font-display font-semibold text-ink-50 text-xl">
                  {clientesVisitar}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  )
}

function Metric({ label, value, sub }) {
  return (
    <div className="px-4 py-3.5">
      <div className="stat-label mb-1">{label}</div>
      <div className="font-display font-semibold text-ink-50 text-[15px] truncate">{value}</div>
      {sub && <div className="text-[11px] text-ink-400 truncate">{sub}</div>}
    </div>
  )
}

function Linea({ icon: Icon, label, sub, value, muted = false, compact = false }) {
  return (
    <div className={`flex items-center justify-between ${compact ? 'py-1' : 'py-2.5'}`}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            muted ? 'bg-ink-850 text-ink-400' : 'bg-steel-50 text-steel-700'
          }`}>
            <Icon size={14} strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <div className={`text-[13px] font-medium ${muted ? 'text-ink-400' : 'text-ink-100'}`}>{label}</div>
          {sub && <div className="text-[11px] text-ink-400 truncate">{sub}</div>}
        </div>
      </div>
      <div className={`font-mono tabular-nums whitespace-nowrap ${compact ? 'text-[13px] text-ink-200' : 'text-[15px] font-semibold text-ink-50'} ${muted ? 'text-ink-400' : ''}`}>
        {fmtMoney(value)}
      </div>
    </div>
  )
}
