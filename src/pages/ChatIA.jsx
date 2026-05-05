import { useEffect, useRef, useState } from 'react'
import {
  Bot, Send, Sparkles, Database, Package, Wallet, MessageSquare,
  Map as MapIcon, Target, User as UserIcon, Loader2,
} from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney, fmtNumber } from '@/utils/format'
import { rawData } from '@/data/mockDb'

const SUGERENCIAS = [
  { texto: '¿Qué aroma tiene menos stock?', icon: Package },
  { texto: '¿Cuánto debe Hotel Camino Real?', icon: Wallet },
  { texto: '¿Cuántos tickets abiertos tengo?', icon: MessageSquare },
  { texto: '¿Qué clientes en Polanco no he visitado?', icon: MapIcon },
  { texto: '¿Cuál es mi pipeline de ventas?', icon: Target },
  { texto: 'Resumen ejecutivo de hoy', icon: Sparkles },
]

const CAPACIDADES = [
  { icon: Package, label: 'Inventarios', desc: '50 aromas + difusores en tiempo real' },
  { icon: Wallet, label: 'Finanzas', desc: 'CxC, CxP, flujo de efectivo, vencimientos' },
  { icon: MessageSquare, label: 'Atención', desc: 'Tickets, SLA, historial de clientes' },
  { icon: MapIcon, label: 'Rutas', desc: 'Clientes, zonas, operadores, visitas' },
  { icon: Target, label: 'Ventas', desc: 'Prospectos, campañas, pipeline' },
  { icon: Database, label: 'Toda la data', desc: 'Cruces entre módulos en una pregunta' },
]

