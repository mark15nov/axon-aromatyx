import { useEffect, useState } from 'react'
import { Target, Bot, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { fmtMoney } from '@/utils/format'
import { ventas } from '@/services/api'
import { ProspectosTab } from '@/modules/ventas/ProspectosTab'
import { CampanasTab } from '@/modules/ventas/CampanasTab'
import { OportunidadesTab } from '@/modules/ventas/OportunidadesTab'

const TABS = [
  { id: 'campanas', label: 'Campañas', icon: Bot, sub: 'Agentes' },
  { id: 'prospectos', label: 'Prospectos', icon: Target, sub: 'CRM' },
  { id: 'oportunidades', label: 'Oportunidades de zona', icon: Sparkles, sub: 'Sinergia' },
]

export default function Ventas() {
  const [tab, setTab] = useState('campanas')
  const [kpis, setKpis] = useState(null)

  useEffect(() => { ventas.getKpis().then(setKpis) }, [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Pipeline activo"
          value={fmtMoney(kpis?.pipeline).replace('MXN', '').trim()}
          sub={`${kpis?.prospectos_total || 0} prospectos totales`}
          accent
        />
        <StatCard
          label="Citas agendadas"
          value={kpis?.citas_agendadas || 0}
          sub="Listas para tu equipo humano"
        />
        <StatCard
          label="Tasa de apertura"
          value={`${kpis?.tasa_apertura || 0}%`}
          sub="Email outreach"
        />
        <StatCard
          label="Cerrados este mes"
          value={kpis?.cerrados || 0}
          sub="Nuevos clientes activos"
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

      {tab === 'campanas' && <CampanasTab />}
      {tab === 'prospectos' && <ProspectosTab />}
      {tab === 'oportunidades' && <OportunidadesTab />}
    </div>
  )
}
