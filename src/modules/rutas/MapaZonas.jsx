import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Circle, Marker } from 'react-leaflet'
import L from 'leaflet'
import { rutas } from '@/services/api'

// ─── helpers ───
const COLOR_BY_STATUS = {
  urgente:   { fill: '#b91c1c', stroke: '#7f1d1d' },
  pendiente: { fill: '#b45309', stroke: '#78350f' },
  al_dia:    { fill: '#15803d', stroke: '#14532d' },
}

const COLOR_BY_ACEITE = (pct) => {
  if (pct < 25) return { fill: '#b91c1c', stroke: '#7f1d1d' }
  if (pct < 50) return { fill: '#b45309', stroke: '#78350f' }
  return { fill: '#15803d', stroke: '#14532d' }
}

// Marker numerado para modo ruta
const numberedIcon = (n, color) => L.divIcon({
  className: '',
  html: `<div style="
    width: 30px; height: 30px;
    background: ${color}; color: #ffffff;
    border: 2.5px solid #ffffff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 14px rgba(58,49,40,0.25);
  ">${n}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

const VISTAS = [
  { id: 'cdmx', label: 'CDMX', desc: 'Detalle metro' },
  { id: 'nacional', label: 'Nacional', desc: 'Todas las ciudades' },
]

const MODOS = [
  { id: 'zona',     label: 'Por zona',          desc: 'Color de zona' },
  { id: 'urgencia', label: 'Por aceite',        desc: 'Heatmap urgencia' },
  { id: 'ruta',     label: 'Ruta sugerida',     desc: 'Orden óptimo' },
]

export function MapaZonas({ filtroZona = 'todas', onClienteClick, mostrarRutas = true }) {
  const [clientes, setClientes] = useState([])
  const [zonas, setZonas] = useState([])
  const [vista, setVista] = useState('cdmx')
  const [modo, setModo] = useState('zona')
  const [rutaSugerida, setRutaSugerida] = useState(null)
  const [loadingRuta, setLoadingRuta] = useState(false)

  useEffect(() => {
    rutas.listClientes().then(setClientes)
    rutas.listZonas().then(setZonas)
  }, [])

  // Cuando se selecciona una zona en modo ruta, calcular ruta óptima
  useEffect(() => {
    if (modo !== 'ruta' || filtroZona === 'todas' || !filtroZona) {
      setRutaSugerida(null)
      return
    }
    setLoadingRuta(true)
    rutas.optimizar(filtroZona).then(r => {
      setRutaSugerida(r)
      setLoadingRuta(false)
    })
  }, [modo, filtroZona])

  const clientesFiltrados = useMemo(() => {
    let cs = clientes
    if (filtroZona !== 'todas' && filtroZona) {
      cs = cs.filter(c => c.zona_id === filtroZona)
    }
    if (vista === 'cdmx') {
      cs = cs.filter(c => !c.zona_foranea)
    } else {
      // vista nacional: muestra todos
    }
    return cs
  }, [clientes, filtroZona, vista])

  const zonasVisibles = useMemo(() => {
    if (vista === 'cdmx') return zonas.filter(z => !z.foranea)
    return zonas
  }, [zonas, vista])

  // Centro y zoom según vista
  const center = vista === 'cdmx' ? [19.4326, -99.1332] : [22.5, -100]
  const zoom   = vista === 'cdmx' ? 11 : 5

  // Polilíneas (orden por nearest neighbor en modo ruta, simples conectores en modo zona)
  const polylines = useMemo(() => {
    if (modo === 'ruta' && rutaSugerida) {
      const zona = rutaSugerida.zona
      const points = [
        [zona.lat, zona.lng], // origen
        ...rutaSugerida.clientes.map(c => [c.lat, c.lng]),
        [zona.lat, zona.lng], // regreso
      ]
      return [{ id: 'ruta', color: zona.color, points, weight: 3, opacity: 0.7, dashArray: null }]
    }
    if (!mostrarRutas) return []
    return zonasVisibles.map(z => {
      const pts = clientesFiltrados.filter(c => c.zona_id === z.id).map(c => [c.lat, c.lng])
      return { id: z.id, color: z.color, points: pts, weight: 1.5, opacity: 0.4, dashArray: '4 4' }
    })
  }, [modo, rutaSugerida, mostrarRutas, zonasVisibles, clientesFiltrados])

  return (
    <div className="relative">
      {/* Toolbar superior */}
      <div className="flex items-center gap-2 flex-wrap mb-3 px-1">
        <div className="inline-flex bg-ink-900 border border-ink-800 rounded-full p-0.5">
          {VISTAS.map(v => (
            <button
              key={v.id}
              onClick={() => setVista(v.id)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                vista === v.id ? 'bg-steel-600 text-white' : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="inline-flex bg-ink-900 border border-ink-800 rounded-full p-0.5">
          {MODOS.map(m => (
            <button
              key={m.id}
              onClick={() => setModo(m.id)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                modo === m.id ? 'bg-steel-600 text-white' : 'text-ink-300 hover:text-ink-100'
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>
        {modo === 'ruta' && filtroZona === 'todas' && (
          <span className="font-mono text-[10.5px] text-signal-warn ml-2">
            Selecciona una zona específica para ver la ruta
          </span>
        )}
        {modo === 'ruta' && rutaSugerida && (
          <span className="font-mono text-[10.5px] text-ink-400 ml-2">
            {rutaSugerida.total_clientes} paradas · {rutaSugerida.km_total.toFixed(1)} km · ~{rutaSugerida.tiempo_total_horas}h
          </span>
        )}
      </div>

      {/* Map */}
      <div className="h-[600px] w-full bg-ink-900 border border-ink-800 rounded-2xl relative overflow-hidden">
        <MapContainer
          key={`${vista}-${center.join(',')}`}
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Áreas de zona */}
          {zonasVisibles.map(z => (
            <Circle
              key={`zone-${z.id}`}
              center={[z.lat, z.lng]}
              radius={vista === 'cdmx' ? 2200 : 12000}
              pathOptions={{
                color: z.color,
                fillColor: z.color,
                fillOpacity: 0.06,
                opacity: 0.4,
                weight: 1,
                dashArray: '4 4',
              }}
            />
          ))}

          {/* Polilíneas (zona o ruta optimizada) */}
          {polylines.map(p => p.points.length > 1 && (
            <Polyline
              key={`poly-${p.id}`}
              positions={p.points}
              pathOptions={{ color: p.color, weight: p.weight, opacity: p.opacity, dashArray: p.dashArray }}
            />
          ))}

          {/* Markers */}
          {modo === 'ruta' && rutaSugerida ? (
            // Modo ruta — markers numerados con ORDEN
            rutaSugerida.clientes.map(c => (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={numberedIcon(c.orden, rutaSugerida.zona.color)}
                eventHandlers={{ click: () => onClienteClick && onClienteClick(c) }}
              >
                <Popup>
                  <PopupCliente c={c} extra={`Parada ${c.orden} · ${c.km_desde_anterior} km del anterior`} />
                </Popup>
              </Marker>
            ))
          ) : (
            // Modo zona / urgencia — círculos coloreados
            clientesFiltrados.map(c => {
              const cfg = modo === 'urgencia'
                ? COLOR_BY_ACEITE(c.aceite_restante_pct)
                : COLOR_BY_STATUS[c.status_visita] || COLOR_BY_STATUS.al_dia
              const radio = modo === 'urgencia'
                ? 6 + (100 - c.aceite_restante_pct) / 10  // tamaño según urgencia
                : 7
              return (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={radio}
                  pathOptions={{
                    fillColor: cfg.fill,
                    color: cfg.stroke,
                    weight: 2,
                    fillOpacity: 0.9,
                  }}
                  eventHandlers={{ click: () => onClienteClick && onClienteClick(c) }}
                >
                  <Popup>
                    <PopupCliente c={c} />
                  </Popup>
                </CircleMarker>
              )
            })
          )}
        </MapContainer>

        {/* Leyenda flotante */}
        <div className="absolute top-4 right-4 bg-ink-900/95 backdrop-blur border border-ink-800 rounded-2xl px-4 py-3 z-[400] shadow-lift max-w-[220px]">
          <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-[0.18em] mb-2">
            {modo === 'urgencia' ? 'Aceite restante' : modo === 'ruta' ? 'Orden de visita' : 'Estado'}
          </div>
          {modo === 'urgencia' && (
            <div className="space-y-1.5">
              <Lyd color="#b91c1c" label="Crítico · <25%" />
              <Lyd color="#b45309" label="Bajo · 25-50%" />
              <Lyd color="#15803d" label="OK · >50%" />
              <div className="text-[10px] text-ink-400 mt-2 pt-2 border-t border-ink-800">
                Tamaño = urgencia
              </div>
            </div>
          )}
          {modo === 'zona' && (
            <div className="space-y-1.5">
              <Lyd color="#b91c1c" label="Urgente · +35d" />
              <Lyd color="#b45309" label="Pendiente · 28-35d" />
              <Lyd color="#15803d" label="Al día · <28d" />
            </div>
          )}
          {modo === 'ruta' && rutaSugerida && (
            <div className="text-[11px] text-ink-200 leading-relaxed">
              Marker numerado <strong className="text-ink-50">1 → {rutaSugerida.total_clientes}</strong> en orden óptimo.
              <br />
              Línea de regreso a base.
            </div>
          )}
          {modo === 'ruta' && !rutaSugerida && !loadingRuta && (
            <div className="text-[11px] text-ink-400">
              Selecciona una zona para ver el orden sugerido.
            </div>
          )}
          {loadingRuta && (
            <div className="text-[11px] text-ink-400">Optimizando…</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Lyd({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-ink-200">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  )
}

function PopupCliente({ c, extra }) {
  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ fontSize: 9, color: '#7a6f63', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
        {c.codigo} · {c.zona_nombre}
      </div>
      <div style={{ fontWeight: 600, color: '#1a1410', marginBottom: 6, fontSize: 13 }}>
        {c.nombre}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#574c41', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#7a6f63', fontFamily: 'DM Mono, monospace' }}>Equipos</div>
          <div style={{ color: '#1a1410', fontWeight: 500 }}>{c.equipos}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#7a6f63', fontFamily: 'DM Mono, monospace' }}>Última visita</div>
          <div style={{ color: '#1a1410', fontWeight: 500 }}>{c.dias_ultima_visita}d</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#7a6f63', fontFamily: 'DM Mono, monospace' }}>Aceite</div>
          <div style={{ color: c.aceite_restante_pct < 25 ? '#b91c1c' : '#1a1410', fontWeight: 500 }}>{c.aceite_restante_pct}%</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#7a6f63', fontFamily: 'DM Mono, monospace' }}>Prioridad</div>
          <div style={{ color: c.prioridad_score >= 70 ? '#b91c1c' : c.prioridad_score >= 40 ? '#b45309' : '#1a1410', fontWeight: 500 }}>{c.prioridad_score}</div>
        </div>
      </div>
      {extra && (
        <div style={{ borderTop: '1px solid #ebe4d8', marginTop: 8, paddingTop: 6, fontSize: 10, color: '#c2592b', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
          {extra}
        </div>
      )}
      <div style={{ borderTop: '1px solid #ebe4d8', marginTop: 8, paddingTop: 6, fontSize: 10, color: '#7a6f63', fontFamily: 'DM Mono, monospace' }}>
        Operador: {c.operador_asignado}
      </div>
    </div>
  )
}
