import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import Inventarios from '@/pages/Inventarios'
import Finanzas from '@/pages/Finanzas'
import Atencion from '@/pages/Atencion'
import Logistica from '@/pages/Logistica'
import Rutas from '@/pages/Rutas'
import Alertas from '@/pages/Alertas'
import ChatIA from '@/pages/ChatIA'
import Ventas from '@/pages/Ventas'
import ReportePublico from '@/pages/ReportePublico'
import AppOperador from '@/pages/AppOperador'

export default function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/reportar" element={<ReportePublico />} />
      <Route path="/operador" element={<AppOperador />} />

      {/* App principal */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventarios" element={<Inventarios />} />
        <Route path="/finanzas" element={<Finanzas />} />
        <Route path="/atencion" element={<Atencion />} />
        <Route path="/logistica" element={<Logistica />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/chat-ia" element={<ChatIA />} />
        <Route path="/ventas" element={<Ventas />} />
      </Route>
    </Routes>
  )
}