// Motor mock de respuestas contextuales
function generarRespuesta(pregunta) {
  const q = pregunta.toLowerCase()
  const { aromas, cxc, tickets, clientesRutas, prospectos, campanas } = rawData

  // Aroma con menos stock
  if (q.includes('aroma') && (q.includes('menos stock') || q.includes('crítico') || q.includes('bajo'))) {
    const ordenados = [...aromas].sort((a, b) => a.stock_litros - b.stock_litros).slice(0, 5)
    return {
      texto: `Detecté **${aromas.filter(a => a.stock_status === 'critico').length} aromas en estado crítico**. Los 5 con menor stock son:`,
      data: {
        tipo: 'tabla',
        headers: ['Aroma', 'Stock', 'Mínimo', 'Estado'],
        rows: ordenados.map(a => [
          a.nombre,
          `${a.stock_litros.toFixed(2)} L`,
          `${a.stock_minimo} L`,
          a.stock_status === 'critico' ? '🔴 Crítico' : a.stock_status === 'bajo' ? '🟡 Bajo' : '🟢 OK',
        ]),
      },
      sugerencia: 'Sugerencia: generar orden de compra automática desde el módulo de Alertas Tempranas.',
    }
  }

  // Deuda de cliente
  const clienteMatch = cxc.find(c => q.includes(c.cliente.toLowerCase().split(' ')[0]) || q.includes(c.cliente.toLowerCase().split(' ')[1] || ''))
  if (clienteMatch && (q.includes('debe') || q.includes('cuánto') || q.includes('cuanto') || q.includes('factura'))) {
    const facturas = cxc.filter(c => c.cliente === clienteMatch.cliente)
    const total = facturas.reduce((s, c) => s + c.monto_pendiente, 0)
    const vencidas = facturas.filter(c => c.status === 'vencido')
    return {
      texto: `**${clienteMatch.cliente}** tiene un total pendiente de **${fmtMoney(total)}** distribuido en ${facturas.length} factura${facturas.length > 1 ? 's' : ''}${vencidas.length > 0 ? `, de las cuales **${vencidas.length} están vencidas**` : ', todas al corriente'}.`,
      data: facturas.length > 0 ? {
        tipo: 'tabla',
        headers: ['Folio', 'Vencimiento', 'Monto', 'Estado'],
        rows: facturas.map(f => [
          f.folio,
          new Date(f.fecha_vencimiento).toLocaleDateString('es-MX'),
          fmtMoney(f.monto_pendiente),
          f.dias_vencido > 0 ? `🔴 +${f.dias_vencido}d` : '🟢 Al día',
        ]),
      } : null,
      sugerencia: total > 0 ? 'Te sugiero enviar un recordatorio automático de cobranza desde Finanzas.' : null,
    }
  }

  // Tickets abiertos
  if (q.includes('ticket') && (q.includes('abierto') || q.includes('pendiente') || q.includes('cuánto') || q.includes('cuanto') || q.includes('cuántos'))) {
    const abiertos = tickets.filter(t => t.status === 'abierto')
    const enProceso = tickets.filter(t => t.status === 'en_proceso')
    const slaCriticos = tickets.filter(t => (t.status === 'abierto' || t.status === 'en_proceso') && t.horas_abierto > t.sla_horas * 0.8)
    return {
      texto: `Tienes **${abiertos.length} tickets abiertos** y **${enProceso.length} en proceso**. ${slaCriticos.length > 0 ? `⚠️ **${slaCriticos.length} están en riesgo de vencer SLA.**` : 'Todos dentro del SLA.'}`,
      data: {
        tipo: 'tabla',
        headers: ['Folio', 'Cliente', 'Asunto', 'Prioridad'],
        rows: [...abiertos, ...enProceso].slice(0, 5).map(t => [
          t.folio,
          t.cliente.substring(0, 25),
          t.asunto.substring(0, 30) + '...',
          t.prioridad === 'alta' ? '🔴 Alta' : t.prioridad === 'media' ? '🟡 Media' : '⚪ Baja',
        ]),
      },
      sugerencia: slaCriticos.length > 0 ? 'Te sugiero reasignar los tickets críticos a operadores con menor carga.' : null,
    }
  }

  // Clientes en zona
  const zonaMatch = ['polanco', 'roma', 'condesa', 'santa fe', 'centro', 'coyoacán', 'coyoacan', 'satélite', 'satelite', 'aeropuerto', 'sur'].find(z => q.includes(z))
  if (zonaMatch && (q.includes('visit') || q.includes('cliente'))) {
    const zonaId = {
      polanco: 'polanco', roma: 'roma_condesa', condesa: 'roma_condesa',
      'santa fe': 'santa_fe', centro: 'centro', coyoacán: 'coyoacan', coyoacan: 'coyoacan',
      satélite: 'satelite', satelite: 'satelite', aeropuerto: 'aeropuerto', sur: 'sur',
    }[zonaMatch]
    const clientesZona = clientesRutas.filter(c => c.zona_id === zonaId)
    const sinVisita = clientesZona.filter(c => c.dias_ultima_visita > 28)
    return {
      texto: `En **${clientesZona[0]?.zona_nombre || zonaMatch}** tienes ${clientesZona.length} clientes activos. **${sinVisita.length} llevan más de 28 días sin visita** y deberían programarse cuanto antes.`,
      data: sinVisita.length > 0 ? {
        tipo: 'tabla',
        headers: ['Cliente', 'Días sin visita', 'Aceite %', 'Operador'],
        rows: sinVisita.map(c => [
          c.nombre,
          `${c.dias_ultima_visita}d`,
          `${c.aceite_restante_pct}%`,
          c.operador_asignado.split(' ')[0],
        ]),
      } : null,
      sugerencia: sinVisita.length > 0 ? 'Sugerencia: generar ruta de emergencia para esta zona desde el módulo Rutas.' : null,
    }
  }

  // Pipeline de ventas
  if (q.includes('pipeline') || q.includes('venta') || q.includes('prospecto')) {
    const activos = prospectos.filter(p => p.status !== 'descartado' && p.status !== 'cerrado')
    const valor = activos.reduce((s, p) => s + p.valor_estimado, 0)
    const citas = prospectos.filter(p => p.status === 'cita_agendada').length
    const cerrados = prospectos.filter(p => p.status === 'cerrado').length
    return {
      texto: `Tu pipeline activo es de **${fmtMoney(valor)}** distribuido en ${activos.length} prospectos. Tienes **${citas} citas agendadas** y ${cerrados} cierres confirmados este mes.`,
      data: {
        tipo: 'tabla',
        headers: ['Campaña', 'Prospectos', 'Citas', 'Pipeline'],
        rows: campanas.filter(c => c.status === 'activa').map(c => [
          c.nombre.substring(0, 35) + '...',
          String(c.prospectos_total),
          String(c.citas_agendadas),
          fmtMoney(c.valor_pipeline),
        ]),
      },
      sugerencia: 'Las campañas más productivas están en Hotelería. Considera replicar el patrón en sectores afines.',
    }
  }

  // Resumen ejecutivo
  if (q.includes('resumen') || q.includes('ejecutivo') || q.includes('hoy') || q.includes('cómo va') || q.includes('como va')) {
    const aromasCriticos = aromas.filter(a => a.stock_status === 'critico').length
    const cxcVencido = cxc.filter(c => c.status === 'vencido').reduce((s, c) => s + c.monto_pendiente, 0)
    const ticketsAbiertos = tickets.filter(t => t.status === 'abierto').length
    const visitasUrgentes = clientesRutas.filter(c => c.status_visita === 'urgente').length
    const pipelineActivo = prospectos.filter(p => p.status !== 'descartado' && p.status !== 'cerrado').reduce((s, p) => s + p.valor_estimado, 0)
    return {
      texto: `**Resumen ejecutivo · ${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}**`,
      data: {
        tipo: 'resumen',
        items: [
          { label: 'Aromas críticos', valor: aromasCriticos, sub: 'Reorden inmediato', color: aromasCriticos > 0 ? 'red' : 'green' },
          { label: 'CxC vencida', valor: fmtMoney(cxcVencido), sub: `${cxc.filter(c => c.status === 'vencido').length} facturas`, color: cxcVencido > 50000 ? 'red' : 'amber' },
          { label: 'Tickets abiertos', valor: ticketsAbiertos, sub: 'Pendientes de atender', color: ticketsAbiertos > 3 ? 'amber' : 'green' },
          { label: 'Visitas urgentes', valor: visitasUrgentes, sub: '+35 días sin visita', color: visitasUrgentes > 0 ? 'red' : 'green' },
          { label: 'Pipeline activo', valor: fmtMoney(pipelineActivo), sub: `${prospectos.filter(p => p.status !== 'descartado' && p.status !== 'cerrado').length} prospectos`, color: 'steel' },
          { label: 'Operadores activos', valor: rawData.operadores.filter(o => o.activo).length, sub: 'En campo hoy', color: 'green' },
        ],
      },
      sugerencia: 'Lo más urgente hoy: atender los aromas críticos y la cobranza vencida.',
    }
  }

  // Default
  return {
    texto: `Soy el asistente de Aromatyx. Puedo ayudarte con preguntas sobre **inventarios, finanzas, tickets, rutas, clientes y ventas**. Tengo acceso en tiempo real a toda la data del sistema.`,
    data: null,
    sugerencia: 'Prueba alguna de las sugerencias arriba para ver lo que puedo hacer.',
  }
}

