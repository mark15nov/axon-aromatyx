# Aromatyx · Sistema Operativo B2B

Maqueta completa construida sobre **AXON** para Aromatyx — empresa de venta de esencias y difusores B2B con cobertura nacional.

## Stack

- Vite + React 18
- React Router v6
- TailwindCSS 3
- Recharts (gráficas)
- Leaflet + react-leaflet (mapa de México)
- Lucide-react (iconos)

## Diseño

- **Dirección:** industrial / utilitaria refinada (estilo Bloomberg / Linear)
- **Tipografía:** JetBrains Mono (display, números, headers) + Manrope (body)
- **Paleta:** Negro carbón / grises industriales / blanco hueso, azul acero `#2563eb` como acento
- **Sin amarillo AXON, sin gradientes morados, sin Inter genérico**

## Setup

```bash
npm install
npm run dev
```

Corre en `http://localhost:5173`

## Estructura

```
src/
├── components/        # Panel, StatCard, StatusBadge
├── layouts/           # Sidebar, Topbar, DashboardLayout
├── pages/             # 9 páginas (Dashboard + 8 módulos + 2 públicas)
├── modules/
│   ├── inventarios/   # AromasTab, DifusoresTab, MovimientosTab
│   ├── finanzas/      # CxCTab, CxPTab, FlujoTab
│   ├── atencion/      # KanbanView, ListaView, TicketDrawer
│   ├── logistica/     # CotizadorTab, AgendaTab
│   ├── rutas/         # MapaZonas, ZonasTab, OperadoresTab, ClientesTab, ClienteDrawer
│   └── ventas/        # CampanasTab, ProspectosTab, OportunidadesTab
├── services/
│   └── api.js         # Capa de servicios (mock + estructura para API real)
├── data/
│   └── mockDb.js      # Base de datos mock con datos realistas
└── utils/
    └── format.js      # Formatos MX (moneda, fechas, números)
```

## Rutas (módulos)

| Ruta            | Módulo                                                              |
|-----------------|---------------------------------------------------------------------|
| `/`             | **Centro de Control** · Dashboard global con KPIs y módulos         |
| `/inventarios`  | **MOD 01 ·** 50 aromas + 2 difusores + Movimientos (entrada/salida) |
| `/finanzas`     | **MOD 02 ·** CxC + CxP + Flujo de efectivo + Antigüedad             |
| `/atencion`     | **MOD 03 ·** Kanban + SLA + Drawer + Timeline de mensajes           |
| `/logistica`    | **MOD 04 ·** Cotizador automático + Agenda de viajes                |
| `/rutas`        | **MOD 05 ·** Mapa Leaflet + Zonas + Operadores + Clientes           |
| `/alertas`      | **MOD 06 ·** Detección automática + Acciones ejecutables            |
| `/chat-ia`      | **MOD 07 ·** Asistente entrenado con datos en tiempo real           |
| `/ventas`       | **MOD 08 ·** Agentes scraping + Campañas + Sinergia con Rutas       |

## Páginas públicas

| Ruta        | Descripción                                            |
|-------------|--------------------------------------------------------|
| `/reportar` | Portal público para que clientes envíen tickets        |
| `/operador` | App mobile-first para operadores en campo (4 pasos)    |

## Conectar API real

En `src/services/api.js`:

```js
const USE_MOCK = false
const BASE_URL = 'https://api.aromatyx.mx/v1'  // tu URL real
```

Las funciones ya están estructuradas RESTful. Solo cambiar la URL.

## Highlights por módulo

### MOD 01 — Inventarios
- 50 aromas reales con familia (Floral, Cítrica, Amaderada...) y stock en litros
- 2 tipos de difusor (Grande / Chico) con cobertura m² y márgenes
- Modal funcional para registrar entradas y salidas (persiste en mock DB)
- Filtros por familia y status crítico/bajo/OK

### MOD 02 — Finanzas
- 24 facturas CxC con clientes mexicanos reales
- Antigüedad de saldos por buckets (0-15d, 16-30d, 31-60d, 61-90d, 90+d)
- Top 6 proveedores en CxP con saldos vencidos
- Flujo de efectivo con ComposedChart (barras + línea de utilidad)

### MOD 03 — Atención a Clientes
- Vista Kanban (4 columnas) y vista Lista intercambiables
- Drawer lateral con timeline de mensajes (cliente vs equipo)
- SLA visual con barra de progreso por ticket
- **Responder funcional** — al enviar respuesta cambia status y agrega al timeline
- Banner de portal público con link directo

### MOD 04 — Logística
- 15 ciudades reales de México con coordenadas
- Cotizador con cálculo en tiempo real (haversine + tarifas + peajes + IVA)
- 3 tipos de unidad (Rabón / Tortón / Tráiler) con factores 1.0× / 1.7× / 2.4×
- Agenda con status (cotización / agendado / en curso / completado)

### MOD 05 — Rutas (el más pesado)
- **Mapa Leaflet con dark theme** sobre OpenStreetMap
- **32 clientes geolocalizados** en CDMX (Polanco, Roma, Santa Fe, Centro, Coyoacán, Satélite, Aeropuerto, Sur)
- **8 zonas con áreas circulares + polylines** conectando clientes
- Markers color-coded por urgencia (rojo/ámbar/verde) con popups detallados
- Cards de zona con KPIs y operador asignado
- **App pública del operador** (`/operador`) — 4 pasos, mobile-first, **al enviar reporte actualiza el cliente en tiempo real**

### MOD 06 — Alertas Tempranas
- Motor que **cruza datos entre módulos** (inventario × rutas × finanzas × atención × ventas)
- 3 niveles de severidad (alta / media / baja)
- **Acciones ejecutables** con un click (genera OC, programa ruta, envía cobranza, etc.)
- Plan de acción detallado expandible por alerta

### MOD 07 — Chat IA
- Asistente entrenado con **toda la data del sistema en tiempo real**
- Respuestas con tablas de datos, resúmenes ejecutivos, sugerencias
- Sidebar con capacidades por módulo
- Sugerencias para empezar (6 prompts rápidos)
- Reconoce nombres de clientes, zonas, aromas, etc.

### MOD 08 — Ventas
- **3 vistas:** Campañas (agentes scraping), Prospectos (CRM), Oportunidades de zona
- **Embudo visual** por campaña: Scrapeados → Emails → Abiertos → Respondieron → Cita
- **Sinergia con Rutas:** detecta zonas con baja densidad y propone prospectos para que el operador no viaje en vacío
- 31 prospectos con score, sector, zona, valor estimado y status

## Roadmap

- [x] **Chat 1:** Base + Dashboard + MOD 01 Inventarios + Portal de tickets
- [x] **Chat 2:** MOD 02 Finanzas + MOD 03 Atención
- [x] **Chat 3:** MOD 04 Logística + MOD 05 Rutas (mapa Leaflet) + App de operador
- [x] **Chat 4 (final):** MOD 06 Alertas + MOD 07 Chat IA + MOD 08 Ventas

## Total entregado

- ✅ 9 páginas (Dashboard + 8 módulos)
- ✅ 2 portales públicos (`/reportar`, `/operador`)
- ✅ 16 sub-componentes modulares
- ✅ Mock DB con +200 registros realistas
- ✅ Mapa interactivo de México con datos reales geolocalizados
- ✅ Capa de servicios lista para conectar API real
- ✅ Dirección estética coherente y producción-grade
