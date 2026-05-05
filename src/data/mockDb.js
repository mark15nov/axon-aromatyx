/**
 * MOCK DATABASE
 * Datos semilla realistas para Aromatyx.
 * Estructura idéntica a la que tendrá la API real.
 */

// ─────────── 50 AROMAS ───────────
const NOMBRES_AROMAS = [
  'Vainilla Bourbon', 'Sándalo Mysore', 'Madera de Cedro', 'Lavanda Provenza',
  'Bergamota Cítrica', 'Té Verde Matcha', 'Jazmín Nocturno', 'Ámbar Negro',
  'Pino Alpino', 'Eucalipto Fresco', 'Menta Glacial', 'Canela Ceylán',
  'Coco Tropical', 'Limón Siciliano', 'Naranja Valenciana', 'Mandarina Roja',
  'Café Espresso', 'Chocolate Belga', 'Cuero Italiano', 'Tabaco Cubano',
  'Whisky Ahumado', 'Roble Antiguo', 'Pachulí Indio', 'Incienso Sagrado',
  'Mirra Egipcia', 'Rosa Damascena', 'Peonía Blanca', 'Magnolia Sureña',
  'Gardenia Real', 'Tuberosa Mexicana', 'Higo Mediterráneo', 'Manzana Verde',
  'Pera Williams', 'Frambuesa Negra', 'Granada Persa', 'Mango Tropical',
  'Lichi Asiático', 'Pomelo Rosa', 'Yuzu Japonés', 'Verbena Limón',
  'Romero Toscano', 'Albahaca Genovesa', 'Tomillo Silvestre', 'Salvia Blanca',
  'Mar Salado', 'Brisa Costera', 'Lluvia de Tormenta', 'Algodón Limpio',
  'Lino Fresco', 'Talco de Bebé',
]

const aromas = NOMBRES_AROMAS.map((nombre, i) => {
  const codigo = `AR-${String(i + 1).padStart(3, '0')}`
  const stockL = +(Math.random() * 80 + 5).toFixed(2)
  const minimo = 15
  const stockStatus = stockL < minimo * 0.5 ? 'critico' : stockL < minimo ? 'bajo' : 'ok'
  const costo = Math.round(Math.random() * 1200 + 400)
  // Margen entre 45% y 75% sobre el costo (precio = costo * factor)
  const factor = 1.45 + Math.random() * 0.3
  return {
    id: i + 1,
    codigo,
    nombre,
    familia: ['Floral', 'Cítrica', 'Amaderada', 'Especiada', 'Frutal', 'Herbal', 'Acuática', 'Dulce'][i % 8],
    stock_litros: stockL,
    stock_minimo: minimo,
    stock_status: stockStatus,
    costo_por_litro: costo,
    precio_venta_litro: Math.round(costo * factor),
    ultimo_movimiento: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
  }
})

// ─────────── DIFUSORES ───────────
const difusores = [
  {
    id: 1, codigo: 'DIF-G', nombre: 'Difusor Grande', tipo: 'grande',
    stock: 142, stock_minimo: 50, costo: 1850, precio: 4200,
    cobertura_m2: 250, descripcion: 'Para espacios comerciales 100-250m²',
  },
  {
    id: 2, codigo: 'DIF-C', nombre: 'Difusor Chico', tipo: 'chico',
    stock: 87, stock_minimo: 40, costo: 950, precio: 2200,
    cobertura_m2: 80, descripcion: 'Para oficinas y espacios 30-80m²',
  },
]

// ─────────── MOVIMIENTOS (FIFO) ───────────
//
// FIFO real: cada `entrada` crea un lote con su costo unitario y va llevando
// `cantidad_consumida` que aumenta cuando una `salida` la consume. Cada `salida`
// guarda los `lotes_consumidos` con la cantidad y costo unitario tomados de cada
// lote, así sabemos costo real, utilidad y margen del movimiento.
const motivosEntrada = ['Compra proveedor', 'Devolución cliente', 'Ajuste inventario', 'Producción interna']
const motivosSalida  = ['Venta cliente', 'Muestra comercial', 'Mantenimiento ruta', 'Merma']
const PROVEEDORES_INV = ['Aromas Globales SA', 'Essential Oils MX', 'Fragrance House', 'Mendoza Aromáticos', 'BioEsencias del Norte']
const CLIENTES_INV    = ['Hotel Camino Real', 'Cinépolis Polanco', 'Liverpool Insurgentes', 'Grupo Posadas', 'Sanborns SA', 'BBVA México', 'Hospital Ángeles']
const OPERADORES_INV  = ['Mario Sánchez', 'Luis Gómez', 'Carlos Pérez', 'Diego Hernández']

let _movId = 0
let _folioSeq = 2024000
const newMov = () => ({ id: ++_movId, folio: `MOV-${String(++_folioSeq).padStart(7, '0')}` })

// Genera secuencia cronológica de movimientos por item respetando que stock nunca quede negativo.
function buildMovimientosFIFO() {
  const movs = []
  const items = [
    ...aromas.map(a => ({ ...a, item_tipo: 'aroma', unidad: 'L' })),
    ...difusores.map(d => ({ ...d, item_tipo: 'difusor', unidad: 'pza' })),
  ]

  // Para cada item: 2-4 entradas históricas y 3-7 salidas que consumen vía FIFO
  items.forEach(item => {
    const entradasItem = []
    const numEntradas = Math.floor(Math.random() * 3) + 2 // 2-4
    const baseCost = item.item_tipo === 'aroma' ? item.costo_por_litro : item.costo
    const basePrice = item.item_tipo === 'aroma' ? item.precio_venta_litro : item.precio
    const isAroma = item.item_tipo === 'aroma'

    for (let i = 0; i < numEntradas; i++) {
      const daysAgo = (numEntradas - i) * 8 + Math.floor(Math.random() * 5)
      // Costo varía ±15% entre lotes (inflación / negociación)
      const costoUnitario = Math.round(baseCost * (0.85 + Math.random() * 0.3))
      const cantidad = isAroma
        ? +(Math.random() * 25 + 15).toFixed(2)
        : Math.floor(Math.random() * 50 + 30)
      const m = newMov()
      const entrada = {
        ...m,
        tipo: 'entrada',
        fecha: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000).toISOString(),
        item_tipo: item.item_tipo,
        item_id: item.id,
        item_nombre: item.nombre,
        item_codigo: item.codigo,
        cantidad,
        unidad: item.unidad,
        costo_unitario: costoUnitario,
        costo_total: +(cantidad * costoUnitario).toFixed(2),
        cantidad_consumida: 0,
        proveedor: PROVEEDORES_INV[Math.floor(Math.random() * PROVEEDORES_INV.length)],
        motivo: motivosEntrada[Math.floor(Math.random() * 3)], // evita "Producción interna" que no tiene proveedor
        referencia: `OC-${1000 + m.id}`,
        operador: OPERADORES_INV[Math.floor(Math.random() * 4)],
      }
      entradasItem.push(entrada)
      movs.push(entrada)
    }

    // Salidas que consumen lotes FIFO
    const numSalidas = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < numSalidas; i++) {
      const minDaysAgo = Math.max(0, (numEntradas - 1) * 8 - i * 5)
      const daysAgo = Math.max(0, minDaysAgo - Math.floor(Math.random() * 6))
      const cantidadDeseada = isAroma
        ? +(Math.random() * 8 + 1).toFixed(2)
        : Math.floor(Math.random() * 8 + 1)

      // Calcular cuánto stock está disponible cronológicamente hasta esta fecha
      const cutoff = Date.now() - daysAgo * 86400000
      const lotesDisponibles = entradasItem
        .filter(e => new Date(e.fecha).getTime() <= cutoff)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      const disponible = lotesDisponibles.reduce((s, e) => s + (e.cantidad - e.cantidad_consumida), 0)
      if (disponible < 0.01) continue

      const cantidadSalida = isAroma
        ? +Math.min(cantidadDeseada, disponible).toFixed(2)
        : Math.min(cantidadDeseada, Math.floor(disponible))
      if (cantidadSalida <= 0) continue

      // Consumir lotes FIFO
      let restante = cantidadSalida
      const lotesConsumidos = []
      for (const lote of lotesDisponibles) {
        if (restante <= 0.0001) break
        const dispLote = lote.cantidad - lote.cantidad_consumida
        if (dispLote <= 0) continue
        const tomar = isAroma ? Math.min(dispLote, restante) : Math.min(dispLote, restante)
        const tomarRedondeado = isAroma ? +tomar.toFixed(2) : Math.floor(tomar)
        if (tomarRedondeado <= 0) continue
        lote.cantidad_consumida = +(lote.cantidad_consumida + tomarRedondeado).toFixed(2)
        lotesConsumidos.push({
          entrada_id: lote.id,
          entrada_folio: lote.folio,
          fecha_entrada: lote.fecha,
          cantidad: tomarRedondeado,
          costo_unitario: lote.costo_unitario,
          subtotal: +(tomarRedondeado * lote.costo_unitario).toFixed(2),
        })
        restante = +(restante - tomarRedondeado).toFixed(2)
      }
      if (lotesConsumidos.length === 0) continue

      const costoTotal = +lotesConsumidos.reduce((s, l) => s + l.subtotal, 0).toFixed(2)
      const cantReal = +lotesConsumidos.reduce((s, l) => s + l.cantidad, 0).toFixed(2)
      // Precio de venta varía ±10% entre salidas
      const precioUnitario = Math.round(basePrice * (0.92 + Math.random() * 0.16))
      const precioTotal = +(cantReal * precioUnitario).toFixed(2)
      const utilidad = +(precioTotal - costoTotal).toFixed(2)
      const margenPct = precioTotal > 0 ? +((utilidad / precioTotal) * 100).toFixed(1) : 0
      const motivo = motivosSalida[Math.floor(Math.random() * motivosSalida.length)]
      const esVenta = motivo === 'Venta cliente'

      const m = newMov()
      movs.push({
        ...m,
        tipo: 'salida',
        fecha: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000).toISOString(),
        item_tipo: item.item_tipo,
        item_id: item.id,
        item_nombre: item.nombre,
        item_codigo: item.codigo,
        cantidad: cantReal,
        unidad: item.unidad,
        precio_unitario: esVenta ? precioUnitario : 0,
        precio_total: esVenta ? precioTotal : 0,
        costo_total: costoTotal,
        costo_promedio: +(costoTotal / cantReal).toFixed(2),
        utilidad: esVenta ? utilidad : -costoTotal, // muestra/merma = pérdida del costo
        margen_pct: esVenta ? margenPct : null,
        lotes_consumidos: lotesConsumidos,
        cliente: esVenta ? CLIENTES_INV[Math.floor(Math.random() * CLIENTES_INV.length)] : null,
        motivo,
        referencia: esVenta ? `OV-${2000 + m.id}` : `${motivo === 'Merma' ? 'MRM' : motivo === 'Muestra comercial' ? 'MUE' : 'MNT'}-${100 + m.id}`,
        operador: OPERADORES_INV[Math.floor(Math.random() * 4)],
      })
    }
  })

  return movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

