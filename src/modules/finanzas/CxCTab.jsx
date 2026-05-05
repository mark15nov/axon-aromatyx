import { useEffect, useMemo, useState } from 'react'
import { Search, Download, Mail, Phone, FileText } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Panel } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { fmtMoney, fmtDate } from '@/utils/format'
import { financieros } from '@/services/api'

const COLORS_BUCKET = ['#7fa37b', '#5d9bbf', '#d29c4f', '#e58a4d', '#b91c1c']

export function CxCTab() {
  const [cxc, setCxc] = useState([])
  const [antiguedad, setAntiguedad] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('todos')

  useEffect(() => {
    financieros.listCuentasPorCobrar().then(setCxc)
    financieros.getAntiguedadCxc().then(setAntiguedad)
  }, [])

  const filtered = useMemo(() => {
    return cxc.filter(c => {
      const mq = !q || c.cliente.toLowerCase().includes(q.toLowerCase()) || c.folio.toLowerCase().includes(q.toLowerCase())
      const ms = status === 'todos' || c.status === status
      return mq && ms
    })
  }, [cxc, q, status])

  const totalFiltered = filtered.reduce((s, c) => s + c.monto_pendiente, 0)
  const vencidos = cxc.filter(c => c.status === 'vencido').reduce((s, c) => s + c.monto_pendiente, 0)

  return (
    <div className="space-y-4">
      {/* Antigüedad de saldos */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />
              <span className="panel-title">Antigüedad de saldos</span>
            </div>
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">Días vencidos</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={antiguedad} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="rango" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7a6f63', fontFamily: 'DM Mono' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7a6f63', fontFamily: 'DM Mono' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  cursor={{ fill: 'rgba(194,89,43,0.06)' }}
                  contentStyle={{ background: '#ffffff', border: '1px solid #ebe4d8', fontSize: 11, fontFamily: 'DM Mono' }}
                  formatter={(v) => [fmtMoney(v), 'Monto']}
                />
                <Bar dataKey="monto">
                  {antiguedad.map((_, i) => <Cell key={i} fill={COLORS_BUCKET[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />
              <span className="panel-title">Distribución</span>
            </div>
          </div>
          <div className="p-4 space-y-2.5">
            {antiguedad.map((b, i) => {
              const total = antiguedad.reduce((s, x) => s + x.monto, 0) || 1
              const pct = (b.monto / total) * 100
              return (
                <div key={b.rango}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2" style={{ background: COLORS_BUCKET[i] }} />
                      <span className="font-mono text-[11px] text-ink-300 uppercase">{b.rango} días</span>
                    </div>
                    <span className="font-mono text-[12px] tabular-nums text-ink-100">{fmtMoney(b.monto)}</span>
                  </div>
                  <div className="h-1.5 bg-ink-800 overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, background: COLORS_BUCKET[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full flex-1 min-w-[200px] focus-within:border-steel-400 focus-within:shadow-focus transition-all">
            <Search size={13} className="text-ink-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar cliente o folio..."
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-ink-500 text-ink-200"
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              { v: 'todos', l: 'Todos' },
              { v: 'vencido', l: 'Vencidos' },
              { v: 'por_vencer', l: 'Por vencer' },
              { v: 'parcial', l: 'Parciales' },
              { v: 'al_dia', l: 'Al día' },
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

      {/* Tabla */}
      <Panel tight>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Folio</th>
                <th className="table-head">Cliente</th>
                <th className="table-head">Emisión</th>
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
                  <td className="table-cell">
                    <div className="text-ink-100 font-medium">{c.cliente}</div>
                    <div className="font-mono text-[10px] text-ink-500">{c.metodo_pago}</div>
                  </td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">{fmtDate(c.fecha_emision)}</td>
                  <td className="table-cell font-mono text-[11px] text-ink-400">{fmtDate(c.fecha_vencimiento)}</td>
                  <td className="table-cell text-right font-mono text-ink-200 tabular-nums">{fmtMoney(c.monto)}</td>
                  <td className="table-cell text-right font-mono tabular-nums font-medium">
                    <span className={c.status === 'vencido' ? 'text-signal-alert' : 'text-ink-100'}>
                      {fmtMoney(c.monto_pendiente)}
                    </span>
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
                      <button title="Enviar email" className="p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
                        <Mail size={12} />
                      </button>
                      <button title="Llamar" className="p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
                        <Phone size={12} />
                      </button>
                      <button title="Ver factura" className="p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800">
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
                <td className="px-3 py-2.5 text-right font-mono font-bold text-ink-50 tabular-nums">{fmtMoney(totalFiltered)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
  )
}
