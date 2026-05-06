import { useState } from 'react'
import { Calculator, Calendar } from 'lucide-react'
import { CotizadorTab } from '@/modules/logistica/CotizadorTab'
import { AgendaTab } from '@/modules/logistica/AgendaTab'

const TABS = [
  { id: 'cotizador', label: 'Cotizar viaje',     icon: Calculator, sub: 'Nuevo' },
  { id: 'agenda',    label: 'Agenda de viajes',  icon: Calendar,   sub: 'Histórico' },
]

export default function Logistica() {
  const [tab, setTab] = useState('cotizador')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-semibold text-ink-50 text-[24px] tracking-tight leading-tight">
          Viajes foráneos de operadores
        </h1>
        <p className="text-[13.5px] text-ink-400 mt-1 max-w-2xl">
          Cotiza transporte, hospedaje y viáticos para los operadores que salen de CDMX a atender clientes en otras ciudades.
        </p>
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
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                active ? 'bg-steel-100 text-steel-700' : 'bg-ink-850 text-ink-400'
              }`}>
                {t.sub}
              </span>
            </button>
          )
        })}
      </div>

      {tab === 'cotizador' && <CotizadorTab />}
      {tab === 'agenda'    && <AgendaTab />}
    </div>
  )
}
