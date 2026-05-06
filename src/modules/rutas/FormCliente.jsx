import { useEffect, useState } from 'react'
import { Building2, MapPin, AlertTriangle, Trash2, Save, Droplet } from 'lucide-react'
import { Modal, FormField } from '@/components/Modal'
import { rutas } from '@/services/api'

export function FormCliente({ cliente, onClose, onSaved }) {
  const isEdit = !!cliente
  const [zonas, setZonas] = useState([])
  const [operadores, setOperadores] = useState([])
  const [form, setForm] = useState({
    nombre: cliente?.nombre || '',
    zona_id: cliente?.zona_id || '',
    lat: cliente?.lat ?? '',
    lng: cliente?.lng ?? '',
    equipos: cliente?.equipos ?? 1,
    operador_id: cliente?.operador_id || '',
    aceite_restante_pct: cliente?.aceite_restante_pct ?? 100,
    dias_ultima_visita: cliente?.dias_ultima_visita ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    rutas.listZonasRaw().then(setZonas)
    rutas.listOperadores().then(setOperadores)
  }, [])

  const zonaSeleccionada = zonas.find(z => z.id === form.zona_id)
  const operadorSugerido = operadores.find(o => o.zonas.includes(form.zona_id))

  // Auto-fill lat/lng + operador cuando se selecciona zona (solo en nuevo)
  useEffect(() => {
    if (!isEdit && zonaSeleccionada) {
      setForm(f => ({
        ...f,
        lat: f.lat || zonaSeleccionada.lat,
        lng: f.lng || zonaSeleccionada.lng,
        operador_id: f.operador_id || operadorSugerido?.id || '',
      }))
    }
  }, [zonaSeleccionada, operadorSugerido, isEdit])

  const submit = async (e) => {
    e?.preventDefault()
    if (saving) return
    setError(null)
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      zona_id: form.zona_id,
      lat: +form.lat,
      lng: +form.lng,
      equipos: +form.equipos,
      operador_id: +form.operador_id || null,
      aceite_restante_pct: +form.aceite_restante_pct,
      dias_ultima_visita: +form.dias_ultima_visita,
    }
    const res = isEdit
      ? await rutas.updateCliente(cliente.id, payload)
      : await rutas.createCliente(payload)
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
    const res = await rutas.deleteCliente(cliente.id)
    setSaving(false)
    if (res?.error) { setError(res.error); setConfirmingDelete(false); return }
    onSaved && onSaved(null)
  }

  return (
    <Modal
      title={isEdit ? `Editar cliente · ${cliente.codigo}` : 'Nuevo cliente'}
      icon={Building2}
      tone="accent"
      width={600}
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
            disabled={saving || !form.nombre.trim() || !form.zona_id}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Guardando…' : <><Save size={11} /> {isEdit ? 'Guardar cambios' : 'Crear cliente'}</>}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Nombre del cliente" required>
          <input
            required
            autoFocus
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Hotel Camino Real Polanco"
            className="input"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Zona" required>
            <select
              required
              value={form.zona_id}
              onChange={e => setForm({ ...form, zona_id: e.target.value })}
              className="input"
            >
              <option value="">Selecciona zona...</option>
              <optgroup label="CDMX">
                {zonas.filter(z => !z.foranea).map(z => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </optgroup>
              <optgroup label="Foráneas">
                {zonas.filter(z => z.foranea).map(z => (
                  <option key={z.id} value={z.id}>{z.nombre} · {z.ciudad}</option>
                ))}
              </optgroup>
            </select>
          </FormField>

          <FormField label="Operador asignado">
            <select
              value={form.operador_id}
              onChange={e => setForm({ ...form, operador_id: e.target.value })}
              className="input"
            >
              <option value="">Sin asignar</option>
              {operadores.filter(o => o.activo).map(o => (
                <option key={o.id} value={o.id}>
                  {o.nombre} {o.zonas.includes(form.zona_id) ? '· cubre esta zona' : ''}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="border-t border-ink-800 pt-4">
          <div className="stat-label flex items-center gap-1.5 mb-2">
            <MapPin size={11} /> Ubicación geográfica
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Latitud" hint="ej. 19.4338">
              <input
                type="number"
                step="0.0001"
                required
                value={form.lat}
                onChange={e => setForm({ ...form, lat: e.target.value })}
                className="input font-mono"
                placeholder="19.4338"
              />
            </FormField>
            <FormField label="Longitud" hint="ej. -99.1934">
              <input
                type="number"
                step="0.0001"
                required
                value={form.lng}
                onChange={e => setForm({ ...form, lng: e.target.value })}
                className="input font-mono"
                placeholder="-99.1934"
              />
            </FormField>
          </div>
          <div className="font-mono text-[10.5px] text-ink-400 mt-2">
            💡 Tip: copia las coordenadas desde Google Maps con click derecho → "¿Qué hay aquí?"
          </div>
        </div>

        <div className="border-t border-ink-800 pt-4 grid grid-cols-3 gap-3">
          <FormField label="Equipos instalados" required>
            <input
              type="number"
              min="1"
              required
              value={form.equipos}
              onChange={e => setForm({ ...form, equipos: e.target.value })}
              className="input font-mono"
            />
          </FormField>
          <FormField label="Aceite actual">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={form.aceite_restante_pct}
                onChange={e => setForm({ ...form, aceite_restante_pct: e.target.value })}
                className="input font-mono pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-ink-400 pointer-events-none">%</span>
            </div>
          </FormField>
          <FormField label="Días sin visita">
            <input
              type="number"
              min="0"
              value={form.dias_ultima_visita}
              onChange={e => setForm({ ...form, dias_ultima_visita: e.target.value })}
              className="input font-mono"
            />
          </FormField>
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
                ¿Eliminar <strong>{cliente?.nombre}</strong>? Esta acción no se puede deshacer.
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmingDelete(false)} className="btn-ghost">
                Cancelar
              </button>
              <button type="button" onClick={eliminar} disabled={saving} className="btn-danger">
                {saving ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}
