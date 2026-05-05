import { useEffect, useState } from 'react'
import { Box, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney } from '@/utils/format'
import { inventarios } from '@/services/api'
import { FormMovimiento } from './FormMovimiento'

export function DifusoresTab() {
  const [difs, setDifs] = useState([])
  const [form, setForm] = useState(null) // { tipo, item, anchorRect }

  const refresh = () => inventarios.listDifusores().then(setDifs)
  useEffect(() => { refresh() }, [])

  const openForm = (tipo, item) => (e) => {
    setForm({ tipo, item, anchorRect: e.currentTarget.getBoundingClientRect() })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {difs.map(d => {
        const status = d.stock < d.stock_minimo * 0.5 ? 'critico' : d.stock < d.stock_minimo ? 'bajo' : 'ok'
        const margen = Math.round(((d.precio - d.costo) / d.precio) * 100)
        return (
          <div key={d.id} className="panel">
            <div className="px-5 py-4 border-b border-ink-800 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                  d.tipo === 'grande' ? 'bg-steel-50 border-steel-200' : 'bg-ink-850 border-ink-800'
                }`}>
                  <Box size={d.tipo === 'grande' ? 22 : 16} className={d.tipo === 'grande' ? 'text-steel-700' : 'text-ink-300'} />
                </div>
                <div>
                  <div className="font-display font-semibold text-ink-50 text-xl">{d.nombre}</div>
                  <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">{d.codigo} · {d.descripcion}</div>
                </div>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <div className="stat-label mb-1">Stock disponible</div>
                <div className="flex items-baseline gap-1">
                  <span className="stat-num text-3xl">{d.stock}</span>
                  <span className="font-mono text-xs text-ink-400">pza</span>
                </div>
                <div className="font-mono text-[10px] text-ink-400 mt-0.5">mín. {d.stock_minimo}</div>
              </div>
              <div>
                <div className="stat-label mb-1">Cobertura</div>
                <div className="flex items-baseline gap-1">
                  <span className="stat-num text-3xl">{d.cobertura_m2}</span>
                  <span className="font-mono text-xs text-ink-400">m²</span>
                </div>
                <div className="font-mono text-[10px] text-ink-400 mt-0.5">por unidad</div>
              </div>
              <div>
                <div className="stat-label mb-1">Costo</div>
                <div className="stat-num text-base">{fmtMoney(d.costo)}</div>
              </div>
              <div>
                <div className="stat-label mb-1">Precio · Margen</div>
                <div className="flex items-baseline gap-2">
                  <div className="stat-num text-base">{fmtMoney(d.precio)}</div>
                  <div className="font-mono text-[10px] text-signal-ok">+{margen}%</div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-3">
              <div className="stat-label mb-2">Nivel</div>
              <div className="h-2 bg-ink-800 rounded-full relative overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    status === 'critico' ? 'bg-signal-alert' :
                    status === 'bajo' ? 'bg-signal-warn' : 'bg-steel-600'
                  }`}
                  style={{ width: `${Math.min(100, (d.stock / (d.stock_minimo * 3)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="border-t border-ink-800 grid grid-cols-2 divide-x divide-ink-800">
              <button
                type="button"
                onClick={openForm('entrada', d)}
                className="px-4 py-3 flex items-center justify-center gap-2 text-ink-100 hover:bg-ink-850 transition-colors"
              >
                <ArrowDownToLine size={13} className="text-signal-ok" />
                <span className="font-mono text-[10px] uppercase tracking-wider">Entrada</span>
              </button>
              <button
                type="button"
                onClick={openForm('salida', d)}
                className="px-4 py-3 flex items-center justify-center gap-2 text-ink-100 hover:bg-ink-850 transition-colors"
              >
                <ArrowUpFromLine size={13} className="text-signal-warn" />
                <span className="font-mono text-[10px] uppercase tracking-wider">Salida</span>
              </button>
            </div>
          </div>
        )
      })}

      {form && (
        <FormMovimiento
          tipo={form.tipo}
          anchorRect={form.anchorRect}
          aromas={[]}
          difusores={difs}
          presetItem={form.item}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); refresh() }}
        />
      )}
    </div>
  )
}