export default function ChatIA() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      autor: 'bot',
      texto: '¡Hola! Soy el asistente de Aromatyx. Estoy entrenado con la información de tu negocio en tiempo real. Puedes preguntarme cualquier cosa sobre inventarios, finanzas, clientes, rutas, ventas — o pedirme un resumen ejecutivo.',
      data: null,
      sugerencia: null,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const enviar = async (texto) => {
    const msg = texto || input
    if (!msg.trim()) return
    setInput('')
    setMessages(m => [...m, { id: Date.now(), autor: 'user', texto: msg }])
    setLoading(true)
    setTimeout(() => {
      const respuesta = generarRespuesta(msg)
      setMessages(m => [...m, { id: Date.now() + 1, autor: 'bot', ...respuesta }])
      setLoading(false)
    }, 700 + Math.random() * 600)
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-9rem)]">
      {/* Sidebar capacidades */}
      <aside className="col-span-12 lg:col-span-3 panel flex flex-col">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-steel-600" />
            <span className="panel-title">Capacidades</span>
          </div>
        </div>
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <p className="text-[12px] text-ink-400 leading-relaxed mb-2">
            Tengo acceso en tiempo real a toda la información del sistema:
          </p>
          {CAPACIDADES.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} className="flex items-start gap-3 pb-3 border-b border-ink-800 last:border-0">
                <Icon size={14} className="text-steel-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-ink-100 font-medium">{c.label}</div>
                  <div className="text-[11px] text-ink-500 leading-snug">{c.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="border-t border-ink-800 p-4">
          <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mb-2">Estado del modelo</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full pulse-dot" />
            <span className="text-[12px] text-ink-200">Asistente Aromatyx v1.0</span>
          </div>
          <div className="font-mono text-[10px] text-ink-500 mt-1">Entrenado con tus datos</div>
        </div>
      </aside>

      {/* Chat */}
      <main className="col-span-12 lg:col-span-9 panel flex flex-col">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Bot size={14} className="text-steel-600" />
            <span className="panel-title">Asistente IA · Aromatyx</span>
          </div>
          <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
            {messages.length - 1} mensajes
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map(m => (
            <Mensaje key={m.id} m={m} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-steel-600 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-ink-900 border border-ink-800">
                <Loader2 size={12} className="text-ink-400 animate-spin" />
                <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">Analizando tu data...</span>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="pt-4">
              <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.2em] mb-3">
                Sugerencias para empezar
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGERENCIAS.map(s => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.texto}
                      onClick={() => enviar(s.texto)}
                      className="text-left p-3 border border-ink-800 hover:border-steel-600 hover:bg-ink-900 transition-all flex items-center gap-3"
                    >
                      <Icon size={13} className="text-steel-600 flex-shrink-0" />
                      <span className="text-sm text-ink-200">{s.texto}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-ink-800 p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); enviar() }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pregúntame cualquier cosa sobre tu negocio..."
              className="input flex-1"
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading} className="btn-primary disabled:opacity-50">
              <Send size={11} /> Enviar
            </button>
          </form>
          <div className="font-mono text-[10px] text-ink-500 mt-2 text-center uppercase tracking-wider">
            El asistente accede a información de los 8 módulos en tiempo real
          </div>
        </div>
      </main>
    </div>
  )
}

