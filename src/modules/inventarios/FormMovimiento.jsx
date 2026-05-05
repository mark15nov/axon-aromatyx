import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDownToLine, ArrowUpFromLine, Plus, X, Layers, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { inventarios } from '@/services/api'
import { fmtMoney, fmtNumber, fmtDate } from '@/utils/format'

const MOTIVOS = {
  entrada: ['Compra proveedor', 'Devolución cliente', 'Ajuste inventario', 'Producción interna'],
  salida:  ['Venta cliente', 'Muestra comercial', 'Mantenimiento ruta', 'Merma'],
}

const PROVEEDORES = ['Aromas Globales SA', 'Essential Oils MX', 'Fragrance House', 'Mendoza Aromáticos', 'BioEsencias del Norte']

const PANEL_W = 540
const MARGIN = 12

export function FormMovimiento({ tipo, aromas, difusores, presetItem, anchorRect, onClose, onSaved }) {
  const initialItemTipo = presetItem
    ? (presetItem.codigo?.startsWith('AR-') ? 'aroma' : 'difusor')
    : 'aroma'
  const isEntrada = tipo === 'entrada'
  const [itemTipo, setItemTipo] = useState(initialItemTipo)

  // Defaults inteligentes desde el item
  const defaultCosto  = presetItem ? (presetItem.costo_por_litro ?? presetItem.costo ?? 0) : ''
  const defaultPrecio = presetItem ? (presetItem.precio_venta_litro ?? presetItem.precio ?? 0) : ''

  const [form, setForm] = useState({
    item_id: presetItem?.id || '',
    cantidad: '',
    costo_unitario: isEntrada ? defaultCosto : '',
    precio_unitario: !isEntrada ? defaultPrecio : '',
    proveedor: '',
    cliente: '',
    motivo: '',
    referencia: '',
    operador: 'Mario Sánchez',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null) // FIFO preview (solo salidas)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Sincronizar presetItem
  useEffect(() => {
    if (presetItem) {
      const t = presetItem.codigo?.startsWith('AR-') ? 'aroma' : 'difusor'
      setItemTipo(t)
      setForm(f => ({
        ...f,
        item_id: presetItem.id,
        costo_unitario:  isEntrada  ? (presetItem.costo_por_litro ?? presetItem.costo ?? 0) : f.costo_unitario,
        precio_unitario: !isEntrada ? (presetItem.precio_venta_litro ?? presetItem.precio ?? 0) : f.precio_unitario,
      }))
    }
  }, [presetItem, isEntrada])

  // FIFO preview en vivo (solo salidas)
  useEffect(() => {
    if (isEntrada || !form.item_id || !form.cantidad || +form.cantidad <= 0) {
      setPreview(null)
      return
    }
    let cancelled = false
    inventarios.previewFIFO({
      item_tipo: itemTipo,
      item_id: +form.item_id,
      cantidad: +form.cantidad,
    }).then(res => { if (!cancelled) setPreview(res) })
    return () => { cancelled = true }
  }, [isEntrada, itemTipo, form.item_id, form.cantidad])

  const items = itemTipo === 'aroma' ? (aromas || []) : (difusores || [])
  const Icon  = isEntrada ? ArrowDownToLine : ArrowUpFromLine
  const unidad = itemTipo === 'aroma' ? 'L' : 'pza'
  const esVenta = !isEntrada && form.motivo === 'Venta cliente'
  const stockActual = items.find(i => i.id === +form.item_id)
  const stockDisp = itemTipo === 'aroma' ? stockActual?.stock_litros : stockActual?.stock

  // Cálculos en vivo
  const cantidadN = +form.cantidad || 0
  const costoUnitN  = +form.costo_unitario || 0
  const precioUnitN = +form.precio_unitario || 0
  const costoTotalEntrada = cantidadN * costoUnitN
  const ingresoTotal      = cantidadN * precioUnitN
  const costoTotalSalida  = preview?.costo_total || 0
  const utilidad          = ingresoTotal - costoTotalSalida
  const margenPct         = ingresoTotal > 0 ? (utilidad / ingresoTotal) * 100 : 0

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    setError(null)
    setSaving(true)
    const item = items.find(i => i.id === +form.item_id)
    const data = {
      cantidad: cantidadN,
      item_tipo: itemTipo,
      item_id: +form.item_id,
      item_nombre: item?.nombre || presetItem?.nombre || '',
      unidad,
      motivo: form.motivo,
      referencia: form.referencia,
      operador: form.operador,
      ...(isEntrada
        ? { costo_unitario: costoUnitN, proveedor: form.proveedor || null }
        : { precio_unitario: precioUnitN, cliente: form.cliente || null }),
    }
    try {
      const res = isEntrada
        ? await inventarios.registrarEntrada(data)
        : await inventarios.registrarSalida(data)
      if (res?.error) {
        setError(`${res.error} — solo hay ${res.disponible} ${unidad} disponibles, faltan ${res.faltante} ${unidad}.`)
        return
      }
      onSaved && onSaved(res)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-ink-50/10" onClick={onClose} />

      <div
        className="panel fixed z-50 shadow-lift flex flex-col max-h-[88vh] left-1/2 -translate-x-1/2"
        style={{
          bottom: anchorRect
            ? Math.max(MARGIN, window.innerHeight - anchorRect.top + 8)
            : undefined,
          top: anchorRect ? undefined : 80,
          width: PANEL_W,
          maxWidth: `calc(100vw - ${MARGIN * 2}px)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="panel-header flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isEntrada ? 'bg-signal-okBg text-signal-ok' : 'bg-signal-warnBg text-signal-warn'
            }`}>
              <Icon size={14} strokeWidth={2} />
            </span>
            <span className="panel-title">Registrar {tipo}</span>
            {!isEntrada && esVenta && (
              <span className="badge-accent ml-1">Venta</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-ink-850 flex items-center justify-center text-ink-400 hover:text-ink-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {!presetItem && (
            <div>
              <label className="stat-label block mb-2">Tipo de item</label>
              <div className="flex gap-2">
                {['aroma', 'difusor'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setItemTipo(t); setForm({ ...form, item_id: '' }) }}
                    className={`flex-1 text-[12px] uppercase tracking-wider font-medium py-2.5 rounded-full border transition-all ${
                      itemTipo === t
                        ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                        : 'border-ink-800 bg-ink-900 text-ink-200 hover:bg-ink-850'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="stat-label block mb-2">Item</label>
            {presetItem ? (
              <div className="input flex items-center justify-between !cursor-default">
                <span className="text-ink-50 font-medium truncate">{presetItem.codigo} · {presetItem.nombre}</span>
                {stockDisp != null && (
                  <span className="font-mono text-[10.5px] text-ink-400 whitespace-nowrap ml-2">
                    Stock: <span className="text-ink-100">{fmtNumber(stockDisp, itemTipo === 'aroma' ? 2 : 0)} {unidad}</span>
                  </span>
                )}
              </div>
            ) : (
              <select
                required
                value={form.item_id}
                onChange={e => setForm({ ...form, item_id: e.target.value })}
                className="input"
              >
                <option value="">Selecciona...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.codigo} · {i.nombre}</option>)}
              </select>
            )}
          </div>

          {/* Cantidad + Costo/Precio en mismo row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-2">
                Cantidad ({unidad})
              </label>
              <input
                required
                type="number"
                step={itemTipo === 'aroma' ? '0.01' : '1'}
                min="0.01"
                value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: e.target.value })}
                className="input font-mono"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div>
              <label className="stat-label block mb-2 flex items-center justify-between">
                <span>{isEntrada ? 'Costo unitario' : 'Precio unitario'}</span>
                <span className="text-ink-400 normal-case tracking-normal">por {unidad}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-[13px] pointer-events-none">$</span>
                <input
                  required={isEntrada || esVenta}
                  type="number"
                  step="0.01"
                  min="0"
                  value={isEntrada ? form.costo_unitario : form.precio_unitario}
                  onChange={e => setForm({
                    ...form,
                    [isEntrada ? 'costo_unitario' : 'precio_unitario']: e.target.value,
                  })}
                  className="input font-mono pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="stat-label block mb-2">Motivo</label>
            <select
              required
              value={form.motivo}
              onChange={e => setForm({ ...form, motivo: e.target.value })}
              className="input"
            >
              <option value="">Selecciona...</option>
              {MOTIVOS[tipo].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Proveedor (entrada) o Cliente (salida en venta) */}
          {isEntrada && form.motivo === 'Compra proveedor' && (
            <div>
              <label className="stat-label block mb-2">Proveedor</label>
              <input
                list="proveedores-list"
                value={form.proveedor}
                onChange={e => setForm({ ...form, proveedor: e.target.value })}
                placeholder="Ej. Aromas Globales SA"
                className="input"
              />
              <datalist id="proveedores-list">
                {PROVEEDORES.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
          )}
          {!isEntrada && esVenta && (
            <div>
              <label className="stat-label block mb-2">Cliente</label>
              <input
                value={form.cliente}
                onChange={e => setForm({ ...form, cliente: e.target.value })}
                placeholder="Ej. Hotel Camino Real"
                className="input"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-2">Referencia</label>
              <input
                value={form.referencia}
                onChange={e => setForm({ ...form, referencia: e.target.value })}
                placeholder={isEntrada ? 'OC-1234' : 'OV-2345'}
                className="input font-mono"
              />
            </div>
            <div>
              <label className="stat-label block mb-2">Operador</label>
              <input
                value={form.operador}
                onChange={e => setForm({ ...form, operador: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* ENTRADA: resumen costo total */}
          {isEntrada && cantidadN > 0 && costoUnitN > 0 && (
            <div className="rounded-xl border border-signal-okBorder bg-signal-okBg/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-signal-ok flex items-center gap-1.5">
                  <ArrowDownToLine size={11} /> Costo total de entrada
                </span>
                <span className="font-display font-semibold text-signal-ok text-xl tabular-nums">
                  {fmtMoney(costoTotalEntrada)}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-ink-300">
                {fmtNumber(cantidadN, itemTipo === 'aroma' ? 2 : 0)} {unidad} × {fmtMoney(costoUnitN)} se agregan a un nuevo lote FIFO.
              </div>
            </div>
          )}

          {/* SALIDA: preview FIFO */}
          {!isEntrada && preview && (
            <div className={`rounded-xl border ${
              preview.suficiente ? 'border-ink-800 bg-ink-850/60' : 'border-signal-alertBorder bg-signal-alertBg/60'
            } px-4 py-3.5 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-400 flex items-center gap-1.5">
                  <Layers size={11} /> Consumo FIFO
                </span>
                {preview.suficiente ? (
                  <span className="font-mono text-[10.5px] text-signal-ok">
                    {preview.lotes.length} lote{preview.lotes.length !== 1 ? 's' : ''} · {fmtNumber(preview.cantidad_consumida, itemTipo === 'aroma' ? 2 : 0)} {unidad}
                  </span>
                ) : (
                  <span className="font-mono text-[10.5px] text-signal-alert flex items-center gap-1">
                    <AlertTriangle size={11} /> Faltan {fmtNumber(preview.faltante, itemTipo === 'aroma' ? 2 : 0)} {unidad}
                  </span>
                )}
              </div>

              {preview.lotes.length > 0 && (
                <div className="space-y-1">
                  {preview.lotes.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-[12px] py-1">
                      <div className="flex items-center gap-2 text-ink-200 min-w-0">
                        <span className="font-mono text-[10px] text-ink-400 flex-shrink-0">{i + 1}.</span>
                        <span className="font-mono text-[10.5px] text-ink-400 truncate">{l.entrada_folio}</span>
                        <span className="text-ink-400 text-[10.5px] whitespace-nowrap">· {fmtDate(l.fecha_entrada)}</span>
                      </div>
                      <div className="font-mono text-[11.5px] text-ink-100 tabular-nums whitespace-nowrap ml-2">
                        {fmtNumber(l.cantidad, itemTipo === 'aroma' ? 2 : 0)} × {fmtMoney(l.costo_unitario)} = <span className="font-semibold text-ink-50">{fmtMoney(l.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {preview.suficiente && (
                <div className="border-t border-ink-800 pt-3 grid grid-cols-3 gap-3">
                  <div>
                    <div className="font-mono text-[9.5px] uppercase tracking-wider text-ink-400 mb-0.5">Costo FIFO</div>
                    <div className="font-display font-semibold text-ink-50 text-[15px] tabular-nums">{fmtMoney(preview.costo_total)}</div>
                    <div className="font-mono text-[10px] text-ink-400 mt-0.5">prom. {fmtMoney(preview.costo_promedio)}/{unidad}</div>
                  </div>
                  {esVenta && precioUnitN > 0 ? (
                    <>
                      <div>
                        <div className="font-mono text-[9.5px] uppercase tracking-wider text-ink-400 mb-0.5">Ingreso</div>
                        <div className="font-display font-semibold text-ink-50 text-[15px] tabular-nums">{fmtMoney(ingresoTotal)}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[9.5px] uppercase tracking-wider text-ink-400 mb-0.5 flex items-center gap-1">
                          {utilidad >= 0 ? <TrendingUp size={10} className="text-signal-ok" /> : <TrendingDown size={10} className="text-signal-alert" />}
                          {utilidad >= 0 ? 'Utilidad' : 'Pérdida'}
                        </div>
                        <div className={`font-display font-semibold text-[15px] tabular-nums ${utilidad >= 0 ? 'text-signal-ok' : 'text-signal-alert'}`}>
                          {fmtMoney(Math.abs(utilidad))}
                        </div>
                        <div className={`font-mono text-[10px] mt-0.5 ${utilidad >= 0 ? 'text-signal-ok' : 'text-signal-alert'}`}>
                          margen {margenPct.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <div className="font-mono text-[9.5px] uppercase tracking-wider text-ink-400 mb-0.5">Impacto P&amp;L</div>
                      <div className="font-display font-semibold text-signal-alert text-[15px] tabular-nums">−{fmtMoney(preview.costo_total)}</div>
                      <div className="font-mono text-[10px] text-ink-400 mt-0.5">salida sin venta — gasto a P&amp;L</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-signal-alert flex-shrink-0 mt-0.5" />
              <div className="text-[12.5px] text-signal-alert">{error}</div>
            </div>
          )}
        </form>

        <div className="border-t border-ink-800 p-4 flex gap-2 flex-shrink-0 bg-ink-900 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={
              saving
              || !form.item_id
              || !cantidadN
              || !form.motivo
              || (isEntrada && !costoUnitN)
              || (!isEntrada && preview && !preview.suficiente)
            }
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {saving ? 'Guardando…' : <><Plus size={12} /> Registrar</>}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
