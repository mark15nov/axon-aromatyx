import { useEffect, useMemo, useState } from 'react'
import { Map, Users, Building2, Sparkles, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { rutas } from '@/services/api'
import { ZonasTab } from '@/modules/rutas/ZonasTab'
import { OperadoresTab } from '@/modules/rutas/OperadoresTab'
import { ClientesTab } from '@/modules/rutas/ClientesTab'
import { ClienteDrawer } from '@/modules/rutas/ClienteDrawer'
import { RutasInteligentesTab } from '@/modules/rutas/RutasInteligentesTab'
import { IncidentesTab } from '@/modules/rutas/IncidentesTab'

export default function Rutas() {
  const [tab, setTab] = useState('inteligentes')
  const [clientes, setClientes] = useState([])
  const [zonas, setZonas] = useState([])
  const [incidentesAbiertos, setIncidentesAbiertos] = useState(0)
  const [selectedCliente, setSelectedCliente] = useState(null)

  useEffect(() => {
    rutas.listClientes().then(setClientes)
    rutas.listZonas().then(setZonas)
    rutas.listIncidentes().then(list => setIncidentesAbiertos(list.filter(i => !i.resuelto).length))
  }, [])

  const totalClientes  = clientes.length
  const totalEquipos   = clientes.reduce((s, c) => s + c.equipos, 0)
  const urgentes       = clientes.filter(c => c.status_visita === 'urgente').length
  const aceiteCritico  = clientes.filter(c => c.aceite_restante_pct < 25).length
  const ciudadesActivas = useMemo(
    () => [...new Set(clientes.map(c => c.ciudad).filter(Boolean))].length,
    [clientes],
  )
  const promedioPrioridad = clientes.length
    ? Math.round(clientes.reduce((s, c) => s + (c.prioridad_score || 0), 0) / clientes.length)
    : 0

  const TABS = [
    { id: 'inteligentes', label: 'Rutas inteligentes', icon: Sparkles,      sub: 'IA' },
    { id: 'zonas',        label: 'Zonas + Mapa',       icon: Map,           sub: zonas.length || '—' },
    { id: 'clientes',     label: 'Clientes',           icon: Building2,     sub: totalClientes || '—' },
    { id: 'operadores',   label: 'Operadores',         icon: Users,         sub: 5 },
    { id: 'incidentes',   label: 'Incidentes',         icon: AlertTriangle, sub: incidentesAbiertos || '—', tone: incidentesAbiertos > 0 ? 'alert' : null },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Clientes activos"
          value={totalClientes}
          sub={`${zonas.length} zonas · ${ciudadesActivas} ciudades`}
          accent
          icon={Building2}
        />
        <StatCard
          label="Equipos instalados"
          value={totalEquipos}
          sub="Difusores en campo"
        />
        <StatCard
          label="Visitas urgentes"
          value={urgentes}
          sub="+35 días sin visita"
          danger
        />
        <StatCard
          label="Aceite crítico"
          value={aceiteCritico}
          sub="Menos del 25% restante"
          warn
        />
        <StatCard
          label="Prioridad promedio"
          value={promedioPrioridad}
          sub="Score 0-100"
          accent={promedioPrioridad >= 50}
        />
        <StatCard
          label="Incidentes"
          value={incidentesAbiertos}
          sub={incidentesAbiertos > 0 ? 'Abiertos · re-rutear' : 'Todo bajo control'}
          danger={incidentesAbiertos > 0}
        />
      </div>

      <div className="border-b border-ink-800 flex items-end gap-0 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors -mb-px whitespace-nowrap ${
                active ? 'border-steel-600 text-ink-50' : 'border-transparent text-ink-400 hover:text-ink-100'
              }`}
            >
              <Icon size={14} />
              <span className="font-medium text-sm">{t.label}</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                t.tone === 'alert'
                  ? 'bg-signal-alertBg text-signal-alert border border-signal-alertBorder'
                  : active
                    ? 'bg-steel-100 text-steel-700'
                    : 'bg-ink-850 text-ink-400'
              }`}>
                {t.sub}
              </span>
            </button>
          )
        })}
      </div>

      {tab === 'inteligentes' && <RutasInteligentesTab onClienteClick={setSelectedCliente} />}
      {tab === 'zonas'        && <ZonasTab onClienteClick={setSelectedCliente} />}
      {tab === 'clientes'     && <ClientesTab onClienteClick={setSelectedCliente} />}
      {tab === 'operadores'   && <OperadoresTab />}
      {tab === 'incidentes'   && <IncidentesTab />}

      {selectedCliente && (
        <ClienteDrawer cliente={selectedCliente} onClose={() => setSelectedCliente(null)} />
      )}
    </div>
  )
}
