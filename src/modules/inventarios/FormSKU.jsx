import { useState } from 'react'
import { Droplet, Box, AlertTriangle, Trash2, Save } from 'lucide-react'
import { Modal, FormField } from '@/components/Modal'
import { inventarios } from '@/services/api'

const FAMILIAS = ['Floral', 'Cítrica', 'Amaderada', 'Especiada', 'Frutal', 'Herbal', 'Acuática', 'Dulce']

export function FormAroma({ aroma, onClose, onSaved }) {
  const isEdit = !!aroma
  const [form, setForm] = useState({
    nombre:              aroma?.nombre || '',
    familia:             aroma?.familia || 'Floral',
    stock_minimo:        aroma?.stock_minimo ?? 15,
    costo_por_litro:     aroma?.costo_por_litro ?? '',
    precio_venta_litro:  aroma?.precio_venta_litro ?? '',
    stock_litros:        aroma?.stock_litros ?? 0, // solo nuevo
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const margen = form.precio_venta_litro && form.costo_por_litro
    ? Math.round(((+form.precio_venta_litro - +form.costo_por_litro) / +form.precio_venta_litro) * 100)
    : 0

  const submit = async (e) => {
    e?.preventDefault()
    if (saving) return
    setError(null)
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      familia: form.familia,
      stock_minimo: +form.stock_minimo,
      costo_por_litro: +form.costo_por_litro,
      precio_venta_litro: +form.precio_venta_litro,
      ...(isEdit ? {} : { stock_litros: +form.stock_litros || 0 }),
    }
    const res = isEdit
      ? await inventarios.updateAroma(aroma.id, payload)
      : await inventarios.createAroma(payload)
    setSaving(false)
    if (res?.error) { setError(res.error); return }
    onSaved && onSaved(res)
  }

  const eliminar = async () => {
    setSaving(true); setError(null)
    const res = await inventarios.deleteAroma(aroma.id)
    setSaving(false)
    if (res?.error) { setError(res.error); setConfirmingDelete(false); return }
    onSaved && onSaved(null)
  }

  return (
    <Modal
      title={isEdit ? `Editar aroma · ${aroma.codigo}` : 'Nuevo aroma'}
      icon={Droplet}
      tone="accent"
      width={520}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {isEdit && (
            <button type="button" onClick={() => setConfirmingDelete(true)} disabled={saving} className="btn-danger">
              <Trash2 size={11} /> Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !form.nombre.trim() || !form.costo_por_litro || !form.precio_venta_litro}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Guardando…' : <><Save size={11} /> {isEdit ? 'Guardar' : 'Crear aroma'}</>}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Nombre del aroma" required>
          <input
            required autoFocus
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Vainilla Bourbon"
            className="input"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Familia olfativa">
            <select
              value={form.familia}
              onChange={e => setForm({ ...form, familia: e.target.value })}
              className="input"
            >
              {FAMILIAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Stock mínimo (L)">
            <input
              type="number" min="0" step="0.01"
              value={form.stock_minimo}
              onChange={e => setForm({ ...form, stock_minimo: e.target.value })}
              className="input font-mono"
            />
          </FormField>
        </div>

        <div className="border-t border-ink-800 pt-4 grid grid-cols-2 gap-3">
          <FormField label="Costo / litro" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-[13px]">$</span>
              <input
                type="number" min="0" step="0.01" required
                value={form.costo_por_litro}
                onChange={e => setForm({ ...form, costo_por_litro: e.target.value })}
                className="input font-mono pl-7"
                placeholder="0.00"
              />
            </div>
          </FormField>
          <FormField label="Precio venta / L" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-[13px]">$</span>
              <input
                type="number" min="0" step="0.01" required
                value={form.precio_venta_litro}
                onChange={e => setForm({ ...form, precio_venta_litro: e.target.value })}
                className="input font-mono pl-7"
                placeholder="0.00"
              />
            </div>
          </FormField>
        </div>

        {form.costo_por_litro && form.precio_venta_litro && (
          <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.16em]">Margen calculado</span>
            <span className={`font-display font-semibold text-xl tabular-nums ${
              margen >= 40 ? 'text-signal-ok' : margen >= 20 ? 'text-signal-warn' : 'text-signal-alert'
            }`}>
              {margen}%
            </span>
          </div>
        )}

        {!isEdit && (
          <FormField label="Stock inicial (litros)" hint="Solo para creación. Después usa entradas/salidas con FIFO.">
            <input
              type="number" min="0" step="0.01"
              value={form.stock_litros}
              onChange={e => setForm({ ...form, stock_litros: e.target.value })}
              className="input font-mono"
              placeholder="0.00"
            />
          </FormField>
        )}

        {error && (
          <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-signal-alert flex-shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-signal-alert">{error}</div>
          </div>
        )}
        {confirmingDelete && (
          <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3.5">
            <div className="text-[12.5px] text-signal-alert mb-3">
              ¿Eliminar <strong>{aroma?.nombre}</strong>? Solo se permite si tiene stock 0.
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmingDelete(false)} className="btn-ghost">Cancelar</button>
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

export function FormDifusor({ difusor, onClose, onSaved }) {
  const isEdit = !!difusor
  const [form, setForm] = useState({
    nombre:        difusor?.nombre || '',
    tipo:          difusor?.tipo || 'chico',
    cobertura_m2:  difusor?.cobertura_m2 ?? 80,
    costo:         difusor?.costo ?? '',
    precio:        difusor?.precio ?? '',
    stock_minimo:  difusor?.stock_minimo ?? 30,
    stock:         difusor?.stock ?? 0,
    descripcion:   difusor?.descripcion || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const margen = form.precio && form.costo
    ? Math.round(((+form.precio - +form.costo) / +form.precio) * 100)
    : 0

  const submit = async (e) => {
    e?.preventDefault()
    if (saving) return
    setError(null); setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      cobertura_m2: +form.cobertura_m2,
      costo: +form.costo,
      precio: +form.precio,
      stock_minimo: +form.stock_minimo,
      descripcion: form.descripcion,
      ...(isEdit ? {} : { stock: +form.stock || 0 }),
    }
    const res = isEdit
      ? await inventarios.updateDifusor(difusor.id, payload)
      : await inventarios.createDifusor(payload)
    setSaving(false)
    if (res?.error) { setError(res.error); return }
    onSaved && onSaved(res)
  }

  const eliminar = async () => {
    setSaving(true); setError(null)
    const res = await inventarios.deleteDifusor(difusor.id)
    setSaving(false)
    if (res?.error) { setError(res.error); setConfirmingDelete(false); return }
    onSaved && onSaved(null)
  }

  return (
    <Modal
      title={isEdit ? `Editar difusor · ${difusor.codigo}` : 'Nuevo difusor'}
      icon={Box}
      tone="accent"
      width={520}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {isEdit && (
            <button type="button" onClick={() => setConfirmingDelete(true)} disabled={saving} className="btn-danger">
              <Trash2 size={11} /> Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !form.nombre.trim() || !form.costo || !form.precio}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Guardando…' : <><Save size={11} /> {isEdit ? 'Guardar' : 'Crear difusor'}</>}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Nombre" required>
          <input
            required autoFocus
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Difusor Premium 350"
            className="input"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo">
            <div className="flex gap-2">
              {[
                { v: 'chico', l: 'Chico' },
                { v: 'grande', l: 'Grande' },
              ].map(t => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => setForm({ ...form, tipo: t.v })}
                  className={`flex-1 text-[12px] font-medium py-2.5 rounded-full border transition-all ${
                    form.tipo === t.v
                      ? 'bg-steel-600 border-steel-600 text-white shadow-soft'
                      : 'border-ink-800 bg-ink-900 text-ink-200 hover:bg-ink-850'
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Cobertura (m²)">
            <input
              type="number" min="1"
              value={form.cobertura_m2}
              onChange={e => setForm({ ...form, cobertura_m2: e.target.value })}
              className="input font-mono"
            />
          </FormField>
        </div>

        <div className="border-t border-ink-800 pt-4 grid grid-cols-2 gap-3">
          <FormField label="Costo" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-[13px]">$</span>
              <input
                type="number" min="0" step="0.01" required
                value={form.costo}
                onChange={e => setForm({ ...form, costo: e.target.value })}
                className="input font-mono pl-7"
              />
            </div>
          </FormField>
          <FormField label="Precio venta" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-[13px]">$</span>
              <input
                type="number" min="0" step="0.01" required
                value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                className="input font-mono pl-7"
              />
            </div>
          </FormField>
        </div>

        {form.precio && form.costo && (
          <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-[10.5px] text-ink-400 uppercase tracking-[0.16em]">Margen calculado</span>
            <span className={`font-display font-semibold text-xl tabular-nums ${
              margen >= 40 ? 'text-signal-ok' : margen >= 20 ? 'text-signal-warn' : 'text-signal-alert'
            }`}>{margen}%</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Stock mínimo">
            <input
              type="number" min="0"
              value={form.stock_minimo}
              onChange={e => setForm({ ...form, stock_minimo: e.target.value })}
              className="input font-mono"
            />
          </FormField>
          {!isEdit && (
            <FormField label="Stock inicial (pza)">
              <input
                type="number" min="0"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="input font-mono"
              />
            </FormField>
          )}
        </div>

        <FormField label="Descripción">
          <input
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Para espacios comerciales 100-250m²"
            className="input"
          />
        </FormField>

        {error && (
          <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-signal-alert flex-shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-signal-alert">{error}</div>
          </div>
        )}
        {confirmingDelete && (
          <div className="rounded-xl border border-signal-alertBorder bg-signal-alertBg px-4 py-3.5">
            <div className="text-[12.5px] text-signal-alert mb-3">
              ¿Eliminar <strong>{difusor?.nombre}</strong>? Solo se permite si tiene stock 0.
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmingDelete(false)} className="btn-ghost">Cancelar</button>
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