const movimientos = buildMovimientosFIFO()

// Recomputar stock_litros / stock real desde los movimientos para que sea consistente
function recomputarStock() {
  aromas.forEach(a => {
    const entradas = movimientos.filter(m => m.tipo === 'entrada' && m.item_tipo === 'aroma' && m.item_id === a.id)
    const salidas  = movimientos.filter(m => m.tipo === 'salida'  && m.item_tipo === 'aroma' && m.item_id === a.id)
    const totalIn  = entradas.reduce((s, m) => s + m.cantidad, 0)
    const totalOut = salidas.reduce((s, m) => s + m.cantidad, 0)
    a.stock_litros = +(totalIn - totalOut).toFixed(2)
    a.stock_status = a.stock_litros < a.stock_minimo * 0.5 ? 'critico' : a.stock_litros < a.stock_minimo ? 'bajo' : 'ok'
    a.ultimo_movimiento = entradas.concat(salidas).sort((x, y) => new Date(y.fecha) - new Date(x.fecha))[0]?.fecha || a.ultimo_movimiento
  })
  difusores.forEach(d => {
    const entradas = movimientos.filter(m => m.tipo === 'entrada' && m.item_tipo === 'difusor' && m.item_id === d.id)
    const salidas  = movimientos.filter(m => m.tipo === 'salida'  && m.item_tipo === 'difusor' && m.item_id === d.id)
    const totalIn  = entradas.reduce((s, m) => s + m.cantidad, 0)
    const totalOut = salidas.reduce((s, m) => s + m.cantidad, 0)
    d.stock = totalIn - totalOut
  })
}
recomputarStock()

// ─────────── FIFO HELPERS (motor de inventario) ───────────
//
// Lotes abiertos = entradas con cantidad_restante > 0, ordenadas por fecha (oldest first)
function getLotesAbiertos(itemTipo, itemId) {
  return movimientos
    .filter(m => m.tipo === 'entrada' && m.item_tipo === itemTipo && m.item_id === itemId)
    .map(e => ({
      ...e,
      cantidad_restante: +(e.cantidad - (e.cantidad_consumida || 0)).toFixed(2),
    }))
    .filter(e => e.cantidad_restante > 0.0001)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
}

// Preview FIFO sin consumir: dado itemId y cantidad, devuelve qué lotes consumiría
export function previewFIFO(itemTipo, itemId, cantidad) {
  if (!itemId || !cantidad || cantidad <= 0) return null
  const lotes = getLotesAbiertos(itemTipo, itemId)
  let restante = cantidad
  const consumiría = []
  for (const l of lotes) {
    if (restante <= 0.0001) break
    const tomar = Math.min(l.cantidad_restante, restante)
    consumiría.push({
      entrada_id: l.id,
      entrada_folio: l.folio,
      fecha_entrada: l.fecha,
      cantidad: +tomar.toFixed(2),
      costo_unitario: l.costo_unitario,
      subtotal: +(tomar * l.costo_unitario).toFixed(2),
    })
    restante = +(restante - tomar).toFixed(2)
  }
  const cantidadDisponible = lotes.reduce((s, l) => s + l.cantidad_restante, 0)
  const cantidadConsumida  = consumiría.reduce((s, c) => s + c.cantidad, 0)
  const costoTotal         = consumiría.reduce((s, c) => s + c.subtotal, 0)
  return {
    suficiente: restante <= 0.0001,
    cantidad_solicitada: cantidad,
    cantidad_disponible: +cantidadDisponible.toFixed(2),
    cantidad_consumida: +cantidadConsumida.toFixed(2),
    faltante: +Math.max(0, restante).toFixed(2),
    lotes: consumiría,
    costo_total: +costoTotal.toFixed(2),
    costo_promedio: cantidadConsumida > 0 ? +(costoTotal / cantidadConsumida).toFixed(2) : 0,
  }
}

// Aplicar consumo FIFO real (modifica los lotes)
function aplicarFIFO(itemTipo, itemId, cantidad) {
  const lotes = getLotesAbiertos(itemTipo, itemId)
  let restante = cantidad
  const consumidos = []
  for (const l of lotes) {
    if (restante <= 0.0001) break
    const lote = movimientos.find(m => m.id === l.id)
    const tomar = Math.min(l.cantidad_restante, restante)
    lote.cantidad_consumida = +((lote.cantidad_consumida || 0) + tomar).toFixed(2)
    consumidos.push({
      entrada_id: lote.id,
      entrada_folio: lote.folio,
      fecha_entrada: lote.fecha,
      cantidad: +tomar.toFixed(2),
      costo_unitario: lote.costo_unitario,
      subtotal: +(tomar * lote.costo_unitario).toFixed(2),
    })
    restante = +(restante - tomar).toFixed(2)
  }
  return {
    consumidos,
    costo_total: +consumidos.reduce((s, c) => s + c.subtotal, 0).toFixed(2),
    cantidad_consumida: +consumidos.reduce((s, c) => s + c.cantidad, 0).toFixed(2),
    faltante: +Math.max(0, restante).toFixed(2),
  }
}

// Costo del inventario actual usando FIFO (sumar lotes abiertos × costo unitario)
function valorInventarioFIFO() {
  let total = 0
  aromas.forEach(a => {
    getLotesAbiertos('aroma', a.id).forEach(l => { total += l.cantidad_restante * l.costo_unitario })
  })
  difusores.forEach(d => {
    getLotesAbiertos('difusor', d.id).forEach(l => { total += l.cantidad_restante * l.costo_unitario })
  })
  return Math.round(total)
}

