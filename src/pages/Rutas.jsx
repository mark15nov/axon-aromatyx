import { useEffect, useState } from 'react'
import { Map, Users, Building2 } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { rutas } from '@/services/api'
import { ZonasTab } from '@/modules/rutas/ZonasTab'
import { OperadoresTab } from '@/modules/rutas/OperadoresTab'
import { ClientesTab } from '@/modules/rutas/ClientesTab'
import { ClienteDrawer } from '@/modules/rutas/ClienteDrawer'

const TABS = [
  { id: 'zonas', label: 'Zonas + Mapa', icon: Map, sub: '8' },
  { id: 'clientes', label: 'Clientes', icon: Building2, sub: '32' },
  { id: 'operadores', label: 'Operadores', icon: Users, sub: '5' },
]

export default function Rutas() {
  const [tab, setTab] = useState('zonas')
  const [clientes, setClientes] = useState([])
  const [zonas, setZonas] = useState([])
  const [selectedCliente, setSelectedCliente] = useState(null)

  useEffect(() => {
    rutas.listClientes().then(setClientes)
    rutas.listZonas().then(setZonas)
  }, [])

  const totalClientes = clientes.length
  const totalEquipos = clientes.reduce((s, c) => s + c.equipos, 0)
  const urgentes = clientes.filter(c => c.status_visita === 'urgente').length
  const aceiteCritico = clientes.filter(c => c.aceite_restante_pct < 25).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Clientes activos"
          value={totalClientes}
          sub={`${zonas.length} zonas operativas`}
          accent
        />
        <StatCard
          label="Equipos instalados"
          value={totalEquipos}
          sub="Difusores en campo"
        />
        <StatCard
          label="Visitas urgentes"
          value={urgentes}
          sub="Más de 35 días sin visita"
          danger
        />
        <StatCard
          label="Aceite crítico"
          value={aceiteCritico}
          sub="Menos del 25% restante"
          warn
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

      {tab === 'zonas' && <ZonasTab onClienteClick={setSelectedCliente} />}
      {tab === 'clientes' && <ClientesTab onClienteClick={setSelectedCliente} />}
      {tab === 'operadores' && <OperadoresTab />}

      {selectedCliente && (
        <ClienteDrawer cliente={selectedCliente} onClose={() => setSelectedCliente(null)} />
      )}
    </div>
  )
}
