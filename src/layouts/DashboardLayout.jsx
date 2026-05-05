import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const MODULE_META = {
  '/':            { module: 'Inicio',         code: '00', desc: 'Vista global del negocio' },
  '/inventarios': { module: 'Inventarios',    code: '01', desc: 'Aromas, difusores y movimientos' },
  '/finanzas':    { module: 'Finanzas',       code: '02', desc: 'CxC, CxP y flujo de efectivo' },
  '/atencion':    { module: 'Atención',       code: '03', desc: 'Tickets y soporte de clientes' },
  '/logistica':   { module: 'Logística',      code: '04', desc: 'Cotización y agenda de viajes' },
  '/rutas':       { module: 'Rutas',          code: '05', desc: 'Operadores y visitas en campo' },
  '/alertas':     { module: 'Alertas',        code: '06', desc: 'Acciones automáticas sugeridas' },
  '/chat-ia':     { module: 'Asistente IA',   code: '07', desc: 'Pregúntale lo que necesites' },
  '/ventas':      { module: 'Ventas',         code: '08', desc: 'Prospección y oportunidades' },
}

export function DashboardLayout() {
  const { pathname } = useLocation()
  const meta = MODULE_META[pathname] || { module: 'Aromatyx', code: '—', desc: '' }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar module={meta.module} code={meta.code} description={meta.desc} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto float-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
