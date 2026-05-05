import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { fmtMoney } from '@/utils/format'
import { financieros } from '@/services/api'
import { CxCTab } from '@/modules/finanzas/CxCTab'
import { CxPTab } from '@/modules/finanzas/CxPTab'
import { FlujoTab } from '@/modules/finanzas/FlujoTab'

const TABS = [
  { id: 'cxc', label: 'Cuentas por Cobrar', icon: ArrowDownToLine, sub: 'CxC' },
  { id: 'cxp', label: 'Cuentas por Pagar', icon: ArrowUpFromLine, sub: 'CxP' },
  { id: 'flujo', label: 'Flujo de Efectivo', icon: TrendingUp, sub: 'P&L' },
]

export default function Finanzas() {
  const [tab, setTab] = useState('cxc')
  const [kpis, setKpis] = useState(null)

  useEffect(() => { financieros.getKpis().then(setKpis) }, [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="CxC pendiente"
          value={fmtMoney(kpis?.cxc_total).replace('MXN', '').trim()}
          sub="MXN · Por cobrar"
          accent
        />
        <StatCard
          label="CxC vencida"
          value={fmtMoney(kpis?.cxc_vencido).replace('MXN', '').trim()}
          sub={`${kpis?.facturas_vencidas || 0} facturas vencidas`}
          danger
        />
        <StatCard
          label="CxP pendiente"
          value={fmtMoney(kpis?.cxp_total).replace('MXN', '').trim()}
          sub="MXN · Por pagar"
        />
        <StatCard
          label="Utilidad mes"
          value={fmtMoney(kpis?.utilidad_mes).replace('MXN', '').trim()}
          sub={`Ingresos ${fmtMoney(kpis?.ingresos_mes)}`}
        />
      </div>

      <div className="border-b border-ink-800 flex items-end gap-0">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors -mb-px ${
                active ? 'border-steel-600 text-ink-50' : 'border-transparent text-ink-400 hover:text-ink-100'
              }`}
            >
              <Icon size={14} />
              <span className="font-medium text-sm">{t.label}</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 ${
                active ? 'bg-steel-100 text-steel-700' : 'bg-ink-800 text-ink-500'
              }`}>
                {t.sub}
              </span>
            </button>
          )
        })}
      </div>

      {tab === 'cxc' && <CxCTab />}
      {tab === 'cxp' && <CxPTab />}
      {tab === 'flujo' && <FlujoTab />}
    </div>
  )
}
