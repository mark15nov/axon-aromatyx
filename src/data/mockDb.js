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

// ─────────── LOGÍSTICA — Viajes foráneos del operador ───────────
// El módulo cotiza transporte + hospedaje + viáticos para que un operador
// salga de CDMX a atender clientes en otra ciudad.

const ORIGEN_BASE = { id: 'cdmx', nombre: 'Ciudad de México', estado: 'CDMX', lat: 19.4326, lng: -99.1332 }

// Destinos foráneos (excluye CDMX como destino) con km aprox a CDMX
const CIUDADES = [
  ORIGEN_BASE,
  { id: 'gdl', nombre: 'Guadalajara',     estado: 'Jalisco',    lat: 20.6597, lng: -103.3496, km_a_cdmx: 555 },
  { id: 'mty', nombre: 'Monterrey',       estado: 'NL',         lat: 25.6866, lng: -100.3161, km_a_cdmx: 925 },
  { id: 'pue', nombre: 'Puebla',          estado: 'Puebla',     lat: 19.0414, lng: -98.2063,  km_a_cdmx: 130 },
  { id: 'qro', nombre: 'Querétaro',       estado: 'Querétaro',  lat: 20.5888, lng: -100.3899, km_a_cdmx: 215 },
  { id: 'leo', nombre: 'León',            estado: 'Guanajuato', lat: 21.1250, lng: -101.6859, km_a_cdmx: 385 },
  { id: 'tij', nombre: 'Tijuana',         estado: 'BC',         lat: 32.5149, lng: -117.0382, km_a_cdmx: 2740 },
  { id: 'mer', nombre: 'Mérida',          estado: 'Yucatán',    lat: 20.9674, lng: -89.5926,  km_a_cdmx: 1320 },
  { id: 'cun', nombre: 'Cancún',          estado: 'QR',         lat: 21.1619, lng: -86.8515,  km_a_cdmx: 1620 },
  { id: 'tol', nombre: 'Toluca',          estado: 'Edomex',     lat: 19.2826, lng: -99.6557,  km_a_cdmx: 65 },
  { id: 'agu', nombre: 'Aguascalientes',  estado: 'Ags',        lat: 21.8853, lng: -102.2916, km_a_cdmx: 510 },
  { id: 'sld', nombre: 'San Luis Potosí', estado: 'SLP',        lat: 22.1565, lng: -100.9855, km_a_cdmx: 415 },
  { id: 'chi', nombre: 'Chihuahua',       estado: 'Chih',       lat: 28.6353, lng: -106.0889, km_a_cdmx: 1500 },
  { id: 'her', nombre: 'Hermosillo',      estado: 'Sonora',     lat: 29.0729, lng: -110.9559, km_a_cdmx: 1985 },
  { id: 'ver', nombre: 'Veracruz',        estado: 'Veracruz',   lat: 19.1738, lng: -96.1342,  km_a_cdmx: 400 },
]

// Tarifas de vuelo redondo CDMX → ciudad (precio aprox MXN, jul 2026)
const TARIFAS_VUELO = {
  gdl: 2400, mty: 3200, pue: 1800, qro: 1900, leo: 2400,
  tij: 4500, mer: 4200, cun: 4800, tol: 1500, agu: 2700,
  sld: 2600, chi: 4100, her: 4400, ver: 2300,
}
// Tarifas de autobús redondo (ETN/Primera Plus aprox)
const TARIFAS_BUS = {
  gdl: 1800, mty: 2400, pue: 600, qro: 700, leo: 1300,
  tij: 4200, mer: 3200, cun: 3800, tol: 320, agu: 1700,
  sld: 1500, chi: 3600, her: 4000, ver: 1200,
}

// Tarifas hotel por noche
const TARIFAS_HOTEL = {
  '3': { label: '3 estrellas', precio_noche: 1400 },
  '4': { label: '4 estrellas', precio_noche: 2000 },
  '5': { label: '5 estrellas', precio_noche: 3200 },
}

// Categorías de transporte
const TIPOS_TRANSPORTE = [
  { id: 'vuelo_redondo',  label: 'Vuelo redondo',     desc: 'Avión ida y vuelta — más rápido, ideal foráneos lejanos' },
  { id: 'autobus_redondo',label: 'Autobús redondo',   desc: 'Primera clase ETN/Primera Plus — económico' },
  { id: 'auto_rentado',   label: 'Auto rentado',      desc: 'Hertz/Sixt — flexibilidad para varios clientes' },
  { id: 'vehiculo_propio',label: 'Vehículo de empresa', desc: 'Reembolso por gasolina + casetas + desgaste' },
]

// Tarifas auto (rentado y propio)
const TARIFA_AUTO_RENTA_DIA  = 1200      // costo renta por día
const TARIFA_GASOLINA_AUTO   = 2.4       // $/km (Hyundai Accent ~10 km/L con gasolina ~$24/L)
const TARIFA_CASETAS_KM      = 0.6       // $/km aprox
const VIATICOS_DIARIOS_DEFAULT = 600     // comidas + incidentales