// ─────────── KPIs INVENTARIO ───────────
const kpisInventario = () => {
  const ahora = Date.now()
  const ventasUltMes = movimientos.filter(m =>
    m.tipo === 'salida' && m.motivo === 'Venta cliente'
    && (ahora - new Date(m.fecha).getTime()) < 30 * 86400000
  )
  const ingresosVentas = ventasUltMes.reduce((s, m) => s + (m.precio_total || 0), 0)
  const utilidadVentas = ventasUltMes.reduce((s, m) => s + (m.utilidad || 0), 0)
  const margenPromedio = ingresosVentas > 0 ? (utilidadVentas / ingresosVentas) * 100 : 0

  return {
    valor_total: valorInventarioFIFO(),
    sku_total: aromas.length + difusores.length,
    aromas_criticos: aromas.filter(a => a.stock_status === 'critico').length,
    aromas_bajos: aromas.filter(a => a.stock_status === 'bajo').length,
    litros_totales: +aromas.reduce((s, a) => s + a.stock_litros, 0).toFixed(2),
    difusores_totales: difusores.reduce((s, d) => s + d.stock, 0),
    movimientos_mes: movimientos.filter(m => (ahora - new Date(m.fecha).getTime()) < 30 * 86400000).length,
    ventas_mes: ingresosVentas,
    utilidad_mes: utilidadVentas,
    margen_promedio: +margenPromedio.toFixed(1),
  }
}

// ─────────── FINANZAS ───────────
const CLIENTES_FAC = [
  'Grupo Posadas', 'Hotel Camino Real', 'Cinépolis Corp', 'Liverpool Insurgentes',
  'Palacio de Hierro Polanco', 'Sanborns SA', 'Starbucks MX', 'Best Western Reforma',
  'Holiday Inn Aeropuerto', 'NH Hoteles', 'BBVA México', 'Santander Reforma',
  'Banorte Corporativo', 'Citibanamex', 'Inbursa', 'Hospital Ángeles Lomas',
  'Médica Sur Tlalpan', 'ABC Observatorio', 'Coppel Corp', 'Soriana Hiper',
  'Walmart México', 'Costco Polanco', 'Office Depot', 'Sears Roebuck',
]

const cxc = Array.from({ length: 24 }, (_, i) => {
  const dias = Math.floor(Math.random() * 90) - 30
  const monto = Math.round(Math.random() * 80000 + 5000)
  const pagado = dias < -10 ? Math.round(monto * (Math.random() * 0.6)) : 0
  return {
    id: i + 1,
    folio: `FAC-${4000 + i}`,
    cliente: CLIENTES_FAC[i],
    monto,
    monto_pagado: pagado,
    monto_pendiente: monto - pagado,
    fecha_emision: new Date(Date.now() - (dias + 30) * 86400000).toISOString(),
    fecha_vencimiento: new Date(Date.now() - dias * 86400000).toISOString(),
    dias_vencido: dias > 0 ? dias : 0,
    metodo_pago: ['Transferencia', 'Crédito 30d', 'Crédito 60d', 'Tarjeta'][i % 4],
    status: dias > 30 ? 'vencido' : dias > 0 ? 'por_vencer' : pagado > 0 ? 'parcial' : 'al_dia',
    contacto: `cobranza@${CLIENTES_FAC[i].toLowerCase().split(' ')[0]}.com`,
  }
})

const PROVEEDORES = [
  'IFF Internacional', 'Givaudan México', 'Symrise Latam', 'Firmenich SA',
  'Aromas Premium MX', 'Dipsa Esencias', 'Ferrocom Industrial', 'Plásticos del Bajío',
  'Cristalería Monterrey', 'Empaques Industriales', 'Etiquetas SA de CV', 'Logística MX',
  'Transportes Norte', 'Combustibles Pemex', 'Renta de Camiones', 'Mantenimiento Téc.',
]

const cxp = Array.from({ length: 16 }, (_, i) => {
  const dias = Math.floor(Math.random() * 60) - 25
  const monto = Math.round(Math.random() * 50000 + 3000)
  return {
    id: i + 1,
    folio: `OC-${1100 + i}`,
    proveedor: PROVEEDORES[i],
    concepto: ['Materia prima · esencias', 'Insumos producción', 'Empaque y embalaje',
               'Servicio logístico', 'Combustible flota', 'Renta vehicular',
               'Mantenimiento equipos', 'Servicios profesionales'][i % 8],
    monto,
    monto_pendiente: dias > 0 ? monto : 0,
    fecha_emision: new Date(Date.now() - (dias + 30) * 86400000).toISOString(),
    fecha_vencimiento: new Date(Date.now() - dias * 86400000).toISOString(),
    dias_vencido: dias > 0 ? dias : 0,
    metodo_pago: ['Transferencia', 'Cheque', 'Crédito proveedor'][i % 3],
    status: dias > 15 ? 'vencido' : dias > 0 ? 'por_vencer' : 'pagado',
  }
})

// ─────────── LOGÍSTICA ───────────
// Ciudades principales con coordenadas reales
const CIUDADES = [
  { id: 'cdmx', nombre: 'Ciudad de México', estado: 'CDMX', lat: 19.4326, lng: -99.1332 },
  { id: 'gdl', nombre: 'Guadalajara', estado: 'Jalisco', lat: 20.6597, lng: -103.3496 },
  { id: 'mty', nombre: 'Monterrey', estado: 'NL', lat: 25.6866, lng: -100.3161 },
  { id: 'pue', nombre: 'Puebla', estado: 'Puebla', lat: 19.0414, lng: -98.2063 },
  { id: 'qro', nombre: 'Querétaro', estado: 'Querétaro', lat: 20.5888, lng: -100.3899 },
  { id: 'leo', nombre: 'León', estado: 'Guanajuato', lat: 21.1250, lng: -101.6859 },
  { id: 'tij', nombre: 'Tijuana', estado: 'BC', lat: 32.5149, lng: -117.0382 },
  { id: 'mer', nombre: 'Mérida', estado: 'Yucatán', lat: 20.9674, lng: -89.5926 },
  { id: 'cun', nombre: 'Cancún', estado: 'QR', lat: 21.1619, lng: -86.8515 },
  { id: 'tol', nombre: 'Toluca', estado: 'Edomex', lat: 19.2826, lng: -99.6557 },
  { id: 'agu', nombre: 'Aguascalientes', estado: 'Ags', lat: 21.8853, lng: -102.2916 },
  { id: 'sld', nombre: 'San Luis Potosí', estado: 'SLP', lat: 22.1565, lng: -100.9855 },
  { id: 'chi', nombre: 'Chihuahua', estado: 'Chih', lat: 28.6353, lng: -106.0889 },
  { id: 'her', nombre: 'Hermosillo', estado: 'Sonora', lat: 29.0729, lng: -110.9559 },
  { id: 'ver', nombre: 'Veracruz', estado: 'Veracruz', lat: 19.1738, lng: -96.1342 },
]

// Distancia aprox haversine
const dist = (a, b) => {
  const R = 6371
  const toRad = x => x * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2
  return Math.round(2 * R * Math.asin(Math.sqrt(x)))
}

// Tarifas: $14/km + base por viaje + factor según tipo de camión
const calcCotizacion = (origenId, destinoId, tipo = 'rabón') => {
  const o = CIUDADES.find(c => c.id === origenId)
  const d = CIUDADES.find(c => c.id === destinoId)
  if (!o || !d) return null
  const km = dist(o, d)
  const factor = tipo === 'tortón' ? 1.7 : tipo === 'trailer' ? 2.4 : 1
  const base = 1500 * factor
  const tarifaKm = 14 * factor
  const peajes = Math.round(km * 1.8)
  const subtotal = base + (km * tarifaKm) + peajes
  const iva = Math.round(subtotal * 0.16)
  const horasEstimadas = Math.round(km / 70)
  return {
    origen: o, destino: d, km, tipo,
    base: Math.round(base),
    tarifa_km: Math.round(tarifaKm),
    costo_km: Math.round(km * tarifaKm),
    peajes, subtotal: Math.round(subtotal), iva, total: Math.round(subtotal + iva),
    horas_estimadas: horasEstimadas, dias_estimados: Math.ceil(horasEstimadas / 9),
  }
}

