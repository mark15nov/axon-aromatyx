import { useEffect, useMemo, useState } from 'react'
import { Search, Download, FileText, Send } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtDate } from '@/utils/format'
import { financieros } from '@/services/api'

export function CxPTab() {
  const [cxp, setCxp] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('todos')

  useEffect(() => { financieros.listCuentasPorPagar().then(setCxp) }, [])

  const filtered = useMemo(() => {
    return cxp.filter(c => {
      const mq = !q || c.proveedor.toLowerCase().includes(q.toLowerCase()) || c.folio.toLowerCase().includes(q.toLowerCase())
      const ms = status === 'todos' || c.status === status
      return mq && ms
    })
  }, [cxp, q, status])

  const total = filtered.reduce((s, c) => s + c.monto_pendiente, 0)
  const vencidos = cxp.filter(c => c.status === 'vencido').reduce((s, c) => s + c.monto_pendiente, 0)

  // Agrupado por proveedor para vista pivote
  const porProveedor = useMemo(() => {
    const map = {}
    cxp.forEach(c => {
      if (!map[c.proveedor]) map[c.proveedor] = { proveedor: c.proveedor, total: 0, count: 0, vencido: 0 }
      map[c.proveedor].total += c.monto_pendiente
      map[c.proveedor].count += 1
      if (c.status === 'vencido') map[c.proveedor].vencido += c.monto_pendiente
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 6)
  }, [cxp])

  return (
    <div className="space-y-4">
      {/* Top proveedores */}
      <Panel title="Top 6 proveedores · saldo pendiente">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {porProveedor.map(p => (
            <div key={p.proveedor} className="border border-ink-800 p-3 hover:border-ink-700 transition-colors">
              <div className="text-sm text-ink-100 font-medium truncate mb-1">{p.proveedor}</div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="stat-num text-lg">{fmtMoney(p.total)}</span>
                <span className="font-mono text-[10px] text-ink-500">{p.count} OC</span>
              </div>
              {p.vencido > 0 && (
                <div className="font-mono text-[10px] text-signal-alert uppercase tracking-wider">
                  Vencido: {fmtMoney(p.vencido)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* Filtros */}
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full flex-1 min-w-[200px] focus-within:border-steel-400 focus-within:shadow-focus transition-all">
            <Search size={13} className="text-ink-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar proveedor o OC..."
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-ink-500 text-ink-200"
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              { v: 'todos', l: 'Todos' },
              { v: 'vencido', l: 'Vencidos' },
              { v: 'por_vencer', l: 'Por vencer' },
              { v: 'pagado', l: 'Pagados' },
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
          <button className="btn-ghost">
            <Download size={11} /> Exportar
          </button>
        </div>
      </Panel>

      <Panel tight>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">OC</th>
                <th className="table-head">Proveedor</th>
                <th className="table-head">Concepto</th>
                <th className="table-head">Vencimiento</th>
                <th className="table-head text-right">Monto</th>
                <th className="table-head text-right">Pendiente</th>
                <th className="table-head text-center">Vencido</th>
                <th className="table-head">Estado</th>
                <th className="table-head text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-ink-900 transition-colors">
                  <td className="table-cell font-mono text-[11px] text-ink-300">{c.folio}</td>
                  <td className="table-cell text-ink-100 font-medium">{c.proveedor}</td>
                  <td className="table-cell text-ink-300 text-[12px]">{c.concepto}</td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">{fmtDate(c.fecha_vencimiento)}</td>
                  <td className="table-cell text-right font-mono text-ink-200 tabular-nums">{fmtMoney(c.monto)}</td>
                  <td className="table-cell text-right font-mono tabular-nums font-medium text-ink-100">
                    {fmtMoney(c.monto_pendiente)}
                  </td>
                  <td className="table-cell text-center">
                    {c.dias_vencido > 0 ? (
                      <span className="font-mono text-[11px] tabular-nums text-signal-alert">+{c.dias_vencido}d</span>
                    ) : (
                      <span className="font-mono text-[11px] text-ink-500">—</span>
                    )}
                  </td>
                  <td className="table-cell"><StatusBadge status={c.status} /></td>
                  <td className="table-cell text-right">
                    <div className="inline-flex gap-1">
                      <button title="Pagar ahora" className="p-1.5 text-ink-400 hover:text-steel-700 hover:bg-ink-800">
                        <Send size={12} />
                      </button>
                      <button title="Ver OC" className="p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
                        <FileText size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-ink-950 border-t-2 border-ink-700">
                <td colSpan={5} className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-400">
                  {filtered.length} registros · Vencido: <span className="text-signal-alert">{fmtMoney(vencidos)}</span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-bold text-ink-50 tabular-nums">{fmtMoney(total)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
  )
}