// Cotizador
const calcCotizacionViaje = (input) => {
  const {
    destino_id,
    fecha_salida,           // ISO
    fecha_regreso,          // ISO
    transporte,             // 'vuelo_redondo' | 'autobus_redondo' | 'auto_rentado' | 'vehiculo_propio'
    categoria_hotel = '4',  // '3' | '4' | '5'
    viaticos_diarios = VIATICOS_DIARIOS_DEFAULT,
    incluye_hotel = true,
    operador_id = null,
  } = input || {}

  const destino = CIUDADES.find(c => c.id === destino_id)
  if (!destino || destino.id === 'cdmx') return null

  const f1 = new Date(fecha_salida)
  const f2 = new Date(fecha_regreso)
  if (isNaN(f1) || isNaN(f2) || f2 < f1) return null
  const dias = Math.max(1, Math.ceil((f2 - f1) / 86400000) + 1) // incluye día de salida y regreso
  const noches = Math.max(0, dias - 1)
  const km = destino.km_a_cdmx || 0

  // Transporte
  let costoTransporte = 0
  let detalleTransporte = ''
  switch (transporte) {
    case 'vuelo_redondo':
      costoTransporte = TARIFAS_VUELO[destino.id] || 3000
      detalleTransporte = `Vuelo redondo CDMX ↔ ${destino.nombre}`
      break
    case 'autobus_redondo':
      costoTransporte = TARIFAS_BUS[destino.id] || 1500
      detalleTransporte = `Autobús redondo primera clase`
      break
    case 'auto_rentado': {
      const renta    = TARIFA_AUTO_RENTA_DIA * dias
      const gasolina = Math.round(km * 2 * TARIFA_GASOLINA_AUTO) // ida y vuelta
      const casetas  = Math.round(km * 2 * TARIFA_CASETAS_KM)
      costoTransporte = renta + gasolina + casetas
      detalleTransporte = `Auto rentado ${dias}d (${fmtAux.k(renta)}) + gasolina ${km*2}km (${fmtAux.k(gasolina)}) + casetas (${fmtAux.k(casetas)})`
      break
    }
    case 'vehiculo_propio': {
      const gasolina = Math.round(km * 2 * TARIFA_GASOLINA_AUTO)
      const casetas  = Math.round(km * 2 * TARIFA_CASETAS_KM)
      const desgaste = Math.round(km * 2 * 1.2) // $1.2/km de desgaste
      costoTransporte = gasolina + casetas + desgaste
      detalleTransporte = `Reembolso ${km*2}km · gasolina + casetas + desgaste`
      break
    }
    default:
      costoTransporte = 0
  }

  // Hospedaje
  const tarifaHotel = TARIFAS_HOTEL[String(categoria_hotel)] || TARIFAS_HOTEL['4']
  const costoHotel  = incluye_hotel ? tarifaHotel.precio_noche * noches : 0

  // Viáticos
  const costoViaticos = viaticos_diarios * dias

  const subtotal = costoTransporte + costoHotel + costoViaticos
  const iva      = Math.round(subtotal * 0.16)
  const total    = subtotal + iva

  return {
    origen: ORIGEN_BASE,
    destino,
    operador_id,
    fecha_salida, fecha_regreso,
    dias, noches, km_aprox: km,
    transporte: { tipo: transporte, label: TIPOS_TRANSPORTE.find(t => t.id === transporte)?.label, costo: costoTransporte, detalle: detalleTransporte },
    hospedaje:  { categoria: String(categoria_hotel), label: tarifaHotel.label, noches, precio_noche: tarifaHotel.precio_noche, costo: costoHotel, incluido: incluye_hotel },
    viaticos:   { diarios: viaticos_diarios, dias, costo: costoViaticos },
    subtotal, iva, total,
  }
}

// helper para los strings del detalle
const fmtAux = {
  k: (n) => `$${Math.round(n).toLocaleString('es-MX')}`,
}

// ─── Viajes históricos / agendados ───
const _operadoresNames = ['Mario Sánchez', 'Luis Gómez', 'Carlos Pérez', 'Diego Hernández', 'Roberto Cruz']
const PROPOSITOS_VIAJE = [
  'Visita técnica + recargas',
  'Implementación nuevo cliente',
  'Mantenimiento preventivo trimestral',
  'Auditoría de equipos en sitio',
  'Capacitación operativa al staff',
  'Atención a falla reportada',
]
const viajes = Array.from({ length: 12 }, (_, i) => {
  const destino = CIUDADES.filter(c => c.id !== 'cdmx')[i % (CIUDADES.length - 1)]
  const transporte = ['vuelo_redondo', 'autobus_redondo', 'auto_rentado', 'vehiculo_propio'][i % 4]
  const categoria_hotel = ['3', '4', '5'][i % 3]
  const fechaSalida = new Date(Date.now() + (i - 4) * 3 * 86400000)
  const dias = [2, 3, 4, 2, 5, 3][i % 6]
  const fechaRegreso = new Date(fechaSalida.getTime() + (dias - 1) * 86400000)
  const cot = calcCotizacionViaje({
    destino_id: destino.id,
    fecha_salida: fechaSalida.toISOString(),
    fecha_regreso: fechaRegreso.toISOString(),
    transporte,
    categoria_hotel,
  })
  const status = i < 3 ? 'completado' : i < 5 ? 'en_curso' : i < 9 ? 'agendado' : 'cotización'
  return {
    id: i + 1,
    folio: `VJ-${3000 + i}`,
    operador: _operadoresNames[i % _operadoresNames.length],
    operador_id: (i % 5) + 1,
    proposito: PROPOSITOS_VIAJE[i % PROPOSITOS_VIAJE.length],
    clientes_visitar: Math.floor(Math.random() * 4) + 2,
    fecha_salida: fechaSalida.toISOString(),
    fecha_regreso: fechaRegreso.toISOString(),
    dias: cot.dias,
    noches: cot.noches,
    destino: cot.destino,
    transporte: cot.transporte,
    hospedaje: cot.hospedaje,
    viaticos: cot.viaticos,
    subtotal: cot.subtotal,
    iva: cot.iva,
    total: cot.total,
    status,
  }
})

