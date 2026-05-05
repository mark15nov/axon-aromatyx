import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Truck, MapPin, Clock, Receipt, Calculator } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { fmtMoney, fmtNumber } from '@/utils/format'
import { logistica } from '@/services/api'

const TIPOS = [
  { id: 'rabón', label: 'Rabón', desc: 'Hasta 8 ton · ideal CDMX y zona metropolitana', factor: '1.0×' },
  { id: 'tortón', label: 'Tortón', desc: 'Hasta 14 ton · interestatal mediano', factor: '1.7×' },
  { id: 'trailer', label: 'Tráiler', desc: 'Hasta 30 ton · larga distancia', factor: '2.4×' },
]

export function CotizadorTab() {
  const [ciudades, setCiudades] = useState([])
  const [origen, setOrigen] = useState('cdmx')
  const [destino, setDestino] = useState('gdl')
  const [tipo, setTipo] = useState('rabón')
  const [cot, setCot] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { logistica.listCiudades().then(setCiudades) }, [])

  // auto-cotizar cuando cambian campos
  useEffect(() => {
    if (!origen || !destino || origen === destino) { setCot(null); return }
    setLoading(true)
    logistica.cotizar({ origen_id: origen, destino_id: destino, tipo }).then(c => {
      setCot(c)
      setLoading(false)
    })
  }, [origen, destino, tipo])

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Form */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <Panel title="Configurar cotización">
          <div className="space-y-4">
            <div>
              <label className="stat-label block mb-2 flex items-center gap-1.5">
                <MapPin size={10} /> Origen
              </label>
              <select value={origen} onChange={e => setOrigen(e.target.value)} className="input">
                {ciudades.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} · {c.estado}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center -my-2">
              <div className="w-8 h-8 bg-ink-800 border border-ink-700 flex items-center justify-center">
                <ArrowRight size={14} className="text-steel-600 rotate-90" />
              </div>
            </div>

            <div>
              <label className="stat-label block mb-2 flex items-center gap-1.5">
                <MapPin size={10} /> Destino
              </label>
              <select value={destino} onChange={e => setDestino(e.target.value)} className="input">
                {ciudades.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} · {c.estado}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-ink-800 pt-4">
              <label className="stat-label block mb-3 flex items-center gap-1.5">
                <Truck size={10} /> Tipo de unidad
              </label>
              <div className="space-y-2">
                {TIPOS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTipo(t.id)}
                    className={`w-full text-left p-3 border transition-colors ${
                      tipo === t.id
                        ? 'border-steel-600 bg-steel-50'
                        : 'border-ink-700 hover:border-ink-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[12px] uppercase tracking-wider font-medium ${
                        tipo === t.id ? 'text-steel-700' : 'text-ink-100'
                      }`}>
                        {t.label}
                      </span>
                      <span className="font-mono text-[10px] text-ink-500">{t.factor}</span>
                    </div>
                    <div className="text-[11px] text-ink-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Resultado */}
      <div className="col-span-12 lg:col-span-7">
        {origen === destino ? (
          <Panel>
            <div className="py-12 text-center">
              <Calculator size={28} className="text-ink-700 mx-auto mb-3" />
              <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
                Selecciona origen y destino diferentes
              </div>
            </div>
          </Panel>
        ) : !cot ? (
          <Panel>
            <div className="py-12 text-center font-mono text-[10px] text-ink-500 uppercase tracking-wider">
              {loading ? 'Calculando...' : 'Generando cotización...'}
            </div>
          </Panel>
        ) : (
          <div className="space-y-4">
            <div className="panel">
              <div className="px-5 py-4 border-b border-ink-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />
                  <span className="panel-title">Cotización generada</span>
                </div>
                <span className="font-mono text-[10px] text-ink-500">QTE-{Date.now().toString().slice(-6)}</span>
              </div>

              {/* Ruta */}
              <div className="px-5 py-5 border-b border-ink-800">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="stat-label mb-1">Origen</div>
                    <div className="font-display font-semibold text-ink-50">{cot.origen.nombre}</div>
                    <div className="text-[11px] text-ink-400">{cot.origen.estado}</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Truck size={20} className="text-steel-600" />
                    <div className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">{cot.tipo}</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="stat-label mb-1">Destino</div>
                    <div className="font-display font-semibold text-ink-50">{cot.destino.nombre}</div>
                    <div className="text-[11px] text-ink-400">{cot.destino.estado}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 divide-x divide-ink-800 border-t border-ink-800 pt-4">
                  <div className="px-3">
                    <div className="stat-label mb-0.5">Distancia</div>
                    <div className="stat-num text-lg">{fmtNumber(cot.km)} <span className="text-[11px] text-ink-500 font-normal">km</span></div>
                  </div>
                  <div className="px-3">
                    <div className="stat-label mb-0.5 flex items-center gap-1"><Clock size={9} /> Tiempo</div>
                    <div className="stat-num text-lg">{cot.horas_estimadas} <span className="text-[11px] text-ink-500 font-normal">hrs</span></div>
                  </div>
                  <div className="px-3">
                    <div className="stat-label mb-0.5">Días estimados</div>
                    <div className="stat-num text-lg">{cot.dias_estimados} <span className="text-[11px] text-ink-500 font-normal">días</span></div>
                  </div>
                </div>
              </div>

              {/* Desglose */}
              <div className="px-5 py-4 space-y-2">
                <div className="font-mono text-[10px] text-ink-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                  <Receipt size={10} /> Desglose
                </div>
                <DesgloseRow label="Tarifa base" value={fmtMoney(cot.base)} />
                <DesgloseRow label={`Costo por km (${fmtNumber(cot.km)} × ${fmtMoney(cot.tarifa_km)})`} value={fmtMoney(cot.costo_km)} />
                <DesgloseRow label="Peajes y casetas" value={fmtMoney(cot.peajes)} />
                <div className="border-t border-ink-800 pt-2">
                  <DesgloseRow label="Subtotal" value={fmtMoney(cot.subtotal)} />
                  <DesgloseRow label="IVA · 16%" value={fmtMoney(cot.iva)} />
                </div>
              </div>

              {/* Total */}
              <div className="px-5 py-4 bg-steel-50 border-t border-steel-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] text-steel-700 uppercase tracking-[0.2em]">Total</div>
                    <div className="font-display font-bold text-ink-50 text-3xl tabular-nums tracking-tighter">
                      {fmtMoney(cot.total)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost">Guardar</button>
                    <button className="btn-primary">Agendar viaje</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DesgloseRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-ink-300">{label}</span>
      <span className="font-mono text-sm text-ink-100 tabular-nums">{value}</span>
    </div>
  )
}
