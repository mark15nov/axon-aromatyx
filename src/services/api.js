/**
 * API SERVICE — Capa de abstracción
 * ─────────────────────────────────────────────────────────────
 * Hoy: usa mock data desde /src/data
 * Mañana: cambiar BASE_URL y las funciones harán fetch real.
 *
 * Estructura RESTful preparada:
 *   GET    /resource          → list
 *   GET    /resource/:id      → get
 *   POST   /resource          → create
 *   PATCH  /resource/:id      → update
 *   DELETE /resource/:id      → remove
 */

import * as mock from '@/data/mockDb'

const USE_MOCK = true
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aromatyx.mx/v1'

// Latencia simulada para que se sienta real en demo
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms))

async function request(method, path, body) {
  if (USE_MOCK) {
    await delay()
    return mock.handleRequest(method, path, body)
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

/* ─────────── INVENTARIOS ─────────── */
export const inventarios = {
  listAromas: () => request('GET', '/inventarios/aromas'),
  getAroma: (id) => request('GET', `/inventarios/aromas/${id}`),
  listDifusores: () => request('GET', '/inventarios/difusores'),
  listMovimientos: () => request('GET', '/inventarios/movimientos'),
  listLotes: (itemTipo, itemId) => request('GET', `/inventarios/lotes/${itemTipo}/${itemId}`),
  previewFIFO: ({ item_tipo, item_id, cantidad }) =>
    request('POST', '/inventarios/preview-fifo', { item_tipo, item_id, cantidad }),
  registrarEntrada: (data) => request('POST', '/inventarios/entradas', data),
  registrarSalida: (data) => request('POST', '/inventarios/salidas', data),
  getKpis: () => request('GET', '/inventarios/kpis'),
}

/* ─────────── FINANCIEROS ─────────── */
export const financieros = {
  listCuentasPorCobrar: () => request('GET', '/finanzas/cxc'),
  listCuentasPorPagar: () => request('GET', '/finanzas/cxp'),
  getFlujo: () => request('GET', '/finanzas/flujo'),
  getAntiguedadCxc: () => request('GET', '/finanzas/antiguedad-cxc'),
  getAntiguedadCxp: () => request('GET', '/finanzas/antiguedad-cxp'),
  getKpis: () => request('GET', '/finanzas/kpis'),
}

/* ─────────── TICKETS ─────────── */
export const tickets = {
  list: () => request('GET', '/tickets'),
  get: (id) => request('GET', `/tickets/${id}`),
  create: (data) => request('POST', '/tickets', data),
  update: (id, data) => request('PATCH', `/tickets/${id}`, data),
}

/* ─────────── LOGÍSTICA ─────────── */
export const logistica = {
  listViajes: () => request('GET', '/logistica/viajes'),
  listCiudades: () => request('GET', '/logistica/ciudades'),
  cotizar: (data) => request('POST', '/logistica/cotizaciones', data),
}

/* ─────────── RUTAS ─────────── */
export const rutas = {
  listClientes: () => request('GET', '/rutas/clientes'),
  listZonas: () => request('GET', '/rutas/zonas'),
  listOperadores: () => request('GET', '/rutas/operadores'),
  listReportes: () => request('GET', '/rutas/reportes'),
  registrarVisita: (data) => request('POST', '/rutas/visitas', data),
}

/* ─────────── ALERTAS ─────────── */
export const alertas = {
  list: () => request('GET', '/alertas'),
  ejecutarAccion: (alertId, accionId) => request('POST', `/alertas/${alertId}/${accionId}`),
}

/* ─────────── VENTAS ─────────── */
export const ventas = {
  listProspectos: () => request('GET', '/ventas/prospectos'),
  listCampanas: () => request('GET', '/ventas/campanas'),
  getKpis: () => request('GET', '/ventas/kpis'),
  getOportunidadesZona: () => request('GET', '/ventas/oportunidades-zona'),
}

/* ─────────── CHAT IA ─────────── */
export const chat = {
  send: (msg) => request('POST', '/chat', { msg }),
}

export default {
  inventarios, financieros, tickets, logistica, rutas, alertas, ventas, chat,
}