// ─────────── RUTAS ───────────
// Clientes geolocalizados en CDMX y zona metropolitana, además de otras ciudades
// Zonas locales (CDMX/Edomex) y zonas foráneas (otras ciudades)
const ZONAS = [
  // Locales — CDMX
  { id: 'polanco',      nombre: 'Polanco',              color: '#c2592b', lat: 19.4338, lng: -99.1934, foranea: false, ciudad: 'CDMX' },
  { id: 'roma_condesa', nombre: 'Roma · Condesa',       color: '#7fa37b', lat: 19.4145, lng: -99.1665, foranea: false, ciudad: 'CDMX' },
  { id: 'santa_fe',     nombre: 'Santa Fe',             color: '#9871a8', lat: 19.3622, lng: -99.2596, foranea: false, ciudad: 'CDMX' },
  { id: 'centro',       nombre: 'Centro Histórico',     color: '#e8829c', lat: 19.4326, lng: -99.1332, foranea: false, ciudad: 'CDMX' },
  { id: 'coyoacan',     nombre: 'Coyoacán · Del Valle', color: '#e57c5f', lat: 19.3467, lng: -99.1618, foranea: false, ciudad: 'CDMX' },
  { id: 'satelite',     nombre: 'Satélite · Interlomas',color: '#62a890', lat: 19.5099, lng: -99.2342, foranea: false, ciudad: 'CDMX' },
  { id: 'aeropuerto',   nombre: 'Aeropuerto · Oriente', color: '#c8a34a', lat: 19.4361, lng: -99.0719, foranea: false, ciudad: 'CDMX' },
  { id: 'sur',          nombre: 'Sur · Tlalpan',        color: '#5d9bbf', lat: 19.2925, lng: -99.1663, foranea: false, ciudad: 'CDMX' },
  // Foráneas — otras ciudades
  { id: 'gdl_centro',   nombre: 'Guadalajara Centro',   color: '#d29c4f', lat: 20.6597, lng: -103.3496, foranea: true, ciudad: 'Guadalajara', ciudad_id: 'gdl' },
  { id: 'mty_centro',   nombre: 'Monterrey San Pedro',  color: '#9871a8', lat: 25.6500, lng: -100.4030, foranea: true, ciudad: 'Monterrey',   ciudad_id: 'mty' },
  { id: 'pue_centro',   nombre: 'Puebla Centro',        color: '#7fa37b', lat: 19.0414, lng: -98.2063,  foranea: true, ciudad: 'Puebla',      ciudad_id: 'pue' },
  { id: 'qro_centro',   nombre: 'Querétaro Juriquilla', color: '#e8829c', lat: 20.7170, lng: -100.4420, foranea: true, ciudad: 'Querétaro',   ciudad_id: 'qro' },
  { id: 'leo_centro',   nombre: 'León Centro',          color: '#c2592b', lat: 21.1250, lng: -101.6859, foranea: true, ciudad: 'León',        ciudad_id: 'leo' },
  { id: 'cun_zona',     nombre: 'Cancún Hotelera',      color: '#5d9bbf', lat: 21.1330, lng: -86.7457,  foranea: true, ciudad: 'Cancún',      ciudad_id: 'cun' },
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

  // ─── Foráneos ───
  // Guadalajara
  { nombre: 'Hotel Riu Plaza Guadalajara',  zona: 'gdl_centro', lat: 20.6750, lng: -103.4058, equipos: 6 },
  { nombre: 'Andares Centro Comercial',     zona: 'gdl_centro', lat: 20.7148, lng: -103.4155, equipos: 9 },
  { nombre: 'Hospital Puerta de Hierro',    zona: 'gdl_centro', lat: 20.7212, lng: -103.4380, equipos: 7 },
  { nombre: 'Hotel Demetria',               zona: 'gdl_centro', lat: 20.6795, lng: -103.3915, equipos: 4 },
  { nombre: 'Plaza Galerías Guadalajara',   zona: 'gdl_centro', lat: 20.6790, lng: -103.4117, equipos: 8 },
  { nombre: 'Liverpool Galerías GDL',       zona: 'gdl_centro', lat: 20.6798, lng: -103.4120, equipos: 5 },
  // Monterrey
  { nombre: 'Hotel Quinta Real Monterrey',  zona: 'mty_centro', lat: 25.6536, lng: -100.4123, equipos: 5 },
  { nombre: 'Galerías Valle Oriente',       zona: 'mty_centro', lat: 25.6320, lng: -100.3623, equipos: 11 },
  { nombre: 'Hospital Zambrano Hellion',    zona: 'mty_centro', lat: 25.6510, lng: -100.2866, equipos: 8 },
  { nombre: 'Hotel Ancira',                 zona: 'mty_centro', lat: 25.6700, lng: -100.3093, equipos: 4 },
  { nombre: 'Plaza Fiesta San Agustín',     zona: 'mty_centro', lat: 25.6505, lng: -100.3110, equipos: 7 },
  // Puebla
  { nombre: 'Hotel Mesón Sacristía',        zona: 'pue_centro', lat: 19.0440, lng: -98.2018, equipos: 3 },
  { nombre: 'Angelópolis Lifestyle Center', zona: 'pue_centro', lat: 19.0319, lng: -98.2358, equipos: 9 },
  { nombre: 'Hospital Ángeles Puebla',      zona: 'pue_centro', lat: 19.0298, lng: -98.2407, equipos: 7 },
  { nombre: 'Hotel La Purificadora',        zona: 'pue_centro', lat: 19.0490, lng: -98.2080, equipos: 4 },
  // Querétaro
  { nombre: 'Hotel Galería Plaza',          zona: 'qro_centro', lat: 20.5878, lng: -100.3902, equipos: 4 },
  { nombre: 'Hospital Ángeles Querétaro',   zona: 'qro_centro', lat: 20.6052, lng: -100.4100, equipos: 7 },
  { nombre: 'Antea Lifestyle Center',       zona: 'qro_centro', lat: 20.7054, lng: -100.4399, equipos: 10 },
  { nombre: 'Hotel Mirabel Querétaro',      zona: 'qro_centro', lat: 20.5900, lng: -100.3950, equipos: 3 },
  // León
  { nombre: 'Hotel Real de Minas León',     zona: 'leo_centro', lat: 21.1335, lng: -101.6890, equipos: 4 },
  { nombre: 'Plaza Mayor León',             zona: 'leo_centro', lat: 21.1090, lng: -101.6855, equipos: 8 },
  { nombre: 'Hospital Aranda de la Parra',  zona: 'leo_centro', lat: 21.1290, lng: -101.6680, equipos: 6 },
  // Cancún
  { nombre: 'Hotel Krystal Cancún',         zona: 'cun_zona',   lat: 21.1340, lng: -86.7475, equipos: 8 },
  { nombre: 'Plaza La Isla Cancún',         zona: 'cun_zona',   lat: 21.1374, lng: -86.7461, equipos: 7 },
  { nombre: 'Hospital Galenia Cancún',      zona: 'cun_zona',   lat: 21.1421, lng: -86.8330, equipos: 5 },
  { nombre: 'Hotel Coral Beach Cancún',     zona: 'cun_zona',   lat: 21.1287, lng: -86.7497, equipos: 6 },
]

