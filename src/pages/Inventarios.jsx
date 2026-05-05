import { useEffect, useState } from 'react'
import { Droplet, Box, ArrowLeftRight, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { fmtMoney } from '@/utils/format'
import { inventarios } from '@/services/api'
import { AromasTab } from '@/modules/inventarios/AromasTab'
import { DifusoresTab } from '@/modules/inventarios/DifusoresTab'
import { MovimientosTab } from '@/modules/inventarios/MovimientosTab'

const TABS = [
  { id: 'aromas',      label: 'Aromas',      icon: Droplet,        count: '50' },
  { id: 'difusores',   label: 'Difusores',   icon: Box,            count: '2' },
  { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight, count: 'FIFO' },
]

export default function Inventarios() {
  const [tab, setTab] = useState('aromas')
  const [kpis, setKpis] = useState(null)

  useEffect(() => { inventarios.getKpis().then(setKpis) }, [])

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Valor inv. FIFO"
          value={fmtMoney(kpis?.valor_total).replace('MXN', '').trim()}
          sub="costo de lotes abiertos"
          accent
          icon={Box}
        />
        <StatCard
          label="Ventas mes"
          value={fmtMoney(kpis?.ventas_mes).replace('MXN', '').trim()}
          sub={kpis?.utilidad_mes != null
            ? `Utilidad ${fmtMoney(kpis.utilidad_mes).replace('MXN', '').trim()}`
            : 'Últimos 30 días'}
          icon={TrendingUp}
        />
        <StatCard
          label="Margen promedio"
          value={`${kpis?.margen_promedio || 0}%`}
          sub="Ventas con FIFO"
          accent={!!(kpis?.margen_promedio && kpis.margen_promedio > 30)}
        />
        <StatCard
          label="Aromas críticos"
          value={kpis?.aromas_criticos || 0}
          sub="Reorden inmediato"
          danger
        />
        <StatCard
          label="Aromas bajos"
          value={kpis?.aromas_bajos || 0}
          sub="Próximos a faltar"
          warn
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-ink-800 flex items-end gap-0">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors -mb-px ${
                active
                  ? 'border-steel-600 text-ink-50'
                  : 'border-transparent text-ink-400 hover:text-ink-100'
              }`}
            >
              <Icon size={14} />
              <span className="font-medium text-sm">{t.label}</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                active ? 'bg-steel-100 text-steel-700' : 'bg-ink-850 text-ink-400'
              }`}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'aromas' && <AromasTab />}
      {tab === 'difusores' && <DifusoresTab />}
      {tab === 'movimientos' && <MovimientosTab />}
    </div>
  )
}
