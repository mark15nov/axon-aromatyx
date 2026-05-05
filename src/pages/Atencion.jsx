import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List, Search, Globe, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel } from '@/components/Panel'
import { StatCard } from '@/components/StatCard'
import { tickets as ticketsApi } from '@/services/api'
import { KanbanView } from '@/modules/atencion/KanbanView'
import { ListaView } from '@/modules/atencion/ListaView'
import { TicketDrawer } from '@/modules/atencion/TicketDrawer'

export default function Atencion() {
  const [tickets, setTickets] = useState([])
  const [view, setView] = useState('kanban')
  const [q, setQ] = useState('')
  const [filterPrio, setFilterPrio] = useState('todos')
  const [filterCanal, setFilterCanal] = useState('todos')
  const [selected, setSelected] = useState(null)

  const refresh = () => ticketsApi.list().then(setTickets)
  useEffect(() => { refresh() }, [])

  const kpis = useMemo(() => {
    const abiertos = tickets.filter(t => t.status === 'abierto').length
    const enProceso = tickets.filter(t => t.status === 'en_proceso').length
    const slaCriticos = tickets.filter(t =>
      (t.status === 'abierto' || t.status === 'en_proceso') && t.horas_abierto > t.sla_horas * 0.8
    ).length
    const desdePortal = tickets.filter(t => t.canal === 'web_publico').length
    return { abiertos, enProceso, slaCriticos, desdePortal }
  }, [tickets])

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const mq = !q || t.asunto.toLowerCase().includes(q.toLowerCase())
        || t.cliente.toLowerCase().includes(q.toLowerCase())
        || t.folio.toLowerCase().includes(q.toLowerCase())
      const mp = filterPrio === 'todos' || t.prioridad === filterPrio
      const mc = filterCanal === 'todos' || t.canal === filterCanal
      return mq && mp && mc
    })
  }, [tickets, q, filterPrio, filterCanal])

  const onTicketUpdate = (updated) => {
    setTickets(ts => ts.map(t => t.id === updated.id ? updated : t))
    setSelected(updated)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Abiertos" value={kpis.abiertos} sub="Sin atender" danger />
        <StatCard label="En proceso" value={kpis.enProceso} sub="Siendo atendidos" warn />
        <StatCard label="SLA crítico" value={kpis.slaCriticos} sub="≥80% del tiempo" danger />
        <StatCard label="Portal público" value={kpis.desdePortal} sub="Vía /reportar" accent />
      </div>

      {/* Banner portal público */}
      <div className="panel relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-steel-900/30 to-transparent pointer-events-none" />
        <div className="px-5 py-4 flex items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-steel-50 border border-steel-200 flex items-center justify-center">
              <Globe size={16} className="text-steel-700" />
            </div>
            <div>
              <div className="font-display font-semibold text-ink-50">Portal público de soporte</div>
              <div className="text-xs text-ink-400">
                Tus clientes reportan problemas en{' '}
                <span className="font-mono text-steel-700">aromatyx.com/reportar</span>
              </div>
            </div>
          </div>
          <Link to="/reportar" target="_blank" className="btn-ghost">
            <ExternalLink size={11} />
            Abrir portal
          </Link>
        </div>
      </div>

      {/* Filtros + view toggle */}
      <Panel tight>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-900 border border-ink-800 rounded-full flex-1 min-w-[180px] focus-within:border-steel-400 focus-within:shadow-focus transition-all">
            <Search size={13} className="text-ink-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por asunto, cliente, folio..."
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-ink-500 text-ink-200"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mr-1">Prio:</span>
            {[
              { v: 'todos', l: 'Todos' },
              { v: 'alta', l: 'Alta' },
              { v: 'media', l: 'Media' },
              { v: 'baja', l: 'Baja' },
            ].map(p => (
              <button
                key={p.v}
                onClick={() => setFilterPrio(p.v)}
                className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  filterPrio === p.v
                    ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                    : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mr-1">Canal:</span>
            {[
              { v: 'todos', l: 'Todos' },
              { v: 'web_publico', l: 'Web' },
              { v: 'whatsapp', l: 'WhatsApp' },
              { v: 'email', l: 'Email' },
            ].map(c => (
              <button
                key={c.v}
                onClick={() => setFilterCanal(c.v)}
                className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  filterCanal === c.v
                    ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                    : 'border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-600'
                }`}
              >
                {c.l}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-ink-700" />
          <div className="flex items-center bg-ink-950 border border-ink-700">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 transition-colors ${view === 'kanban' ? 'bg-steel-600 text-white' : 'text-ink-400 hover:text-ink-100'}`}
              title="Vista kanban"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setView('lista')}
              className={`p-1.5 transition-colors ${view === 'lista' ? 'bg-steel-600 text-white' : 'text-ink-400 hover:text-ink-100'}`}
              title="Vista lista"
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </Panel>

      {view === 'kanban' ? (
        <KanbanView tickets={filtered} onSelect={setSelected} selectedId={selected?.id} />
      ) : (
        <ListaView tickets={filtered} onSelect={setSelected} selectedId={selected?.id} />
      )}

      {selected && (
        <TicketDrawer
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdate={onTicketUpdate}
        />
      )}
    </div>
  )
}