// Operadores — ahora con zonas locales + foráneas asignadas
const OPERADORES = [
  { id: 1, nombre: 'Mario Sánchez',     zonas: ['polanco', 'centro', 'gdl_centro'],         avatar: 'MS', activo: true,  base: 'CDMX' },
  { id: 2, nombre: 'Luis Gómez',        zonas: ['santa_fe', 'satelite', 'qro_centro', 'leo_centro'], avatar: 'LG', activo: true, base: 'CDMX' },
  { id: 3, nombre: 'Carlos Pérez',      zonas: ['roma_condesa', 'sur', 'pue_centro'],       avatar: 'CP', activo: true,  base: 'CDMX' },
  { id: 4, nombre: 'Diego Hernández',   zonas: ['coyoacan', 'aeropuerto', 'mty_centro', 'cun_zona'], avatar: 'DH', activo: true, base: 'CDMX' },
  { id: 5, nombre: 'Roberto Cruz',      zonas: [],                                          avatar: 'RC', activo: false, base: 'CDMX' },
]

// Tiempo de servicio por equipo (minutos) — usado por optimizador
const MINUTOS_POR_EQUIPO = 12
const MINUTOS_FIJO_POR_CLIENTE = 8 // setup, papeleo, traslado dentro del edificio

// Calcula score de prioridad 0-100 (mayor = más urgente)
function calcPrioridad(c) {
  const aceiteUrgencia = (100 - (c.aceite_restante_pct ?? 100)) / 100   // 0..1
  const visitaUrgencia = Math.min((c.dias_ultima_visita ?? 0) / 35, 1)  // 0..1 (35d = max)
  const tamañoFactor   = Math.min((c.equipos ?? 1) / 12, 1)             // 0..1 (12 equipos = max)
  const score =
      40 * aceiteUrgencia
    + 35 * visitaUrgencia
    + 15 * tamañoFactor
    + 10 * (c.dias_ultima_visita > 30 ? 1 : 0) // mínimo 1 vez al mes
  return Math.round(Math.min(100, score))
}

// Generar clientes con metadata de visita
const clientesRutas = CLIENTES_RUTAS.map((c, i) => {
  const z = ZONAS.find(z => z.id === c.zona)
  const op = OPERADORES.find(o => o.zonas.includes(c.zona))
  // Foráneos visitados con menos frecuencia → más días desde última visita
  const maxDias = z?.foranea ? 60 : 45
  const diasUltimaVisita = Math.floor(Math.random() * maxDias)
  const aceiteRestante = Math.round(Math.random() * 100)
  const status = diasUltimaVisita > 35 ? 'urgente' : diasUltimaVisita > 28 ? 'pendiente' : 'al_dia'
  const baseObj = {
    id: i + 1,
    codigo: `CL-${String(1000 + i).padStart(4, '0')}`,
    nombre: c.nombre,
    zona_id: c.zona,
    zona_nombre: z?.nombre,
    zona_color: z?.color,
    zona_foranea: !!z?.foranea,
    ciudad: z?.ciudad || 'CDMX',
    lat: c.lat, lng: c.lng,
    equipos: c.equipos,
    operador_asignado: op?.nombre || 'Sin asignar',
    operador_id: op?.id,
    ultima_visita: new Date(Date.now() - diasUltimaVisita * 86400000).toISOString(),
    dias_ultima_visita: diasUltimaVisita,
    aceite_restante_pct: aceiteRestante,
    status_visita: status,
    proxima_visita: new Date(Date.now() + Math.max(0, 30 - diasUltimaVisita) * 86400000).toISOString(),
    tiempo_servicio_min: c.equipos * MINUTOS_POR_EQUIPO + MINUTOS_FIJO_POR_CLIENTE,
  }
  return { ...baseObj, prioridad_score: calcPrioridad(baseObj) }
})