const viajes = Array.from({ length: 12 }, (_, i) => {
  const o = CIUDADES[i % CIUDADES.length]
  const d = CIUDADES[(i + 3 + (i % 5)) % CIUDADES.length]
  const tipo = ['rabón', 'tortón', 'trailer'][i % 3]
  const cot = calcCotizacion(o.id, d.id, tipo)
  const operadores = ['Mario Sánchez', 'Luis Gómez', 'Carlos Pérez', 'Diego Hernández', 'Roberto Cruz']
  const fecha = new Date(Date.now() + (i - 4) * 86400000)
  const status = i < 3 ? 'completado' : i < 5 ? 'en_curso' : i < 9 ? 'agendado' : 'cotización'
  return {
    id: i + 1,
    folio: `VJ-${3000 + i}`,
    origen: o, destino: d, tipo,
    operador: operadores[i % operadores.length],
    placa: `${['ABC', 'XYZ', 'KLM', 'NPQ'][i % 4]}-${1000 + i}`,
    km: cot.km,
    total: cot.total,
    fecha_salida: fecha.toISOString(),
    fecha_llegada: new Date(fecha.getTime() + cot.horas_estimadas * 3600000).toISOString(),
    status,
    clientes_visitar: Math.floor(Math.random() * 5) + 2,
    carga: ['12 difusores grandes + 80L aceite', '6 difusores chicos + 40L aceite',
            'Surtido completo zona', 'Reposición + insumos', 'Visita técnica + recargas'][i % 5],
  }
})

// ─────────── RUTAS ───────────
// Clientes geolocalizados en CDMX y zona metropolitana, además de otras ciudades
const ZONAS = [
  { id: 'polanco', nombre: 'Polanco', color: '#2563eb', lat: 19.4338, lng: -99.1934 },
  { id: 'roma_condesa', nombre: 'Roma · Condesa', color: '#0891b2', lat: 19.4145, lng: -99.1665 },
  { id: 'santa_fe', nombre: 'Santa Fe', color: '#7c3aed', lat: 19.3622, lng: -99.2596 },
  { id: 'centro', nombre: 'Centro Histórico', color: '#db2777', lat: 19.4326, lng: -99.1332 },
  { id: 'coyoacan', nombre: 'Coyoacán · Del Valle', color: '#ea580c', lat: 19.3467, lng: -99.1618 },
  { id: 'satelite', nombre: 'Satélite · Interlomas', color: '#16a34a', lat: 19.5099, lng: -99.2342 },
  { id: 'aeropuerto', nombre: 'Aeropuerto · Oriente', color: '#ca8a04', lat: 19.4361, lng: -99.0719 },
  { id: 'sur', nombre: 'Sur · Tlalpan', color: '#0d9488', lat: 19.2925, lng: -99.1663 },
]

const CLIENTES_RUTAS = [
  // Polanco
  { nombre: 'Hotel Camino Real Polanco', zona: 'polanco', lat: 19.4337, lng: -99.1996, equipos: 4 },
  { nombre: 'Palacio de Hierro Polanco', zona: 'polanco', lat: 19.4348, lng: -99.1916, equipos: 6 },
  { nombre: 'Antara Fashion Hall', zona: 'polanco', lat: 19.4407, lng: -99.2058, equipos: 8 },
  { nombre: 'BBVA Torre Reforma', zona: 'polanco', lat: 19.4275, lng: -99.1737, equipos: 5 },
  { nombre: 'NH Polanco', zona: 'polanco', lat: 19.4360, lng: -99.1940, equipos: 3 },
  // Roma · Condesa
  { nombre: 'Starbucks Roma Norte', zona: 'roma_condesa', lat: 19.4187, lng: -99.1626, equipos: 1 },
  { nombre: 'Liverpool Insurgentes', zona: 'roma_condesa', lat: 19.4157, lng: -99.1670, equipos: 7 },
  { nombre: 'Cinépolis Plaza Insurgentes', zona: 'roma_condesa', lat: 19.4118, lng: -99.1696, equipos: 3 },
  { nombre: 'Hotel Condesa DF', zona: 'roma_condesa', lat: 19.4118, lng: -99.1740, equipos: 2 },
  { nombre: 'Sanborns Roma', zona: 'roma_condesa', lat: 19.4170, lng: -99.1640, equipos: 2 },
  // Santa Fe
  { nombre: 'ABC Santa Fe', zona: 'santa_fe', lat: 19.3590, lng: -99.2585, equipos: 9 },
  { nombre: 'Centro Comercial Santa Fe', zona: 'santa_fe', lat: 19.3617, lng: -99.2605, equipos: 12 },
  { nombre: 'Hotel JW Marriott Santa Fe', zona: 'santa_fe', lat: 19.3641, lng: -99.2570, equipos: 5 },
  { nombre: 'Palacio de Hierro Santa Fe', zona: 'santa_fe', lat: 19.3612, lng: -99.2610, equipos: 6 },
  // Centro Histórico
  { nombre: 'Sanborns Casa de los Azulejos', zona: 'centro', lat: 19.4341, lng: -99.1402, equipos: 2 },
  { nombre: 'Holiday Inn Zócalo', zona: 'centro', lat: 19.4338, lng: -99.1331, equipos: 3 },
  { nombre: 'NH Centro Histórico', zona: 'centro', lat: 19.4351, lng: -99.1392, equipos: 3 },
  { nombre: 'Best Western Majestic', zona: 'centro', lat: 19.4333, lng: -99.1339, equipos: 2 },
  // Coyoacán
  { nombre: 'Médica Sur Tlalpan', zona: 'coyoacan', lat: 19.2978, lng: -99.1594, equipos: 8 },
  { nombre: 'Cinépolis Coyoacán', zona: 'coyoacan', lat: 19.3504, lng: -99.1620, equipos: 4 },
  { nombre: 'Hospital Ángeles Coapa', zona: 'coyoacan', lat: 19.3010, lng: -99.1320, equipos: 7 },
  { nombre: 'Liverpool Coyoacán', zona: 'coyoacan', lat: 19.3503, lng: -99.1640, equipos: 5 },
  // Satélite
  { nombre: 'Plaza Satélite', zona: 'satelite', lat: 19.5100, lng: -99.2340, equipos: 10 },
  { nombre: 'Best Western Satélite', zona: 'satelite', lat: 19.5099, lng: -99.2348, equipos: 3 },
  { nombre: 'Costco Interlomas', zona: 'satelite', lat: 19.4109, lng: -99.2820, equipos: 4 },
  // Aeropuerto · Oriente
  { nombre: 'Holiday Inn Aeropuerto', zona: 'aeropuerto', lat: 19.4356, lng: -99.0780, equipos: 4 },
  { nombre: 'NH Aeropuerto', zona: 'aeropuerto', lat: 19.4341, lng: -99.0720, equipos: 3 },
  { nombre: 'Cinépolis Plaza Oriente', zona: 'aeropuerto', lat: 19.3967, lng: -99.0620, equipos: 3 },
  // Sur · Tlalpan
  { nombre: 'Hospital Ángeles Pedregal', zona: 'sur', lat: 19.3270, lng: -99.2080, equipos: 8 },
  { nombre: 'Cinépolis Perisur', zona: 'sur', lat: 19.3060, lng: -99.1930, equipos: 4 },
  { nombre: 'Walmart Tlalpan', zona: 'sur', lat: 19.2930, lng: -99.1680, equipos: 5 },
  { nombre: 'Hotel Royal Pedregal', zona: 'sur', lat: 19.3120, lng: -99.2030, equipos: 3 },
]

// Operadores
const OPERADORES = [
  { id: 1, nombre: 'Mario Sánchez', zonas: ['polanco', 'centro'], avatar: 'MS', activo: true },
  { id: 2, nombre: 'Luis Gómez', zonas: ['santa_fe', 'satelite'], avatar: 'LG', activo: true },
  { id: 3, nombre: 'Carlos Pérez', zonas: ['roma_condesa', 'sur'], avatar: 'CP', activo: true },
  { id: 4, nombre: 'Diego Hernández', zonas: ['coyoacan', 'aeropuerto'], avatar: 'DH', activo: true },
  { id: 5, nombre: 'Roberto Cruz', zonas: [], avatar: 'RC', activo: false },
]

// Generar clientes con metadata de visita
const clientesRutas = CLIENTES_RUTAS.map((c, i) => {
  const z = ZONAS.find(z => z.id === c.zona)
  const op = OPERADORES.find(o => o.zonas.includes(c.zona))
  const diasUltimaVisita = Math.floor(Math.random() * 45)
  const aceiteRestante = Math.round(Math.random() * 100)
  const status = diasUltimaVisita > 35 ? 'urgente' : diasUltimaVisita > 28 ? 'pendiente' : 'al_dia'
  return {
    id: i + 1,
    codigo: `CL-${String(1000 + i).padStart(4, '0')}`,
    nombre: c.nombre,
    zona_id: c.zona,
    zona_nombre: z?.nombre,
    zona_color: z?.color,
    lat: c.lat, lng: c.lng,
    equipos: c.equipos,
    operador_asignado: op?.nombre || 'Sin asignar',
    operador_id: op?.id,
    ultima_visita: new Date(Date.now() - diasUltimaVisita * 86400000).toISOString(),
    dias_ultima_visita: diasUltimaVisita,
    aceite_restante_pct: aceiteRestante,
    status_visita: status,
    proxima_visita: new Date(Date.now() + Math.max(0, 30 - diasUltimaVisita) * 86400000).toISOString(),
  }
})

