import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Circle } from 'react-leaflet'
import { rutas } from '@/services/api'

const ICON_BY_STATUS = {
  urgente: { fill: '#b91c1c', stroke: '#7f1d1d' },
  pendiente: { fill: '#b45309', stroke: '#78350f' },
  al_dia: { fill: '#15803d', stroke: '#14532d' },
}

export function MapaZonas({ filtroZona, onClienteClick, mostrarRutas = true }) {
  const [clientes, setClientes] = useState([])
  const [zonas, setZonas] = useState([])

  useEffect(() => {
    rutas.listClientes().then(setClientes)
    rutas.listZonas().then(setZonas)
  }, [])

  const clientesFiltrados = filtroZona === 'todas' || !filtroZona
    ? clientes
    : clientes.filter(c => c.zona_id === filtroZona)

  // Centroide aproximado para CDMX
  const center = [19.4326, -99.1332]

  // Construir poligonales dentro de cada zona (orden simple por proximidad al centro de zona)
  const rutasPorZona = mostrarRutas ? zonas.map(z => {
    const pts = clientesFiltrados
      .filter(c => c.zona_id === z.id)
      .map(c => [c.lat, c.lng])
    return { id: z.id, color: z.color, points: pts }
  }) : []

  return (
    <div className="h-[600px] w-full bg-ink-950 border border-ink-800 relative overflow-hidden">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Áreas de zona (círculos translúcidos) */}
        {zonas.map(z => (
          <Circle
            key={`zone-${z.id}`}
            center={[z.lat, z.lng]}
            radius={2200}
            pathOptions={{
              color: z.color,
              fillColor: z.color,
              fillOpacity: 0.05,
              opacity: 0.4,
              weight: 1,
              dashArray: '4 4',
            }}
          />
        ))}

        {/* Líneas de ruta entre clientes de la misma zona */}
        {rutasPorZona.map(r => r.points.length > 1 && (
          <Polyline
            key={`ruta-${r.id}`}
            positions={r.points}
            pathOptions={{ color: r.color, weight: 2, opacity: 0.5, dashArray: '6 4' }}
          />
        ))}

        {/* Marcadores de clientes */}
        {clientesFiltrados.map(c => {
          const cfg = ICON_BY_STATUS[c.status_visita]
          return (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={7}
              pathOptions={{
                fillColor: cfg.fill,
                color: cfg.stroke,
                weight: 2,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onClienteClick && onClienteClick(c),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontSize: 9, color: '#7a6f63', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
                    {c.codigo} · {c.zona_nombre}
                  </div>
                  <div style={{ fontWeight: 600, color: '#1a1410', marginBottom: 6, fontSize: 13 }}>
                    {c.nombre}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#574c41' }}>
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
                      <div style={{ color: c.aceite_restante_pct < 20 ? '#b91c1c' : '#1a1410', fontWeight: 500 }}>{c.aceite_restante_pct}%</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #ebe4d8', marginTop: 8, paddingTop: 6, fontSize: 10, color: '#7a6f63', fontFamily: 'DM Mono, monospace' }}>
                    Operador: {c.operador_asignado}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Leyenda flotante */}
      <div className="absolute top-4 right-4 bg-ink-900/95 backdrop-blur border border-ink-800 rounded-2xl px-4 py-3 z-[400] shadow-lift">
        <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-[0.2em] mb-2">Estado de visita</div>
        <div className="space-y-1.5">
          {[
            { color: '#b91c1c', label: 'Urgente · +35d' },
            { color: '#b45309', label: 'Pendiente · 28-35d' },
            { color: '#15803d', label: 'Al día · <28d' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-[11px] text-ink-200">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