// ─────────── INCIDENTES ───────────
// Incidentes en clientes que pueden afectar la ruta del día
const TIPOS_INCIDENTE = [
  { id: 'cliente_cerrado',    label: 'Cliente cerrado',           desc: 'El sitio no abre hoy' },
  { id: 'falla_equipo',       label: 'Falla de equipo',           desc: 'Reportó un difusor con falla — requiere refacción' },
  { id: 'cancelacion',        label: 'Cliente canceló',           desc: 'Pidió reagendar' },
  { id: 'acceso_denegado',    label: 'Acceso denegado',           desc: 'Seguridad no permite entrar sin cita' },
  { id: 'operador_indispuesto',label:'Operador indispuesto',      desc: 'Reasignar zona' },
]

const incidentes = Array.from({ length: 6 }, (_, i) => {
  const cliente = clientesRutas[Math.floor(Math.random() * clientesRutas.length)]
  const tipo = TIPOS_INCIDENTE[i % TIPOS_INCIDENTE.length]
  const fecha = new Date(Date.now() - i * 86400000 * 0.3).toISOString()
  return {
    id: i + 1,
    folio: `INC-${7000 + i}`,
    tipo: tipo.id,
    tipo_label: tipo.label,
    descripcion: tipo.desc,
    cliente_id: cliente.id,
    cliente_nombre: cliente.nombre,
    zona_id: cliente.zona_id,
    zona_nombre: cliente.zona_nombre,
    operador: cliente.operador_asignado,
    fecha,
    resuelto: i > 2,
  }
})