// Reportes de operador
const reportesOperador = Array.from({ length: 22 }, (_, i) => {
  const cliente = clientesRutas[i % clientesRutas.length]
  const op = OPERADORES.find(o => o.id === cliente.operador_id) || OPERADORES[0]
  const fecha = new Date(Date.now() - i * 86400000 * 0.6)
  return {
    id: i + 1,
    folio: `RPT-${6000 + i}`,
    cliente_id: cliente.id,
    cliente_nombre: cliente.nombre,
    zona: cliente.zona_id,
    operador: op.nombre,
    fecha: fecha.toISOString(),
    aceite_restante_pct: Math.round(Math.random() * 100),
    necesita_recarga: Math.random() > 0.5,
    necesita_servicio: Math.random() > 0.7,
    equipos_revisados: Math.floor(Math.random() * cliente.equipos) + 1,
    observaciones: [
      'Cliente satisfecho. Difusores funcionando correctamente.',
      'Solicita cambio de aroma para próxima visita. Le interesa Lavanda Provenza.',
      'Difusor del piso 3 con falla intermitente. Programar revisión.',
      'Recarga completa realizada. Cliente acepta visita mensual.',
      'Equipo dañado por mudanza. Necesita reposición.',
      'Cliente quiere ampliar a otra zona del establecimiento.',
    ][i % 6],
    proxima_accion: ['recarga', 'servicio_tecnico', 'revision_general', 'visita_comercial'][i % 4],
  }
})

// Resumen por zona
const resumenZonas = () => {
  return ZONAS.map(z => {
    const clientesZona = clientesRutas.filter(c => c.zona_id === z.id)
    const op = OPERADORES.find(o => o.zonas.includes(z.id))
    return {
      ...z,
      clientes_total: clientesZona.length,
      equipos_total: clientesZona.reduce((s, c) => s + c.equipos, 0),
      visitas_pendientes: clientesZona.filter(c => c.status_visita !== 'al_dia').length,
      visitas_urgentes: clientesZona.filter(c => c.status_visita === 'urgente').length,
      operador: op?.nombre || 'Sin asignar',
      operador_id: op?.id,
    }
  })
}

// ─────────── ALERTAS ───────────
// El motor de alertas analiza datos cruzados y genera acciones ejecutables
const generarAlertas = () => {
  const alerts = []

  // 1. Aromas críticos
  const criticos = aromas.filter(a => a.stock_status === 'critico')
  criticos.forEach((a, i) => {
    alerts.push({
      id: `alert-stock-${a.id}`,
      tipo: 'inventario',
      severidad: 'alta',
      titulo: `Stock crítico: ${a.nombre}`,
      descripcion: `Solo quedan ${a.stock_litros.toFixed(2)}L del aroma ${a.nombre}. Mínimo recomendado: ${a.stock_minimo}L. Riesgo de paro de producción en ${Math.ceil(a.stock_litros / 3)} días.`,
      modulo: 'inventarios',
      modulo_label: 'Inventarios',
      fecha: new Date(Date.now() - i * 3600000).toISOString(),
      acciones: [
        { id: 'ord-compra', label: 'Generar orden de compra automática', tipo: 'primary', icono: 'ShoppingCart' },
        { id: 'ver-prov', label: 'Ver proveedores', tipo: 'ghost' },
      ],
      contexto: { aroma_id: a.id, stock: a.stock_litros, costo_estimado: Math.round(a.stock_minimo * 4 * a.costo_por_litro) },
    })
  })

  // 2. Clientes con visitas urgentes (zonas con poca actividad)
  const visitasUrgentes = clientesRutas.filter(c => c.status_visita === 'urgente')
  if (visitasUrgentes.length > 0) {
    alerts.push({
      id: 'alert-rutas-urgentes',
      tipo: 'rutas',
      severidad: 'alta',
      titulo: `${visitasUrgentes.length} clientes sin visita hace +35 días`,
      descripcion: `Clientes en riesgo de churn: ${visitasUrgentes.slice(0, 3).map(c => c.nombre).join(', ')}${visitasUrgentes.length > 3 ? '...' : ''}. Programar ruta de emergencia.`,
      modulo: 'rutas',
      modulo_label: 'Rutas',
      fecha: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      acciones: [
        { id: 'gen-ruta', label: 'Generar ruta de emergencia', tipo: 'primary', icono: 'Route' },
        { id: 'asign-op', label: 'Asignar operador', tipo: 'ghost' },
      ],
      contexto: { clientes_count: visitasUrgentes.length },
    })
  }

  // 3. CxC vencidas críticas (>60 días)
  const cxcCriticas = cxc.filter(c => c.dias_vencido > 60)
  if (cxcCriticas.length > 0) {
    const monto = cxcCriticas.reduce((s, c) => s + c.monto_pendiente, 0)
    alerts.push({
      id: 'alert-cxc-criticas',
      tipo: 'finanzas',
      severidad: 'alta',
      titulo: `${cxcCriticas.length} facturas vencidas +60 días`,
      descripcion: `Total comprometido: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto)}. Iniciar gestión de cobranza inmediata.`,
      modulo: 'finanzas',
      modulo_label: 'Finanzas',
      fecha: new Date(Date.now() - 4 * 3600000).toISOString(),
      acciones: [
        { id: 'envio-cobro', label: 'Enviar recordatorios automáticos', tipo: 'primary', icono: 'Mail' },
        { id: 'esc-legal', label: 'Escalar a legal', tipo: 'ghost' },
      ],
      contexto: { facturas_count: cxcCriticas.length, monto },
    })
  }

  // 4. Tickets SLA en riesgo
  const slaCriticos = tickets.filter(t =>
    (t.status === 'abierto' || t.status === 'en_proceso') && t.horas_abierto > t.sla_horas * 0.8
  )
  if (slaCriticos.length > 0) {
    alerts.push({
      id: 'alert-sla',
      tipo: 'atencion',
      severidad: 'media',
      titulo: `${slaCriticos.length} tickets cerca de vencer SLA`,
      descripcion: `Tickets que excederán el SLA en menos de ${Math.min(...slaCriticos.map(t => t.sla_horas - t.horas_abierto))}h. Requieren atención inmediata.`,
      modulo: 'atencion',
      modulo_label: 'Atención',
      fecha: new Date(Date.now() - 2 * 3600000).toISOString(),
      acciones: [
        { id: 'reasignar', label: 'Reasignar a equipo disponible', tipo: 'primary', icono: 'Users' },
        { id: 'ver-tickets', label: 'Ver tickets', tipo: 'ghost' },
      ],
      contexto: { tickets_count: slaCriticos.length },
    })
  }

  // 5. Zona con baja densidad de clientes (oportunidad de venta)
  const zonas = resumenZonas()
  const zonasBajas = zonas.filter(z => z.clientes_total < 4)
  zonasBajas.forEach((z, i) => {
    alerts.push({
      id: `alert-oportunidad-${z.id}`,
      tipo: 'oportunidad',
      severidad: 'media',
      titulo: `Oportunidad: zona ${z.nombre} con baja densidad`,
      descripcion: `Solo ${z.clientes_total} clientes en zona. El operador ya viaja, agregar prospectos optimiza la ruta. Sugerencia: lanzar campaña de ventas en zona.`,
      modulo: 'ventas',
      modulo_label: 'Ventas',
      fecha: new Date(Date.now() - (5 + i) * 3600000).toISOString(),
      acciones: [
        { id: 'gen-prospec', label: 'Generar prospectos en zona', tipo: 'primary', icono: 'Target' },
        { id: 'ver-zona', label: 'Ver zona en mapa', tipo: 'ghost' },
      ],
      contexto: { zona: z.nombre, clientes_count: z.clientes_total },
    })
  })

  // 6. Clientes con aceite muy bajo
  const aceiteBajo = clientesRutas.filter(c => c.aceite_restante_pct < 20)
  if (aceiteBajo.length > 0) {
    alerts.push({
      id: 'alert-aceite-bajo',
      tipo: 'rutas',
      severidad: 'media',
      titulo: `${aceiteBajo.length} clientes con aceite <20%`,
      descripcion: `Difusores en riesgo de quedar sin aroma. Programar recargas en próximos 3 días para mantener servicio continuo.`,
      modulo: 'rutas',
      modulo_label: 'Rutas',
      fecha: new Date(Date.now() - 6 * 3600000).toISOString(),
      acciones: [
        { id: 'prog-recargas', label: 'Programar recargas', tipo: 'primary', icono: 'Calendar' },
      ],
      contexto: { clientes_count: aceiteBajo.length },
    })
  }

  // 7. Patrón anómalo: muchas salidas de un aroma específico
  const salidas = movimientos.filter(m => m.tipo === 'salida')
  const conteoSalidas = {}
  salidas.forEach(s => { conteoSalidas[s.item_nombre] = (conteoSalidas[s.item_nombre] || 0) + 1 })
  const topSalida = Object.entries(conteoSalidas).sort((a, b) => b[1] - a[1])[0]
  if (topSalida && topSalida[1] >= 3) {
    alerts.push({
      id: 'alert-tendencia-salida',
      tipo: 'tendencia',
      severidad: 'baja',
      titulo: `Tendencia: alta demanda de ${topSalida[0]}`,
      descripcion: `${topSalida[1]} salidas registradas este mes. Considerar aumentar stock mínimo de seguridad o producción anticipada.`,
      modulo: 'inventarios',
      modulo_label: 'Inventarios',
      fecha: new Date(Date.now() - 12 * 3600000).toISOString(),
      acciones: [
        { id: 'ajustar-min', label: 'Ajustar stock mínimo', tipo: 'primary', icono: 'TrendingUp' },
      ],
      contexto: { aroma: topSalida[0], salidas: topSalida[1] },
    })
  }

  return alerts.sort((a, b) => {
    const sevOrder = { alta: 0, media: 1, baja: 2 }
    if (sevOrder[a.severidad] !== sevOrder[b.severidad]) return sevOrder[a.severidad] - sevOrder[b.severidad]
    return new Date(b.fecha) - new Date(a.fecha)
  })
}