function Mensaje({ m }) {
  const isBot = m.autor === 'bot'
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
        isBot ? 'bg-steel-600' : 'bg-ink-800 border border-ink-700'
      }`}>
        {isBot ? <Bot size={14} className="text-white" /> : <UserIcon size={14} className="text-ink-300" />}
      </div>
      <div className={`flex-1 max-w-[85%] ${isBot ? '' : 'text-right'}`}>
        <div className={`inline-block text-left p-3.5 ${
          isBot ? 'bg-ink-900 border border-ink-800' : 'bg-steel-50 border border-steel-200'
        }`}>
          <div className="text-sm text-ink-100 leading-relaxed" dangerouslySetInnerHTML={{
            __html: m.texto.replace(/\*\*(.*?)\*\*/g, '<strong class="text-ink-50">$1</strong>'),
          }} />

          {m.data?.tipo === 'tabla' && (
            <div className="mt-3 border border-ink-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-ink-950">
                    {m.data.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-400 border-b border-ink-800">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.data.rows.map((row, i) => (
                    <tr key={i} className="border-b border-ink-800 last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-[12px] text-ink-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {m.data?.tipo === 'resumen' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {m.data.items.map((item, i) => (
                <div key={i} className={`border p-2.5 ${
                  item.color === 'red' ? 'border-signal-alertBorder bg-red-50' :
                  item.color === 'amber' ? 'border-signal-warnBorder bg-amber-50' :
                  item.color === 'green' ? 'border-signal-okBorder bg-green-50' :
                  'border-steel-700/40 bg-steel-50/60'
                }`}>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-ink-400 mb-0.5">{item.label}</div>
                  <div className={`font-mono font-bold text-base tabular-nums ${
                    item.color === 'red' ? 'text-signal-alert' :
                    item.color === 'amber' ? 'text-signal-warn' :
                    item.color === 'green' ? 'text-signal-ok' :
                    'text-steel-700'
                  }`}>{item.valor}</div>
                  <div className="font-mono text-[9px] text-ink-500 mt-0.5">{item.sub}</div>
                </div>
              ))}
            </div>
          )}

          {m.sugerencia && (
            <div className="mt-3 pt-3 border-t border-ink-800 flex items-start gap-2">
              <Sparkles size={11} className="text-steel-600 mt-0.5 flex-shrink-0" />
              <div className="text-[12px] text-ink-300 italic leading-relaxed">{m.sugerencia}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
