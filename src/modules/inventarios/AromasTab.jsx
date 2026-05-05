import { useEffect, useMemo, useState } from 'react'
import { Search, Filter, Droplet, AlertCircle, ArrowDownToLine, ArrowUpFromLine, Layers } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtNumber, fmtRelative, fmtDate } from '@/utils/format'
import { inventarios } from '@/services/api'
import { FormMovimiento } from './FormMovimiento'

const FAMILIAS = ['Todas', 'Floral', 'Cítrica', 'Amaderada', 'Especiada', 'Frutal', 'Herbal', 'Acuática', 'Dulce']

export function AromasTab() {
  const [aromas, setAromas] = useState([])
  const [q, setQ] = useState('')
  const [familia, setFamilia] = useState('Todas')
  const [status, setStatus] = useState('todos')
  const [selected, setSelected] = useState(null)
  const [lotes, setLotes] = useState([])
  const [showForm, setShowForm] = useState(null) // { tipo, anchorRect } | null

  const refreshAromas = () => inventarios.listAromas().then(setAromas)
  useEffect(() => { refreshAromas() }, [])

  // Cargar lotes abiertos del aroma seleccionado
  useEffect(() => {
    if (!selected) { setLotes([]); return }
    inventarios.listLotes('aroma', selected.id).then(setLotes)
  }, [selected])

  // Costo promedio ponderado FIFO desde los lotes abiertos
  const costoFIFO = useMemo(() => {
    if (!lotes.length) return null
    const totalQty = lotes.reduce((s, l) => s + l.cantidad_restante, 0)
    const totalCost = lotes.reduce((s, l) => s + l.cantidad_restante * l.costo_unitario, 0)
    return totalQty > 0 ? totalCost / totalQty : 0
  }, [lotes])

  const valorInventarioFIFO = useMemo(() =>
    lotes.reduce((s, l) => s + l.cantidad_restante * l.costo_unitario, 0),
  [lotes])

  const openForm = (tipo) => (e) => {
    setShowForm({ tipo, anchorRect: e.currentTarget.getBoundingClientRect() })
  }

  const filtered = useMemo(() => {
    return aromas.filter(a => {
      const matchQ = !q || a.nombre.toLowerCase().includes(q.toLowerCase()) || a.codigo.toLowerCase().includes(q.toLowerCase())
      const matchF = familia === 'Todas' || a.familia === familia
      const matchS = status === 'todos' || a.stock_status === status
      return matchQ && matchF && matchS
    })
  }, [aromas, q, familia, status])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className={`${selected ? 'col-span-12 lg:col-span-8' : 'col-span-12'} space-y-4`}>
        {/* Filtros */}
        <Panel tight>
          <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full flex-1 min-w-[200px] focus-within:border-steel-400 focus-within:shadow-focus transition-all">
              <Search size={13} className="text-ink-500" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="bg-transparent flex-1 outline-none text-sm placeholder:text-ink-500 text-ink-200"
              />
            </div>
            <Filter size={13} className="text-ink-500" />
            <div className="flex items-center gap-1 flex-wrap">
              {FAMILIAS.map(f => (
                <button
                  key={f}
                  onClick={() => setFamilia(f)}
                  className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                    familia === f
                      ? 'bg-steel-600 border-steel-600 text-white'
                      : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-ink-700" />
            <div className="flex items-center gap-1">
              {[
                { v: 'todos', l: 'Todos' },
                { v: 'critico', l: 'Crítico' },
                { v: 'bajo', l: 'Bajo' },
                { v: 'ok', l: 'OK' },
              ].map(s => (
                <button
                  key={s.v}
                  onClick={() => setStatus(s.v)}
                  className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                    status === s.v
                      ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                      : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
                  }`}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {/* Tabla */}
        <Panel tight>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-head w-[90px]">Código</th>
                  <th className="table-head">Aroma</th>
                  <th className="table-head">Familia</th>
                  <th className="table-head text-right">Stock</th>
                  <th className="table-head text-right">Mín.</th>
                  <th className="table-head text-right">$/L</th>
                  <th className="table-head">Estado</th>
                  <th className="table-head">Últ. mov.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`cursor-pointer transition-colors ${selected?.id === a.id ? 'bg-ink-800' : 'hover:bg-ink-900'}`}
                  >
                    <td className="table-cell font-mono text-[11px] text-ink-400">{a.codigo}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Droplet size={11} className="text-steel-600" />
                        <span className="text-ink-100 font-medium">{a.nombre}</span>
                      </div>
                    </td>
                    <td className="table-cell text-ink-300 text-[12px]">{a.familia}</td>
                    <td className="table-cell text-right">
                      <span className="font-mono text-ink-100 tabular-nums">{fmtNumber(a.stock_litros, 2)}</span>
                      <span className="font-mono text-[10px] text-ink-500 ml-1">L</span>
                    </td>
                    <td className="table-cell text-right font-mono text-[11px] text-ink-500 tabular-nums">{a.stock_minimo} L</td>
                    <td className="table-cell text-right font-mono text-ink-200 tabular-nums">{fmtMoney(a.costo_por_litro)}</td>
                    <td className="table-cell"><StatusBadge status={a.stock_status} /></td>
                    <td className="table-cell font-mono text-[11px] text-ink-400">{fmtRelative(a.ultimo_movimiento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-ink-800 flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
              {filtered.length} de {aromas.length} aromas
            </span>
            <span className="font-mono text-[10px] text-ink-500">
              Total stock: <span className="text-ink-200">{fmtNumber(filtered.reduce((s, a) => s + a.stock_litros, 0), 2)} L</span>
            </span>
          </div>
        </Panel>
      </div>

      {/* Drawer detalle */}
      {selected && (
        <div className="col-span-12 lg:col-span-4">
          <Panel title={`Detalle · ${selected.codigo}`} action={
            <button onClick={() => setSelected(null)} className="font-mono text-[10px] text-ink-500 hover:text-ink-200 uppercase tracking-wider">
              Cerrar ×
            </button>
          }>
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-steel-50 border border-steel-200 flex items-center justify-center">
                  <Droplet size={16} className="text-steel-700" />
                </div>
                <div>
                  <div className="font-display font-semibold text-ink-50 text-lg leading-tight">{selected.nombre}</div>
                  <div className="font-mono text-[11px] text-ink-500 uppercase tracking-wider">{selected.familia}</div>
                </div>
              </div>

              {selected.stock_status !== 'ok' && (
                <div className={`mb-4 p-3 border flex items-start gap-2 ${
                  selected.stock_status === 'critico'
                    ? 'border-signal-alert/30 bg-signal-alertBg/30'
                    : 'border-signal-warn/30 bg-signal-warnBg/30'
                }`}>
                  <AlertCircle size={14} className={selected.stock_status === 'critico' ? 'text-signal-alert' : 'text-signal-warn'} />
                  <div className="text-[11px]">
                    <div className={`font-mono uppercase tracking-wider font-medium ${
                      selected.stock_status === 'critico' ? 'text-signal-alert' : 'text-signal-warn'
                    }`}>
                      {selected.stock_status === 'critico' ? 'Stock crítico' : 'Stock bajo'}
                    </div>
                    <div className="text-ink-300 mt-0.5">Reordenar antes de fin de semana</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <DetailField label="Stock actual" value={`${fmtNumber(selected.stock_litros, 2)} L`} large />
                <DetailField label="Stock mínimo" value={`${selected.stock_minimo} L`} />
                <DetailField
                  label="Costo prom. FIFO"
                  value={costoFIFO != null ? fmtMoney(costoFIFO) : '—'}
                  hint={costoFIFO != null && Math.abs(costoFIFO - selected.costo_por_litro) > 1
                    ? `lista: ${fmtMoney(selected.costo_por_litro)}` : null}
                />
                <DetailField label="Precio venta / L" value={fmtMoney(selected.precio_venta_litro)} />
                <DetailField
                  label="Margen vs FIFO"
                  value={costoFIFO != null && costoFIFO > 0
                    ? `${Math.round(((selected.precio_venta_litro - costoFIFO) / selected.precio_venta_litro) * 100)}%`
                    : '—'}
                />
                <DetailField label="Valor inv. FIFO" value={fmtMoney(valorInventarioFIFO)} />
              </div>

              <div className="mb-4 pt-3 border-t border-ink-800">
                <div className="stat-label mb-2">Nivel de stock</div>
                <div className="h-2 bg-ink-800 rounded-full relative overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selected.stock_status === 'critico' ? 'bg-signal-alert' :
                      selected.stock_status === 'bajo' ? 'bg-signal-warn' : 'bg-steel-600'
                    }`}
                    style={{ width: `${Math.min(100, (selected.stock_litros / (selected.stock_minimo * 4)) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-ink-400 mt-1.5">
                  <span>0 L</span>
                  <span>min: {selected.stock_minimo}L</span>
                  <span>{selected.stock_minimo * 4} L</span>
                </div>
              </div>

              {/* Lotes abiertos FIFO */}
              {lotes.length > 0 && (
                <div className="mb-4 pt-4 border-t border-ink-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Layers size={12} className="text-steel-600" />
                      <span className="panel-title">Lotes abiertos (FIFO)</span>
                    </div>
                    <span className="font-mono text-[10px] text-ink-400">
                      {lotes.length} · {fmtNumber(lotes.reduce((s, l) => s + l.cantidad_restante, 0), 2)} L
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {lotes.map((l, i) => {
                      const pctConsumido = (l.cantidad_consumida || 0) / l.cantidad
                      return (
                        <div key={l.id} className="rounded-lg border border-ink-800 bg-ink-850 px-3 py-2">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`flex-shrink-0 w-5 h-5 rounded-full text-[9.5px] font-mono flex items-center justify-center ${
                                i === 0 ? 'bg-steel-600 text-white' : 'bg-ink-800 text-ink-300'
                              }`}>{i + 1}</span>
                              <span className="font-mono text-[10.5px] text-ink-400 truncate">{l.folio}</span>
                              <span className="font-mono text-[10px] text-ink-400 whitespace-nowrap">· {fmtDate(l.fecha)}</span>
                            </div>
                            {i === 0 && <span className="badge-accent flex-shrink-0">Próximo</span>}
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="font-mono text-[12px] tabular-nums">
                              <span className="font-semibold text-ink-50">{fmtNumber(l.cantidad_restante, 2)} L</span>
                              <span className="text-ink-400 mx-1">@</span>
                              <span className="text-ink-200">{fmtMoney(l.costo_unitario)}/L</span>
                            </div>
                            <div className="font-mono text-[10px] text-ink-400">
                              {l.cantidad_consumida > 0
                                ? `${(pctConsumido * 100).toFixed(0)}% consumido`
                                : 'intacto'}
                            </div>
                          </div>
                          {l.cantidad_consumida > 0 && (
                            <div className="mt-1.5 h-0.5 bg-ink-800 rounded-full overflow-hidden">
                              <div className="h-full bg-steel-400 rounded-full" style={{ width: `${pctConsumido * 100}%` }} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-ink-800">
                <button
                  type="button"
                  onClick={openForm('entrada')}
                  className="btn-primary flex-1 justify-center"
                >
                  <ArrowDownToLine size={12} /> Entrada
                </button>
                <button
                  type="button"
                  onClick={openForm('salida')}
                  className="btn-ghost flex-1 justify-center"
                >
                  <ArrowUpFromLine size={12} /> Salida
                </button>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {showForm && selected && (
        <FormMovimiento
          tipo={showForm.tipo}
          anchorRect={showForm.anchorRect}
          aromas={aromas}
          difusores={[]}
          presetItem={selected}
          onClose={() => setShowForm(null)}
          onSaved={() => {
            setShowForm(null)
            inventarios.listAromas().then(list => {
              setAromas(list)
              const updated = list.find(a => a.id === selected.id)
              if (updated) setSelected(updated)
            })
            // Recargar lotes para reflejar el cambio
            inventarios.listLotes('aroma', selected.id).then(setLotes)
          }}
        />
      )}
    </div>
  )
}

function DetailField({ label, value, large, hint }) {
  return (
    <div>
      <div className="stat-label mb-1">{label}</div>
      <div className={`stat-num ${large ? 'text-xl' : 'text-sm'}`}>{value}</div>
      {hint && <div className="font-mono text-[10px] text-ink-400 mt-0.5">{hint}</div>}
    </div>
  )
}