// ─────────── VENTAS ───────────
const SECTORES = ['Hotelería', 'Retail', 'Salud', 'Bancario', 'Restaurantero', 'Corporativo', 'Educación', 'Inmobiliario']

const PROSPECTOS_NOMBRES = [
  'Hotel Presidente Intercontinental', 'Marriott Reforma', 'Hyatt Regency Mexico City',
  'St Regis Polanco', 'Four Seasons Mexico', 'W Mexico City', 'Westin Santa Fe',
  'Suburbia Polanco', 'Liverpool Santa Fe', 'Sears Reforma', 'El Palacio Coyoacán',
  'Hospital Médica Sur Norte', 'Hospital Español', 'Star Médica Centro', 'Centro Médico ABC Sur',
  'BBVA Bancomer Polanco', 'Citibanamex Reforma', 'Scotiabank Centro', 'HSBC Lomas',
  'Restaurante Pujol', 'Quintonil', 'Sud 777', 'Rosetta', 'Maximo Bistrot',
  'Bimbo Corporativo', 'Femsa CDMX', 'Cinemex Corporativo', 'Aeromexico HQ',
  'Universidad Anáhuac', 'Tec Santa Fe', 'IPADE',
]

const FUENTES_SCRAP = [
  'Google Maps · Hoteles 4-5 estrellas CDMX',
  'LinkedIn · Empresas 100+ empleados Polanco',
  'Sitios web corporativos · sector salud',
  'Directorio AMHM · hoteles afiliados',
  'Cámara de Comercio · ranking 2024',
  'Compranet · proveedores institucionales',
  'Bing Maps · centros comerciales clase A',
  'Páginas amarillas · clínicas privadas',
]

