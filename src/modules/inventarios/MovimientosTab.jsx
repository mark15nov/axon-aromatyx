import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDownToLine, ArrowUpFromLine, X, Layers, TrendingUp, TrendingDown } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney, fmtNumber, fmtDateTime, fmtDate } from '@/utils/format'
import { inventarios } from '@/services/api'
import { FormMovimiento } from './FormMovimiento'

export function MovimientosTab() {
  const [movs, setMovs] = useState([])
  const [filter, setFilter] = useState('todos')
  const [aromas, setAromas] = useState([])
  const [difusores, setDifusores] = useState([])
  const [showForm, setShowForm] = useState(null) // { tipo, anchorRect } | null
  const [detalle, setDetalle] = useState(null)   // movimiento seleccionado para desglose

  const refresh = () => inventarios.listMovimientos().then(setMovs)
  useEffect(() => {
    refresh()
    inventarios.listAromas().then(setAromas)
    inventarios.listDifusores().then(setDifusores)
  }, [])

  const openForm = (tipo) => (e) => {
    setShowForm({ tipo, anchorRect: e.currentTarget.getBoundingClientRect() })
  }

  const filtered = useMemo(() =>
    movs.filter(m => filter === 'todos' || m.tipo === filter),
  [movs, filter])

  const totales = useMemo(() => {
    const entradas = filtered.filter(m => m.tipo === 'entrada')
    const salidas  = filtered.filter(m => m.tipo === 'salida')
    return {
      compras:  entradas.reduce((s, m) => s + (m.costo_total || 0), 0),
      ingresos: salidas.reduce((s, m) => s + (m.precio_total || 0), 0),
      utilidad: salidas.reduce((s, m) => s + (m.utilidad || 0), 0),
      costoSal: salidas.reduce((s, m) => s + (m.costo_total || 0), 0),
    }
  }, [filtered])

  return (
    <div className="space-y-4">
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {[
              { v: 'todos',   l: 'Todos' },
              { v: 'entrada', l: 'Entradas' },
              { v: 'salida',  l: 'Salidas' },
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
          <div className="flex-1" />
          <span className="hidden md:inline-flex items-center gap-3 font-mono text-[10.5px] text-ink-400 mr-2">
            <span>Compras: <span className="text-ink-100 font-semibold">{fmtMoney(totales.compras)}</span></span>
            <span>·</span>
            <span>Ingresos: <span className="text-ink-100 font-semibold">{fmtMoney(totales.ingresos)}</span></span>
            <span>·</span>
            <span className={totales.utilidad >= 0 ? 'text-signal-ok' : 'text-signal-alert'}>
              Utilidad: <span className="font-semibold">{fmtMoney(totales.utilidad)}</span>
            </span>
          </span>
          <button onClick={openForm('entrada')} className="btn-primary">
            <ArrowDownToLine size={12} />
            Registrar entrada
          </button>
          <button onClick={openForm('salida')} className="btn-ghost">
            <ArrowUpFromLine size={12} />
            Registrar salida
          </button>
        </div>
      </Panel>

      <Panel tight>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Folio</th>
                <th className="table-head">Tipo</th>
                <th className="table-head">Fecha</th>
                <th className="table-head">Item</th>
                <th className="table-head text-right">Cantidad</th>
                <th className="table-head text-right">$ Unit.</th>
                <th className="table-head text-right">Total</th>
                <th className="table-head text-right">Utilidad</th>
                <th className="table-head">Concepto</th>
                <th className="table-head">Operador</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const esEntrada = m.tipo === 'entrada'
                const esSalida  = m.tipo === 'salida'
                const esVenta   = esSalida && (m.precio_total || 0) > 0
                const totalMov  = esEntrada ? (m.costo_total || 0) : (esVenta ? m.precio_total : -(m.costo_total || 0))
                const tieneFifo = esSalida && m.lotes_consumidos?.length > 0
                return (
                  <tr
                    key={m.id}
                    onClick={() => esSalida && setDetalle(m)}
                    className={`transition-colors ${esSalida ? 'cursor-pointer hover:bg-ink-850' : ''}`}
                  >
                    <td className="table-cell font-mono text-[11px] text-ink-300">{m.folio}</td>
                    <td className="table-cell">
                      {esEntrada ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-signal-ok">
                          <ArrowDownToLine size={10} /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-signal-warn">
                          <ArrowUpFromLine size={10} /> {esVenta ? 'Venta' : 'Salida'}
                          {tieneFifo && <Layers size={9} className="text-ink-400" />}
                        </span>
                      )}
                    </td>
                    <td className="table-cell font-mono text-[11px] text-ink-400">{fmtDateTime(m.fecha)}</td>
                    <td className="table-cell">
                      <div className="text-ink-50 font-medium">{m.item_nombre}</div>
                      {m.item_codigo && <div className="font-mono text-[10px] text-ink-400">{m.item_codigo}</div>}
                    </td>
                    <td className="table-cell text-right font-mono tabular-nums">
                      <span className={esEntrada ? 'text-signal-ok' : 'text-signal-warn'}>
                        {esEntrada ? '+' : '−'}{fmtNumber(m.cantidad, m.unidad === 'L' ? 2 : 0)}
                      </span>
                      <span className="text-ink-400 text-[10px] ml-1">{m.unidad}</span>
                    </td>
                    <td className="table-cell text-right font-mono tabular-nums text-ink-200">
                      {esEntrada
                        ? fmtMoney(m.costo_unitario || 0)
                        : esVenta
                          ? fmtMoney(m.precio_unitario || 0)
                          : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="table-cell text-right font-mono tabular-nums">
                      <span className="font-semibold text-ink-50">{fmtMoney(Math.abs(totalMov))}</span>
                      {esSalida && !esVenta && (
                        <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-wider">
                          gasto P&amp;L
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-right font-mono tabular-nums">
                      {esVenta && m.utilidad != null ? (
                        <>
                          <span className={m.utilidad >= 0 ? 'text-signal-ok font-semibold' : 'text-signal-alert font-semibold'}>
                            {m.utilidad >= 0 ? '+' : '−'}{fmtMoney(Math.abs(m.utilidad))}
                          </span>
                          {m.margen_pct != null && (
                            <div className={`font-mono text-[9.5px] ${m.utilidad >= 0 ? 'text-signal-ok' : 'text-signal-alert'}`}>
                              {m.margen_pct >= 0 ? '+' : ''}{m.margen_pct}%
                            </div>
                          )}
                        </>
                      ) : esSalida && !esVenta ? (
                        <span className="text-signal-alert font-mono text-[11px]">−{fmtMoney(m.costo_total || 0)}</span>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                    <td className="table-cell text-[12px] text-ink-200">
                      <div>{m.motivo}</div>
                      <div className="font-mono text-[10px] text-ink-400">
                        {m.proveedor || m.cliente || m.referencia || '—'}
                      </div>
                    </td>
                    <td className="table-cell text-ink-300 text-[12px]">{m.operador}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-ink-800 flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">
            {filtered.length} movimientos
          </span>
          <span className="font-mono text-[10px] text-ink-400">
            Click en una salida para ver desglose FIFO
          </span>
        </div>
      </Panel>

      {showForm && (
        <FormMovimiento
          tipo={showForm.tipo}
          anchorRect={showForm.anchorRect}
          aromas={aromas}
          difusores={difusores}
          onClose={() => setShowForm(null)}
          onSaved={() => { setShowForm(null); refresh() }}
        />
      )}

      {detalle && <MovimientoDrawer movimiento={detalle} onClose={() => setDetalle(null)} />}
    </div>
  )
}

function MovimientoDrawer({ movimiento: m, onClose }) {
  const esVenta = (m.precio_total || 0) > 0
  const lotes = m.lotes_consumidos || []
  const utilidad = m.utilidad ?? 0

  return createPortal(
    <div className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-ink-900 border-l border-ink-800 z-40 flex flex-col shadow-lift modal-pop">
      <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">{m.folio}</span>
            <span className="badge-warn">
              <ArrowUpFromLine size={9} /> {esVenta ? 'Venta' : 'Salida'}
            </span>
          </div>
          <h2 className="font-display font-semibold text-ink-50 text-lg leading-tight truncate">{m.item_nombre}</h2>
          <div className="font-mono text-[11px] text-ink-400 mt-1">
            {fmtDateTime(m.fecha)} · {m.operador}
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-ink-850 flex items-center justify-center text-ink-400 hover:text-ink-100 transition-colors flex-shrink-0">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Resumen económico */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3">
            <div className="stat-label mb-1">Cantidad</div>
            <div className="stat-num text-xl">
              {fmtNumber(m.cantidad, m.unidad === 'L' ? 2 : 0)} <span className="text-[12px] text-ink-400 font-mono">{m.unidad}</span>
            </div>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3">
            <div className="stat-label mb-1">Costo FIFO</div>
            <div className="stat-num text-xl">{fmtMoney(m.costo_total || 0)}</div>
            <div className="font-mono text-[10px] text-ink-400 mt-0.5">prom. {fmtMoney(m.costo_promedio || 0)}/{m.unidad}</div>
          </div>
          {esVenta ? (
            <>
              <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3">
                <div className="stat-label mb-1">Precio venta</div>
                <div className="stat-num text-xl">{fmtMoney(m.precio_total || 0)}</div>
                <div className="font-mono text-[10px] text-ink-400 mt-0.5">{fmtMoney(m.precio_unitario || 0)}/{m.unidad}</div>
              </div>
              <div className={`rounded-xl border px-4 py-3 ${
                utilidad >= 0 ? 'border-signal-okBorder bg-signal-okBg' : 'border-signal-alertBorder bg-signal-alertBg'
              }`}>
                <div className="stat-label mb-1 flex items-center gap-1">
                  {utilidad >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {utilidad >= 0 ? 'Utilidad' : 'Pérdida'}
                </div>
                <div className={`stat-num text-xl ${utilidad >= 0 ? 'text-signal-ok' : 'text-signal-alert'}`}>
                  {fmtMoney(Math.abs(utilidad))}
                </div>
                {m.margen_pct != null && (
                  <div className={`font-mono text-[10px] mt-0.5 ${utilidad >= 0 ? 'text-signal-ok' : 'text-signal-alert'}`}>
                    margen {m.margen_pct}%
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-2 rounded-xl border border-signal-alertBorder bg-signal-alertBg/60 px-4 py-3">
              <div className="stat-label mb-1">Impacto P&amp;L</div>
              <div className="stat-num text-xl text-signal-alert">−{fmtMoney(m.costo_total || 0)}</div>
              <div className="font-mono text-[10px] text-ink-400 mt-0.5">salida sin venta — gasto a P&amp;L</div>
            </div>
          )}
        </div>

        {/* Cliente / motivo */}
        <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="stat-label">Motivo</span>
            <span className="text-[12.5px] text-ink-100 font-medium">{m.motivo}</span>
          </div>
          {m.cliente && (
            <div className="flex items-center justify-between border-t border-ink-800 pt-2">
              <span className="stat-label">Cliente</span>
              <span className="text-[12.5px] text-ink-100">{m.cliente}</span>
            </div>
          )}
          {m.referencia && (
            <div className="flex items-center justify-between border-t border-ink-800 pt-2">
              <span className="stat-label">Referencia</span>
              <span className="font-mono text-[11.5px] text-ink-100">{m.referencia}</span>
            </div>
          )}
        </div>

        {/* Desglose FIFO */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-steel-600" />
              <span className="panel-title">Desglose FIFO · {lotes.length} lote{lotes.length !== 1 ? 's' : ''}</span>
            </div>
            <span className="font-mono text-[10px] text-ink-400">
              {fmtNumber(lotes.reduce((s, l) => s + l.cantidad, 0), m.unidad === 'L' ? 2 : 0)} {m.unidad}
            </span>
          </div>
          {lotes.length > 0 ? (
            <div className="space-y-2">
              {lotes.map((l, i) => (
                <div key={i} className="rounded-xl border border-ink-800 bg-ink-850 px-3.5 py-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-ink-400">Lote {i + 1}</span>
                        <span className="font-mono text-[10px] text-ink-300">{l.entrada_folio}</span>
                      </div>
                      <div className="font-mono text-[10.5px] text-ink-400 mt-0.5">
                        Entró el {fmtDate(l.fecha_entrada)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-semibold text-ink-50 text-[15px] tabular-nums">
                        {fmtMoney(l.subtotal)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11.5px] border-t border-ink-800 pt-2">
                    <span className="text-ink-300">
                      <span className="font-mono tabular-nums text-ink-100">{fmtNumber(l.cantidad, m.unidad === 'L' ? 2 : 0)} {m.unidad}</span>
                      <span className="text-ink-400 mx-1">×</span>
                      <span className="font-mono tabular-nums text-ink-100">{fmtMoney(l.costo_unitario)}</span>
                    </span>
                    <span className="font-mono text-[10px] text-ink-400">
                      {((l.subtotal / m.costo_total) * 100).toFixed(1)}% del costo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-ink-400 italic">Sin desglose FIFO disponible</div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
