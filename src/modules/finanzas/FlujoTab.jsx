import { useEffect, useState } from 'react'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  ComposedChart, Bar, Line,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney } from '@/utils/format'
import { financieros } from '@/services/api'

export function FlujoTab() {
  const [flujo, setFlujo] = useState([])

  useEffect(() => { financieros.getFlujo().then(setFlujo) }, [])

  const enriched = flujo.map(m => ({ ...m, utilidad: m.ingresos - m.egresos }))
  const totalIng = enriched.reduce((s, m) => s + m.ingresos, 0)
  const totalEgr = enriched.reduce((s, m) => s + m.egresos, 0)
  const margen = totalIng ? Math.round(((totalIng - totalEgr) / totalIng) * 100) : 0

  return (
    <div className="space-y-4">
      {/* KPIs comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="panel p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-steel-200/30 rounded-full blur-2xl" />
          <div className="relative">
            <div className="stat-label mb-2 flex items-center gap-1.5">
              <TrendingUp size={11} className="text-steel-600" />
              Ingresos · 6 meses
            </div>
            <div className="stat-num text-3xl">{fmtMoney(totalIng)}</div>
            <div className="font-mono text-[10px] text-signal-ok uppercase tracking-wider mt-1">
              ↗ +12.4% vs período anterior
            </div>
          </div>
        </div>
        <div className="panel p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-ink-600/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="stat-label mb-2 flex items-center gap-1.5">
              <TrendingDown size={11} className="text-ink-400" />
              Egresos · 6 meses
            </div>
            <div className="stat-num text-3xl">{fmtMoney(totalEgr)}</div>
            <div className="font-mono text-[10px] text-signal-warn uppercase tracking-wider mt-1">
              ↗ +6.1% vs período anterior
            </div>
          </div>
        </div>
        <div className="panel p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="stat-label mb-2">Utilidad neta</div>
            <div className="stat-num text-3xl text-signal-ok">{fmtMoney(totalIng - totalEgr)}</div>
            <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wider mt-1">
              Margen {margen}%
            </div>
          </div>
        </div>
      </div>

      {/* Flujo mensual */}
      <Panel title="Flujo de efectivo · 6 meses" action={
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-steel-600" /><span className="text-ink-400">Ingresos</span></span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-ink-600" /><span className="text-ink-400">Egresos</span></span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-green-500" /><span className="text-ink-400">Utilidad</span></span>
        </div>
      }>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={enriched} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid stroke="#ebe4d8" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#7a6f63', fontFamily: 'DM Mono' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7a6f63', fontFamily: 'DM Mono' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip
              cursor={{ fill: 'rgba(194,89,43,0.06)' }}
              contentStyle={{ background: '#ffffff', border: '1px solid #ebe4d8', fontSize: 11, fontFamily: 'DM Mono' }}
              formatter={(v) => fmtMoney(v)}
            />
            <Bar dataKey="ingresos" fill="#c2592b" />
            <Bar dataKey="egresos" fill="#d6cdc1" />
            <Line type="monotone" dataKey="utilidad" stroke="#15803d" strokeWidth={2.5} dot={{ fill: '#15803d', r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      {/* Tabla detallada */}
      <Panel title="Desglose mensual">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Mes</th>
                <th className="table-head text-right">Ingresos</th>
                <th className="table-head text-right">Egresos</th>
                <th className="table-head text-right">Utilidad</th>
                <th className="table-head text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map(m => {
                const margenMes = m.ingresos ? Math.round((m.utilidad / m.ingresos) * 100) : 0
                return (
                  <tr key={m.mes} className="hover:bg-ink-900 transition-colors">
                    <td className="table-cell font-mono font-medium text-ink-100">{m.mes}</td>
                    <td className="table-cell text-right font-mono text-ink-100 tabular-nums">{fmtMoney(m.ingresos)}</td>
                    <td className="table-cell text-right font-mono text-ink-300 tabular-nums">{fmtMoney(m.egresos)}</td>
                    <td className="table-cell text-right font-mono text-signal-ok tabular-nums font-medium">{fmtMoney(m.utilidad)}</td>
                    <td className="table-cell text-right font-mono text-ink-300 tabular-nums">{margenMes}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