const prospectos = PROSPECTOS_NOMBRES.map((nombre, i) => {
  const zonasIds = ZONAS.map(z => z.id)
  const zonaId = zonasIds[i % zonasIds.length]
  const z = ZONAS.find(z => z.id === zonaId)
  const score = Math.floor(Math.random() * 40) + 60
  const status = ['nuevo', 'contactado', 'cita_agendada', 'descartado', 'cerrado'][
    [0, 0, 1, 0, 1, 2, 0, 1, 0, 2, 0, 1, 0, 0, 1, 2, 0, 0, 1, 0, 4, 1, 0, 1, 0, 0, 1, 2, 0, 1, 3][i]
  ] || 'nuevo'
  return {
    id: i + 1,
    codigo: `PRS-${String(2000 + i).padStart(4, '0')}`,
    nombre,
    sector: SECTORES[i % SECTORES.length],
    contacto: ['Director General', 'Gerente de Operaciones', 'Facility Manager', 'Compras'][i % 4],
    email: `contacto${i}@${nombre.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    telefono: `55-${4000 + i}-${5000 + i}`,
    zona_id: zonaId,
    zona_nombre: z?.nombre,
    zona_color: z?.color,
    lat: z.lat + (Math.random() - 0.5) * 0.04,
    lng: z.lng + (Math.random() - 0.5) * 0.04,
    score,
    fuente: FUENTES_SCRAP[i % FUENTES_SCRAP.length],
    fecha_scraping: new Date(Date.now() - (i + 2) * 3600000).toISOString(),
    status,
    emails_enviados: status === 'nuevo' ? 0 : Math.floor(Math.random() * 4) + 1,
    abierto: status !== 'nuevo' && Math.random() > 0.3,
    respondio: status === 'contactado' || status === 'cita_agendada' || status === 'cerrado',
    fecha_cita: status === 'cita_agendada' || status === 'cerrado' ? new Date(Date.now() + (i % 5) * 86400000).toISOString() : null,
    valor_estimado: Math.round((Math.random() * 50 + 15) * 1000),
    notas: status === 'cita_agendada' ? 'Cliente muy interesado, pidió presentación ejecutiva.' :
           status === 'contactado' ? 'Respondió primer correo, agendar follow-up.' :
           status === 'descartado' ? 'No es buen fit, sin presupuesto.' :
           status === 'cerrado' ? '¡Cerrado! Inicia onboarding.' : '',
  }
})

// Campañas de scraping/email
const campanas = [
  {
    id: 1,
    nombre: 'Hoteles 5★ CDMX · Polanco / Reforma',
    status: 'activa',
    zonas: ['polanco', 'roma_condesa'],
    sector: 'Hotelería',
    fuente: 'Google Maps + LinkedIn',
    prospectos_total: 47,
    prospectos_nuevos: 12,
    emails_enviados: 38,
    emails_abiertos: 21,
    respuestas: 7,
    citas_agendadas: 3,
    fecha_inicio: new Date(Date.now() - 8 * 86400000).toISOString(),
    valor_pipeline: 285000,
  },
  {
    id: 2,
    nombre: 'Hospitales privados · Sur CDMX',
    status: 'activa',
    zonas: ['sur', 'coyoacan'],
    sector: 'Salud',
    fuente: 'Directorio médico + sitios corporativos',
    prospectos_total: 28,
    prospectos_nuevos: 5,
    emails_enviados: 23,
    emails_abiertos: 14,
    respuestas: 4,
    citas_agendadas: 2,
    fecha_inicio: new Date(Date.now() - 12 * 86400000).toISOString(),
    valor_pipeline: 175000,
  },
  {
    id: 3,
    nombre: 'Retail clase A · Santa Fe',
    status: 'activa',
    zonas: ['santa_fe'],
    sector: 'Retail',
    fuente: 'Centros comerciales + Google Maps',
    prospectos_total: 19,
    prospectos_nuevos: 3,
    emails_enviados: 16,
    emails_abiertos: 9,
    respuestas: 2,
    citas_agendadas: 1,
    fecha_inicio: new Date(Date.now() - 5 * 86400000).toISOString(),
    valor_pipeline: 92000,
  },
  {
    id: 4,
    nombre: 'Bancos corporativos · Reforma',
    status: 'pausada',
    zonas: ['polanco', 'centro'],
    sector: 'Bancario',
    fuente: 'LinkedIn + sitios corporativos',
    prospectos_total: 14,
    prospectos_nuevos: 0,
    emails_enviados: 14,
    emails_abiertos: 6,
    respuestas: 1,
    citas_agendadas: 0,
    fecha_inicio: new Date(Date.now() - 20 * 86400000).toISOString(),
    valor_pipeline: 68000,
  },
]
const flujoMensual = [
  { mes: 'Ene', ingresos: 482000, egresos: 318000 },
  { mes: 'Feb', ingresos: 521000, egresos: 342000 },
  { mes: 'Mar', ingresos: 612000, egresos: 384000 },
  { mes: 'Abr', ingresos: 593000, egresos: 361000 },
  { mes: 'May', ingresos: 724000, egresos: 421000 },
  { mes: 'Jun', ingresos: 781000, egresos: 452000 },
]

// Antigüedad de saldos
const calcAntiguedad = (lista) => {
  const buckets = { '0-15': 0, '16-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  lista.forEach(x => {
    const d = x.dias_vencido
    if (d === 0) return
    if (d <= 15) buckets['0-15'] += x.monto_pendiente
    else if (d <= 30) buckets['16-30'] += x.monto_pendiente
    else if (d <= 60) buckets['31-60'] += x.monto_pendiente
    else if (d <= 90) buckets['61-90'] += x.monto_pendiente
    else buckets['90+'] += x.monto_pendiente
  })
  return Object.entries(buckets).map(([rango, monto]) => ({ rango, monto }))
}

// ─────────── TICKETS ───────────
const ASUNTOS_TICKETS = [
  { asunto: 'Difusor no enciende', desc: 'El difusor del lobby principal dejó de encender desde anoche. Cliente reporta que no muestra luces.' },
  { asunto: 'Cambio de aroma solicitado', desc: 'Quieren cambiar a un aroma más cítrico para la temporada de verano. Actualmente tienen Lavanda.' },
  { asunto: 'Recarga urgente de aroma', desc: 'Se les acabó el aceite del difusor de recepción. Solicitan visita esta misma semana.' },
  { asunto: 'Falla intermitente del equipo', desc: 'El difusor enciende y apaga sin razón. Pasa varias veces al día.' },
  { asunto: 'Olor débil en zona principal', desc: 'Reportan que el aroma ya casi no se percibe en el área de eventos. Posible falta de mantenimiento.' },
  { asunto: 'Solicito visita técnica', desc: 'Necesitan revisión general de los 4 equipos instalados.' },
  { asunto: 'Reposición de equipo dañado', desc: 'Un cliente derramó algo encima del difusor. Necesitan reposición.' },
  { asunto: 'Fuga de líquido en difusor', desc: 'El difusor tiene una fuga, gotea aceite por la base.' },
  { asunto: 'Programación de horarios', desc: 'Quieren que el sistema solo opere en horario de oficina (9am-7pm).' },
  { asunto: 'Cambio de intensidad', desc: 'Solicitan reducir intensidad porque algunos empleados se quejan del aroma.' },
  { asunto: 'Aroma no autorizado', desc: 'El aroma actual no fue el que aprobaron. Necesitan corrección inmediata.' },
  { asunto: 'Equipo dañado tras mudanza', desc: 'Tras una remodelación, dos difusores quedaron sin funcionar.' },
  { asunto: 'Solicito presupuesto adicional', desc: 'Quieren ampliar a otra zona del establecimiento. Solicitan cotización.' },
  { asunto: 'Ampliación de zonas cubiertas', desc: 'Acabaron de inaugurar planta nueva y requieren cobertura.' },
  { asunto: 'Difusor genera ruido extraño', desc: 'Hace un sonido como vibración constante.' },
  { asunto: 'Solicitud de capacitación', desc: 'Personal nuevo no sabe operar los equipos.' },
]

const tickets = ASUNTOS_TICKETS.map((t, i) => {
  const status = ['abierto', 'en_proceso', 'resuelto', 'cerrado'][
    [0, 1, 2, 0, 1, 3, 0, 1, 2, 0, 1, 0, 3, 1, 0, 2][i]
  ]
  const horasAbierto = Math.floor(Math.random() * 72)
  return {
    id: i + 1,
    folio: `TKT-${5000 + i}`,
    cliente: ['Grupo Posadas - Recepción', 'Cinépolis Plaza Carso', 'Liverpool Insurgentes',
              'BBVA Reforma', 'Hotel Camino Real Polanco', 'Starbucks Roma Norte',
              'Hospital Ángeles Lomas', 'Palacio de Hierro Coyoacán', 'NH Centro Histórico',
              'Best Western Satélite', 'ABC Santa Fe', 'Médica Sur Tlalpan',
              'Sanborns Pino Suárez', 'Holiday Inn Aeropuerto', 'Walmart Polanco',
              'Costco Interlomas'][i],
    contacto: { email: `contacto${i}@empresa.com`, telefono: `55-${1000 + i}-${2000 + i}` },
    asunto: t.asunto,
    descripcion: t.desc,
    prioridad: ['alta', 'media', 'baja', 'alta', 'media', 'baja', 'alta', 'media', 'baja',
                'media', 'alta', 'alta', 'baja', 'media', 'media', 'baja'][i],
    status,
    canal: i % 3 === 0 ? 'web_publico' : i % 3 === 1 ? 'whatsapp' : 'email',
    fecha: new Date(Date.now() - i * 86400000 * 0.7 - horasAbierto * 3600000).toISOString(),
    fecha_actualizacion: new Date(Date.now() - Math.max(0, horasAbierto - 4) * 3600000).toISOString(),
    asignado: ['Sofía Ramírez', 'Andrea Martínez', 'Roberto Cruz', null][i % 4],
    sla_horas: { alta: 4, media: 12, baja: 24 }[['alta', 'media', 'baja', 'alta', 'media', 'baja', 'alta', 'media', 'baja', 'media', 'alta', 'alta', 'baja', 'media', 'media', 'baja'][i]],
    horas_abierto: horasAbierto,
    mensajes: [
      {
        autor: 'cliente',
        nombre: 'Cliente',
        texto: t.desc,
        fecha: new Date(Date.now() - i * 86400000 * 0.7 - horasAbierto * 3600000).toISOString(),
      },
      ...(status !== 'abierto' ? [{
        autor: 'equipo',
        nombre: ['Sofía Ramírez', 'Andrea Martínez', 'Roberto Cruz'][i % 3],
        texto: 'Recibido. Vamos a revisar el caso y te contactamos en breve para coordinar la visita.',
        fecha: new Date(Date.now() - Math.max(0, horasAbierto - 2) * 3600000).toISOString(),
      }] : []),
      ...(status === 'resuelto' || status === 'cerrado' ? [{
        autor: 'equipo',
        nombre: ['Sofía Ramírez', 'Andrea Martínez', 'Roberto Cruz'][i % 3],
        texto: 'El operador asistió a la sucursal y resolvió el problema. Equipo funcionando correctamente.',
        fecha: new Date(Date.now() - Math.max(0, horasAbierto - 8) * 3600000).toISOString(),
      }] : []),
    ],
  }
})

// ─────────── ROUTER ───────────
export function handleRequest(method, path, body) {
  // Inventarios
  if (path === '/inventarios/aromas') return aromas
  if (path.startsWith('/inventarios/aromas/')) {
    const id = +path.split('/').pop()
    return aromas.find(a => a.id === id)
  }
  if (path === '/inventarios/difusores') return difusores
  if (path === '/inventarios/movimientos') return movimientos
  if (path === '/inventarios/kpis') return kpisInventario()
  if (path.startsWith('/inventarios/lotes/')) {
    // /inventarios/lotes/aroma/3 — devuelve lotes abiertos del item
    const [_, __, ___, tipo, id] = path.split('/')
    return getLotesAbiertos(tipo, +id)
  }
  if (path === '/inventarios/preview-fifo' && method === 'POST') {
    return previewFIFO(body.item_tipo, +body.item_id, +body.cantidad)
  }
  if (path === '/inventarios/entradas' && method === 'POST') {
    const m = newMov()
    const cantidad = +body.cantidad
    const costoUnitario = +body.costo_unitario || 0
    const item = body.item_tipo === 'aroma'
      ? aromas.find(a => a.id === +body.item_id)
      : difusores.find(d => d.id === +body.item_id)
    const nuevo = {
      ...m,
      tipo: 'entrada',
      fecha: new Date().toISOString(),
      item_tipo: body.item_tipo,
      item_id: +body.item_id,
      item_nombre: item?.nombre || body.item_nombre,
      item_codigo: item?.codigo,
      cantidad,
      unidad: body.unidad,
      costo_unitario: costoUnitario,
      costo_total: +(cantidad * costoUnitario).toFixed(2),
      cantidad_consumida: 0,
      proveedor: body.proveedor || null,
      motivo: body.motivo,
      referencia: body.referencia,
      operador: body.operador,
    }
    movimientos.unshift(nuevo)
    // Actualizar stock del item
    if (item) {
      if (body.item_tipo === 'aroma') {
        item.stock_litros = +(item.stock_litros + cantidad).toFixed(2)
        item.stock_status = item.stock_litros < item.stock_minimo * 0.5 ? 'critico' : item.stock_litros < item.stock_minimo ? 'bajo' : 'ok'
      } else {
        item.stock = item.stock + cantidad
      }
      item.ultimo_movimiento = nuevo.fecha
    }
    return nuevo
  }
  if (path === '/inventarios/salidas' && method === 'POST') {
    const cantidad = +body.cantidad
    const precioUnitario = +body.precio_unitario || 0
    const item = body.item_tipo === 'aroma'
      ? aromas.find(a => a.id === +body.item_id)
      : difusores.find(d => d.id === +body.item_id)

    // Validar stock disponible
    const preview = previewFIFO(body.item_tipo, +body.item_id, cantidad)
    if (!preview || !preview.suficiente) {
      return {
        error: 'Stock insuficiente',
        disponible: preview?.cantidad_disponible || 0,
        solicitado: cantidad,
        faltante: preview?.faltante || cantidad,
      }
    }

    // Aplicar consumo FIFO
    const fifo = aplicarFIFO(body.item_tipo, +body.item_id, cantidad)
    const precioTotal = +(cantidad * precioUnitario).toFixed(2)
    const esVenta = body.motivo === 'Venta cliente' && precioUnitario > 0
    const utilidad = esVenta ? +(precioTotal - fifo.costo_total).toFixed(2) : -fifo.costo_total
    const margenPct = esVenta && precioTotal > 0 ? +((utilidad / precioTotal) * 100).toFixed(1) : null

    const m = newMov()
    const nuevo = {
      ...m,
      tipo: 'salida',
      fecha: new Date().toISOString(),
      item_tipo: body.item_tipo,
      item_id: +body.item_id,
      item_nombre: item?.nombre || body.item_nombre,
      item_codigo: item?.codigo,
      cantidad,
      unidad: body.unidad,
      precio_unitario: esVenta ? precioUnitario : 0,
      precio_total: esVenta ? precioTotal : 0,
      costo_total: fifo.costo_total,
      costo_promedio: +(fifo.costo_total / cantidad).toFixed(2),
      utilidad,
      margen_pct: margenPct,
      lotes_consumidos: fifo.consumidos,
      cliente: body.cliente || null,
      motivo: body.motivo,
      referencia: body.referencia,
      operador: body.operador,
    }
    movimientos.unshift(nuevo)
    // Actualizar stock
    if (item) {
      if (body.item_tipo === 'aroma') {
        item.stock_litros = +(item.stock_litros - cantidad).toFixed(2)
        item.stock_status = item.stock_litros < item.stock_minimo * 0.5 ? 'critico' : item.stock_litros < item.stock_minimo ? 'bajo' : 'ok'
      } else {
        item.stock = item.stock - cantidad
      }
      item.ultimo_movimiento = nuevo.fecha
    }
    return nuevo
  }

  // Finanzas
  if (path === '/finanzas/cxc') return cxc
  if (path === '/finanzas/cxp') return cxp
  if (path === '/finanzas/flujo') return flujoMensual
  if (path === '/finanzas/antiguedad-cxc') return calcAntiguedad(cxc)
  if (path === '/finanzas/antiguedad-cxp') return calcAntiguedad(cxp)
  if (path === '/finanzas/kpis') {
    const ingresoMes = flujoMensual[flujoMensual.length - 1].ingresos
    const egresoMes = flujoMensual[flujoMensual.length - 1].egresos
    return {
      cxc_total: cxc.reduce((s, x) => s + x.monto_pendiente, 0),
      cxp_total: cxp.reduce((s, x) => s + x.monto_pendiente, 0),
      cxc_vencido: cxc.filter(x => x.status === 'vencido').reduce((s, x) => s + x.monto_pendiente, 0),
      cxp_vencido: cxp.filter(x => x.status === 'vencido').reduce((s, x) => s + x.monto_pendiente, 0),
      ingresos_mes: ingresoMes,
      egresos_mes: egresoMes,
      utilidad_mes: ingresoMes - egresoMes,
      facturas_vencidas: cxc.filter(x => x.status === 'vencido').length,
    }
  }

  // Tickets
  if (path === '/tickets') return tickets
  if (path.startsWith('/tickets/') && method === 'GET') {
    const id = +path.split('/').pop()
    return tickets.find(t => t.id === id)
  }
  if (path.startsWith('/tickets/') && method === 'PATCH') {
    const id = +path.split('/').pop()
    const t = tickets.find(t => t.id === id)
    if (t) Object.assign(t, body, { fecha_actualizacion: new Date().toISOString() })
    return t
  }
  if (path === '/tickets' && method === 'POST') {
    const nuevo = {
      id: tickets.length + 1,
      folio: `TKT-${5000 + tickets.length}`,
      fecha: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      status: 'abierto',
      asignado: null,
      sla_horas: { alta: 4, media: 12, baja: 24 }[body.prioridad] || 12,
      horas_abierto: 0,
      mensajes: [{
        autor: 'cliente',
        nombre: body.cliente?.split('—')[0]?.trim() || 'Cliente',
        texto: body.mensaje || body.descripcion || body.asunto,
        fecha: new Date().toISOString(),
      }],
      ...body,
    }
    tickets.unshift(nuevo)
    return nuevo
  }

  // Logística
  if (path === '/logistica/viajes') return viajes
  if (path === '/logistica/ciudades') return CIUDADES
  if (path === '/logistica/cotizaciones' && method === 'POST') {
    const cot = calcCotizacion(body.origen_id, body.destino_id, body.tipo)
    return cot
  }

  // Rutas
  if (path === '/rutas/clientes') return clientesRutas
  if (path === '/rutas/zonas') return resumenZonas()
  if (path === '/rutas/operadores') return OPERADORES
  if (path === '/rutas/reportes') return reportesOperador
  if (path === '/rutas/visitas' && method === 'POST') {
    const reporte = {
      id: reportesOperador.length + 1,
      folio: `RPT-${6000 + reportesOperador.length}`,
      fecha: new Date().toISOString(),
      ...body,
    }
    reportesOperador.unshift(reporte)
    // actualizar cliente
    const cliente = clientesRutas.find(c => c.id === body.cliente_id)
    if (cliente) {
      cliente.ultima_visita = new Date().toISOString()
      cliente.dias_ultima_visita = 0
      cliente.aceite_restante_pct = body.aceite_restante_pct
      cliente.status_visita = 'al_dia'
    }
    return reporte
  }

  // Alertas
  if (path === '/alertas') return generarAlertas()
  if (path.startsWith('/alertas/') && method === 'POST') {
    // Ejecutar acción de alerta (mock: solo devolvemos confirmación)
    return { ok: true, ejecutada: true, fecha: new Date().toISOString() }
  }

  // Ventas
  if (path === '/ventas/prospectos') return prospectos
  if (path === '/ventas/campanas') return campanas
  if (path === '/ventas/kpis') {
    return {
      prospectos_total: prospectos.length,
      prospectos_nuevos: prospectos.filter(p => p.status === 'nuevo').length,
      citas_agendadas: prospectos.filter(p => p.status === 'cita_agendada').length,
      cerrados: prospectos.filter(p => p.status === 'cerrado').length,
      pipeline: prospectos.filter(p => p.status !== 'descartado' && p.status !== 'cerrado').reduce((s, p) => s + p.valor_estimado, 0),
      tasa_apertura: Math.round(prospectos.filter(p => p.abierto).length / Math.max(1, prospectos.filter(p => p.emails_enviados > 0).length) * 100),
      tasa_respuesta: Math.round(prospectos.filter(p => p.respondio).length / Math.max(1, prospectos.length) * 100),
    }
  }
  if (path === '/ventas/oportunidades-zona') {
    // Cruce con rutas: zonas con baja densidad donde el operador ya viaja
    const zonas = resumenZonas()
    return zonas
      .filter(z => z.clientes_total < 5)
      .map(z => ({
        zona: z,
        prospectos_disponibles: prospectos.filter(p => p.zona_id === z.id && p.status === 'nuevo').length,
        ahorro_logistico: 'El operador ya pasa por aquí',
      }))
  }

  return null
}

// Export raw data para usos especiales (dashboards globales)
export const rawData = {
  aromas, difusores, movimientos, cxc, cxp, tickets,
  ciudades: CIUDADES, viajes, zonas: ZONAS, clientesRutas, operadores: OPERADORES, reportesOperador,
  prospectos, campanas,
}
