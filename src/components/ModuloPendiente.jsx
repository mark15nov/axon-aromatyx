import { Sparkles } from 'lucide-react'

export function ModuloPendiente({ titulo, descripcion, codigo }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="panel max-w-md text-center">
        <div className="px-8 py-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-steel-50 border border-steel-200 flex items-center justify-center mb-5">
            <Sparkles size={22} strokeWidth={1.5} className="text-steel-600" />
          </div>
          <div className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.22em] mb-2">
            Módulo {codigo} · próximamente
          </div>
          <h2 className="font-display font-semibold text-ink-50 text-2xl tracking-tight mb-2">
            {titulo}
          </h2>
          <p className="text-[13.5px] text-ink-300 leading-relaxed">{descripcion}</p>
          <div className="mt-6 pt-6 border-t border-ink-800 font-mono text-[10px] text-ink-400 uppercase tracking-wider">
            Disponible en la próxima entrega
          </div>
        </div>
      </div>
    </div>
  )
}