// ─────────── OPTIMIZADOR DE RUTAS ───────────
// Distancia haversine (en km)
function distKm(a, b) {
  const R = 6371
  const toRad = x => x * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// Optimizador de ruta DENTRO de una zona.
// Filosofía:
//   1) `minScore` y `excluidos` deciden QUÉ clientes entran a la ruta (capa de prioridad).
//   2) Una vez seleccionados, el orden se calcula por proximidad geográfica pura
//      (nearest-neighbor sobre distancia haversine) — sin pesos de prioridad.
// Esto evita zig-zags: dentro de la ruta solo importa minimizar km/tiempo de traslado.
function optimizarRutaZona(zonaId, opciones = {}) {
  const {
    fecha = new Date().toISOString(),
    operadorId = null,
    excluidos = [],   // ids de clientes a excluir (incidentes)
    minScore = 0,     // capa de prioridad: solo clientes con score >= minScore
  } = opciones
  const zona = ZONAS.find(z => z.id === zonaId)
  if (!zona) return null

  const clientesZona = clientesRutas
    .filter(c => c.zona_id === zonaId)
    .filter(c => !excluidos.includes(c.id))
    .filter(c => c.prioridad_score >= minScore)

  if (clientesZona.length === 0) return null

  // Punto de partida: el centroide de la zona (en producción sería el origen del operador)
  const start = { lat: zona.lat, lng: zona.lng }

  // Nearest-neighbor PURO — solo distancia, sin pesos de prioridad
  const restantes = [...clientesZona]
  const ordenados = []
  let actual = start
  let kmTotal = 0

  while (restantes.length > 0) {
    let mejorIdx = 0
    let mejorDist = Infinity
    for (let i = 0; i < restantes.length; i++) {
      const d = distKm(actual, restantes[i])
      if (d < mejorDist) {
        mejorDist = d
        mejorIdx = i
      }
    }
    const elegido = restantes.splice(mejorIdx, 1)[0]
    kmTotal += mejorDist
    ordenados.push({
      ...elegido,
      orden: ordenados.length + 1,
      km_desde_anterior: +mejorDist.toFixed(2),
    })
    actual = elegido
  }
  // Regreso a base (centroide zona)
  kmTotal += distKm(actual, start)

  const tiempoServicioMin = ordenados.reduce((s, c) => s + c.tiempo_servicio_min, 0)
  const tiempoTrasladoMin = Math.round((kmTotal / 25) * 60) // 25 km/h promedio en ciudad
  const tiempoTotalMin    = tiempoServicioMin + tiempoTrasladoMin

  // Costo estimado: gasolina + viáticos (si foránea, requiere viaje en logística)
  const costoGasolina = Math.round(kmTotal * 2.4) // $2.4/km
  const costoCasetas  = zona.foranea ? 0 : Math.round(kmTotal * 0.15)

  return {
    zona,
    fecha,
    operador_id: operadorId,
    clientes: ordenados,
    total_clientes: ordenados.length,
    total_equipos: ordenados.reduce((s, c) => s + c.equipos, 0),
    km_total: +kmTotal.toFixed(2),
    tiempo_servicio_min: tiempoServicioMin,
    tiempo_traslado_min: tiempoTrasladoMin,
    tiempo_total_min: tiempoTotalMin,
    tiempo_total_horas: +(tiempoTotalMin / 60).toFixed(1),
    costo_gasolina: costoGasolina,
    costo_casetas: costoCasetas,
    cabe_en_dia: tiempoTotalMin <= 8 * 60, // 8 hrs de jornada
    score_promedio: Math.round(ordenados.reduce((s, c) => s + c.prioridad_score, 0) / ordenados.length),
  }
}

// Plan semanal automático: genera rutas optimizadas para los próximos 5 días laborales
function planSemanal(diasAdelante = 5) {
  // Priorizar zonas con más clientes urgentes
  const zonasOrdenadas = ZONAS
    .map(z => {
      const clientesUrgentes = clientesRutas.filter(c => c.zona_id === z.id && c.prioridad_score >= 50).length
      const promedioPrioridad = clientesRutas
        .filter(c => c.zona_id === z.id)
        .reduce((s, c, _, arr) => s + (c.prioridad_score / arr.length), 0)
      return { ...z, clientesUrgentes, promedioPrioridad }
    })
    .sort((a, b) => b.promedioPrioridad - a.promedioPrioridad)

  const plan = []
  const hoy = new Date()
  let zonaIdx = 0

  for (let dia = 0; dia < diasAdelante && zonaIdx < zonasOrdenadas.length; dia++) {
    const fecha = new Date(hoy.getTime() + dia * 86400000)
    // Saltar fines de semana
    while (fecha.getDay() === 0 || fecha.getDay() === 6) fecha.setDate(fecha.getDate() + 1)

    const zona = zonasOrdenadas[zonaIdx]
    const ruta = optimizarRutaZona(zona.id, {
      fecha: fecha.toISOString(),
      minScore: 30, // solo clientes que vale la pena visitar
    })
    if (ruta && ruta.total_clientes > 0) {
      plan.push({
        dia: dia + 1,
        fecha: fecha.toISOString(),
        ...ruta,
      })
    }
    zonaIdx++
  }
  return plan
}

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
    const promedioPrio = clientesZona.length
      ? Math.round(clientesZona.reduce((s, c) => s + c.prioridad_score, 0) / clientesZona.length)
      : 0
    const promedioAceite = clientesZona.length
      ? Math.round(clientesZona.reduce((s, c) => s + c.aceite_restante_pct, 0) / clientesZona.length)
      : 0
    return {
      ...z,
      clientes_total: clientesZona.length,
      equipos_total: clientesZona.reduce((s, c) => s + c.equipos, 0),
      visitas_pendientes: clientesZona.filter(c => c.status_visita !== 'al_dia').length,
      visitas_urgentes: clientesZona.filter(c => c.status_visita === 'urgente').length,
      operador: op?.nombre || 'Sin asignar',
      operador_id: op?.id,
      prioridad_promedio: promedioPrio,
      aceite_promedio: promedioAceite,
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
  if (path === '/inventarios/aromas' && method === 'GET') return aromas
  if (path.startsWith('/inventarios/aromas/') && method === 'GET') {
    const id = +path.split('/').pop()
    return aromas.find(a => a.id === id)
  }
  if (path === '/inventarios/aromas' && method === 'POST') {
    const FAMILIAS = ['Floral', 'Cítrica', 'Amaderada', 'Especiada', 'Frutal', 'Herbal', 'Acuática', 'Dulce']
    const nextId = Math.max(0, ...aromas.map(a => a.id)) + 1
    const stockL = +body.stock_litros || 0
    const minimo = +body.stock_minimo || 15
    const costo = +body.costo_por_litro || 0
    const precio = +body.precio_venta_litro || Math.round(costo * 1.6)
    const nuevo = {
      id: nextId,
      codigo: body.codigo || `AR-${String(nextId).padStart(3, '0')}`,
      nombre: body.nombre,
      familia: FAMILIAS.includes(body.familia) ? body.familia : 'Floral',
      stock_litros: stockL,
      stock_minimo: minimo,
      stock_status: stockL < minimo * 0.5 ? 'critico' : stockL < minimo ? 'bajo' : 'ok',
      costo_por_litro: costo,
      precio_venta_litro: precio,
      ultimo_movimiento: new Date().toISOString(),
    }
    aromas.push(nuevo)
    return nuevo
  }
  if (path.startsWith('/inventarios/aromas/') && method === 'PATCH') {
    const id = +path.split('/').pop()
    const a = aromas.find(x => x.id === id)
    if (!a) return { error: 'Aroma no existe' }
    if (body.nombre != null) a.nombre = body.nombre
    if (body.familia != null) a.familia = body.familia
    if (body.stock_minimo != null) a.stock_minimo = +body.stock_minimo
    if (body.costo_por_litro != null) a.costo_por_litro = +body.costo_por_litro
    if (body.precio_venta_litro != null) a.precio_venta_litro = +body.precio_venta_litro
    a.stock_status = a.stock_litros < a.stock_minimo * 0.5 ? 'critico' : a.stock_litros < a.stock_minimo ? 'bajo' : 'ok'
    return a
  }
  if (path.startsWith('/inventarios/aromas/') && method === 'DELETE') {
    const id = +path.split('/').pop()
    const idx = aromas.findIndex(a => a.id === id)
    if (idx < 0) return { error: 'Aroma no existe' }
    if (aromas[idx].stock_litros > 0) return { error: 'No puedes eliminar un aroma con stock activo' }
    aromas.splice(idx, 1)
    return { ok: true }
  }
  if (path === '/inventarios/difusores' && method === 'GET') return difusores
  if (path === '/inventarios/difusores' && method === 'POST') {
    const nextId = Math.max(0, ...difusores.map(d => d.id)) + 1
    const nuevo = {
      id: nextId,
      codigo: body.codigo || `DIF-${nextId}`,
      nombre: body.nombre,
      tipo: body.tipo || 'chico',
      stock: +body.stock || 0,
      stock_minimo: +body.stock_minimo || 20,
      costo: +body.costo || 0,
      precio: +body.precio || 0,
      cobertura_m2: +body.cobertura_m2 || 80,
      descripcion: body.descripcion || '',
    }
    difusores.push(nuevo)
    return nuevo
  }
  if (path.startsWith('/inventarios/difusores/') && method === 'PATCH') {
    const id = +path.split('/').pop()
    const d = difusores.find(x => x.id === id)
    if (!d) return { error: 'Difusor no existe' }
    Object.assign(d, body, { id: d.id })
    return d
  }
  if (path.startsWith('/inventarios/difusores/') && method === 'DELETE') {
    const id = +path.split('/').pop()
    const idx = difusores.findIndex(d => d.id === id)
    if (idx < 0) return { error: 'Difusor no existe' }
    if (difusores[idx].stock > 0) return { error: 'No puedes eliminar un difusor con stock activo' }
    difusores.splice(idx, 1)
    return { ok: true }
  }
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

  // Logística — viajes foráneos del operador
  if (path === '/logistica/viajes') return viajes
  if (path === '/logistica/ciudades') return CIUDADES.filter(c => c.id !== 'cdmx')
  if (path === '/logistica/origen') return ORIGEN_BASE
  if (path === '/logistica/transportes') return TIPOS_TRANSPORTE
  if (path === '/logistica/hoteles') return Object.entries(TARIFAS_HOTEL).map(([id, h]) => ({ id, ...h }))
  if (path === '/logistica/cotizaciones' && method === 'POST') {
    return calcCotizacionViaje(body)
  }
  if (path === '/logistica/agendar' && method === 'POST') {
    const cot = calcCotizacionViaje(body)
    if (!cot) return { error: 'Datos inválidos' }
    const nuevo = {
      id: viajes.length + 1,
      folio: `VJ-${3000 + viajes.length}`,
      operador: body.operador_nombre || 'Sin asignar',
      operador_id: body.operador_id || null,
      proposito: body.proposito || 'Visita programada',
      clientes_visitar: body.clientes_visitar || 0,
      fecha_salida: cot.fecha_salida,
      fecha_regreso: cot.fecha_regreso,
      dias: cot.dias,
      noches: cot.noches,
      destino: cot.destino,
      transporte: cot.transporte,
      hospedaje: cot.hospedaje,
      viaticos: cot.viaticos,
      subtotal: cot.subtotal,
      iva: cot.iva,
      total: cot.total,
      status: 'agendado',
    }
    viajes.unshift(nuevo)
    return nuevo
  }

  // Rutas
  if (path === '/rutas/clientes') return clientesRutas
  if (path === '/rutas/zonas') return resumenZonas()
  if (path === '/rutas/zonas-raw') return ZONAS // sin agregados (para forms)
  if (path === '/rutas/operadores') return OPERADORES
  if (path === '/rutas/reportes') return reportesOperador
  if (path === '/rutas/incidentes') return incidentes
  if (path === '/rutas/tipos-incidente') return TIPOS_INCIDENTE
  if (path === '/rutas/plan-semanal') return planSemanal(body?.dias || 5)

  // ─── CRUD Operadores ───
  if (path === '/rutas/operadores' && method === 'POST') {
    const initials = (body.nombre || '').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase()
    const nuevo = {
      id: Math.max(0, ...OPERADORES.map(o => o.id)) + 1,
      nombre: body.nombre,
      avatar: body.avatar || initials || 'OP',
      zonas: Array.isArray(body.zonas) ? body.zonas : [],
      activo: body.activo !== false,
      base: body.base || 'CDMX',
    }
    OPERADORES.push(nuevo)
    return nuevo
  }
  if (path.startsWith('/rutas/operadores/') && method === 'PATCH') {
    const id = +path.split('/').pop()
    const op = OPERADORES.find(o => o.id === id)
    if (!op) return { error: 'Operador no existe' }
    Object.assign(op, body)
    if (body.nombre && !body.avatar) {
      op.avatar = body.nombre.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase()
    }
    return op
  }
  if (path.startsWith('/rutas/operadores/') && method === 'DELETE') {
    const id = +path.split('/').pop()
    const idx = OPERADORES.findIndex(o => o.id === id)
    if (idx < 0) return { error: 'Operador no existe' }
    // Verificar que no tenga clientes asignados
    const clientesAsignados = clientesRutas.filter(c => c.operador_id === id).length
    if (clientesAsignados > 0) {
      return { error: `Tiene ${clientesAsignados} clientes asignados. Reasígnalos primero.` }
    }
    OPERADORES.splice(idx, 1)
    return { ok: true }
  }

  // ─── CRUD Clientes ───
  if (path === '/rutas/clientes' && method === 'POST') {
    const z = ZONAS.find(zn => zn.id === body.zona_id)
    const op = OPERADORES.find(o => o.id === +body.operador_id)
      || OPERADORES.find(o => o.zonas.includes(body.zona_id))
    const dias = +body.dias_ultima_visita || 0
    const aceite = body.aceite_restante_pct != null ? +body.aceite_restante_pct : 100
    const status = dias > 35 ? 'urgente' : dias > 28 ? 'pendiente' : 'al_dia'
    const equipos = +body.equipos || 1
    const nextId = Math.max(0, ...clientesRutas.map(c => c.id)) + 1
    const nuevo = {
      id: nextId,
      codigo: body.codigo || `CL-${String(1000 + nextId).padStart(4, '0')}`,
      nombre: body.nombre,
      zona_id: body.zona_id,
      zona_nombre: z?.nombre,
      zona_color: z?.color,
      zona_foranea: !!z?.foranea,
      ciudad: z?.ciudad || 'CDMX',
      lat: +body.lat || z?.lat || 0,
      lng: +body.lng || z?.lng || 0,
      equipos,
      operador_asignado: op?.nombre || 'Sin asignar',
      operador_id: op?.id || null,
      ultima_visita: new Date(Date.now() - dias * 86400000).toISOString(),
      dias_ultima_visita: dias,
      aceite_restante_pct: aceite,
      status_visita: status,
      proxima_visita: new Date(Date.now() + Math.max(0, 30 - dias) * 86400000).toISOString(),
      tiempo_servicio_min: equipos * MINUTOS_POR_EQUIPO + MINUTOS_FIJO_POR_CLIENTE,
    }
    nuevo.prioridad_score = calcPrioridad(nuevo)
    clientesRutas.push(nuevo)
    return nuevo
  }
  if (path.startsWith('/rutas/clientes/') && method === 'PATCH') {
    const id = +path.split('/').pop()
    const c = clientesRutas.find(x => x.id === id)
    if (!c) return { error: 'Cliente no existe' }
    // Solo aplicar campos modificados
    if (body.nombre != null) c.nombre = body.nombre
    if (body.zona_id != null && body.zona_id !== c.zona_id) {
      const z = ZONAS.find(zn => zn.id === body.zona_id)
      c.zona_id = body.zona_id
      c.zona_nombre = z?.nombre
      c.zona_color = z?.color
      c.zona_foranea = !!z?.foranea
      c.ciudad = z?.ciudad || 'CDMX'
    }
    if (body.lat != null) c.lat = +body.lat
    if (body.lng != null) c.lng = +body.lng
    if (body.equipos != null) {
      c.equipos = +body.equipos
      c.tiempo_servicio_min = c.equipos * MINUTOS_POR_EQUIPO + MINUTOS_FIJO_POR_CLIENTE
    }
    if (body.operador_id != null) {
      const op = OPERADORES.find(o => o.id === +body.operador_id)
      c.operador_id = op?.id || null
      c.operador_asignado = op?.nombre || 'Sin asignar'
    }
    if (body.aceite_restante_pct != null) c.aceite_restante_pct = +body.aceite_restante_pct
    c.prioridad_score = calcPrioridad(c)
    return c
  }
  if (path.startsWith('/rutas/clientes/') && method === 'DELETE') {
    const id = +path.split('/').pop()
    const idx = clientesRutas.findIndex(c => c.id === id)
    if (idx < 0) return { error: 'Cliente no existe' }
    clientesRutas.splice(idx, 1)
    return { ok: true }
  }

  // ─── CRUD Zonas (foráneas) ───
  if (path === '/rutas/zonas' && method === 'POST') {
    const palette = ['#c2592b','#7fa37b','#9871a8','#e8829c','#5d9bbf','#d29c4f','#62a890','#c8a34a','#e57c5f']
    const colorAsignado = body.color || palette[ZONAS.length % palette.length]
    const ciudadObj = CIUDADES.find(c => c.id === body.ciudad_id)
    const nueva = {
      id: body.id || `zona_${Date.now()}`,
      nombre: body.nombre,
      color: colorAsignado,
      lat: +body.lat || ciudadObj?.lat || 19.4326,
      lng: +body.lng || ciudadObj?.lng || -99.1332,
      foranea: body.foranea !== false,
      ciudad: body.ciudad || ciudadObj?.nombre || 'Foránea',
      ciudad_id: body.ciudad_id || null,
    }
    ZONAS.push(nueva)
    return nueva
  }
  if (path.startsWith('/rutas/optimizar/')) {
    // /rutas/optimizar/:zonaId
    const zonaId = path.split('/').pop()
    const excluidos = body?.excluidos || []
    return optimizarRutaZona(zonaId, { excluidos, fecha: body?.fecha })
  }
  if (path === '/rutas/incidentes' && method === 'POST') {
    const tipo = TIPOS_INCIDENTE.find(t => t.id === body.tipo)
    const cliente = clientesRutas.find(c => c.id === +body.cliente_id)
    const nuevo = {
      id: incidentes.length + 1,
      folio: `INC-${7000 + incidentes.length}`,
      tipo: body.tipo,
      tipo_label: tipo?.label || body.tipo,
      descripcion: body.descripcion || tipo?.desc || '',
      cliente_id: cliente?.id || null,
      cliente_nombre: cliente?.nombre || null,
      zona_id: cliente?.zona_id || null,
      zona_nombre: cliente?.zona_nombre || null,
      operador: body.operador || cliente?.operador_asignado || null,
      fecha: new Date().toISOString(),
      resuelto: false,
    }
    incidentes.unshift(nuevo)
    // Si el cliente está en la ruta del día, sugerir ruta nueva sin él
    const rutaSugerida = cliente
      ? optimizarRutaZona(cliente.zona_id, { excluidos: [cliente.id] })
      : null
    return { incidente: nuevo, ruta_sugerida: rutaSugerida }
  }
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
      cliente.prioridad_score = calcPrioridad(cliente)
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
