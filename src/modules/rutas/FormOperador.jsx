import { useEffect, useState } from 'react'
import { Users, AlertTriangle, Trash2, Save } from 'lucide-react'
import { Modal, FormField } from '@/components/Modal'
import { rutas } from '@/services/api'

const getInitials = (n) =>
  (n || '').split(/\s+/).filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase()

export function FormOperador({ operador, onClose, onSaved }) {
  const isEdit = !!operador
  const [zonas, setZonas] = useState([])
  const [form, setForm] = useState({
    nombre: operador?.nombre || '',
    avatar: operador?.avatar || '',
    zonas: operador?.zonas || [],
    activo: operador?.activo !== false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    rutas.listZonasRaw().then(setZonas)
  }, [])

  const initials = form.avatar || getInitials(form.nombre) || 'OP'

  const toggleZona = (zonaId) => {
    setForm(f => ({
      ...f,
      zonas: f.zonas.includes(zonaId)
        ? f.zonas.filter(z => z !== zonaId)
        : [...f.zonas, zonaId],
    }))
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (saving) return
    setError(null)
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      avatar: form.avatar || initials,
      zonas: form.zonas,
      activo: form.activo,
    }
    const res = isEdit
      ? await rutas.updateOperador(operador.id, payload)
      : await rutas.createOperador(payload)
    setSaving(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    onSaved && onSaved(res)
  }

  const eliminar = async () => {
    setSaving(true)
    setError(null)
    const res = await rutas.deleteOperador(operador.id)
    setSaving(false)
    if (res?.error) {
      setError(res.error)
      setConfirmingDelete(false)
      return
    }
    onSaved && onSaved(null) // null indica eliminado
  }

  const localZonas   = zonas.filter(z => !z.foranea)
  const foraneasZonas = zonas.filter(z => z.foranea)

  return (
    <Modal
      title={isEdit ? `Editar operador · ${operador.nombre}` : 'Nuevo operador'}
      icon={Users}
      tone="accent"
      width={560}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={saving}
              className="btn-danger"
            >
              <Trash2 size={11} /> Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !form.nombre.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Guardando…' : <><Save size={11} /> {isEdit ? 'Guardar cambios' : 'Crear operador'}</>}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Avatar preview + nombre */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-steel-400 to-steel-600 flex items-center justify-center font-display font-semibold text-lg text-white shadow-soft flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <FormField label="Nombre completo" required>
              <input
                required
                autoFocus
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Fernando Espinosa"
                className="input"
              />
            </FormField>
          </div>
        </div>

        <FormField
          label="Avatar (iniciales)"
          hint={`Se autogenera de "${form.nombre || 'tu nombre'}". Puedes cambiarlo manualmente.`}
        >
          <input
            value={form.avatar}
            maxLength={3}
            onChange={e => setForm({ ...form, avatar: e.target.value.toUpperCase() })}
            placeholder={getInitials(form.nombre) || 'OP'}
            className="input font-mono uppercase"
            style={{ width: 120 }}
          />
        </FormField>

        <div className="border-t border-ink-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Zonas asignadas ({form.zonas.length})</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })}
                className="accent-steel-600 w-4 h-4 rounded"
              />
              <span className="text-[12px] text-ink-200">Operador activo</span>
            </label>
          </div>

          {/* CDMX */}
          {localZonas.length > 0 && (
            <div className="mb-3">
              <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-wider mb-2">
                CDMX y zona metropolitana
              </div>
              <div className="flex flex-wrap gap-1.5">
                {localZonas.map(z => {
                  const sel = form.zonas.includes(z.id)
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => toggleZona(z.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                        sel ? 'shadow-soft' : 'bg-ink-900 hover:bg-ink-850'
                      }`}
                      style={{
                        borderColor: sel ? z.color : '#ebe4d8',
                        background: sel ? `${z.color}15` : undefined,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: z.color }} />
                      <span className="text-[12px] font-medium" style={{ color: sel ? z.color : '#3a3128' }}>
                        {z.nombre}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Foráneas */}
          {foraneasZonas.length > 0 && (
            <div>
              <div className="font-mono text-[9.5px] text-ink-400 uppercase tracking-wider mb-2">
                Foráneas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {foraneasZonas.map(z => {
                  const sel = form.zonas.includes(z.id)
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => toggleZona(z.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                        sel ? 'shadow-soft' : 'bg-ink-900 hover:bg-ink-850'
                      }`}
                      style={{
                        borderColor: sel ? z.color : '#ebe4d8',
                        background: sel ? `${z.color}15` : undefined,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: z.color }} />
                      <span className="text-[12px] font-medium" style={{ color: sel ? z.color : '#3a3128' }}>
                        {z.nombre}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-signal-alert flex-shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-signal-alert">{error}</div>
          </div>
        )}

        {confirmingDelete && (
          <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3.5">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={14} className="text-signal-alert flex-shrink-0 mt-0.5" />
              <div className="text-[12.5px] text-signal-alert">
                ¿Seguro que quieres eliminar a <strong>{operador?.nombre}</strong>? Esta acción no se puede deshacer.
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminar}
                disabled={saving}
                className="btn-danger"
              >
                {saving ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}
