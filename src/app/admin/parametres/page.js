'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'
import styles from './parametres.module.css'

const SETTINGS_META = {
  free_shipping_threshold_dt: { label: 'Seuil livraison gratuite (DT)', type: 'number' },
  shipping_price_dt:          { label: 'Prix livraison standard (DT)',   type: 'number' },
  shipping_timer_cutoff:      { label: 'Heure limite livraison J+1',     type: 'text' },
  stock_alert_threshold:      { label: 'Seuil stock badge orange',       type: 'number' },
  oto_discount_dt:            { label: 'Réduction OTO (DT)',             type: 'number' },
  oto_enabled:                { label: 'Activer OTO',                    type: 'toggle' },
  bundle_decouverte_enabled:  { label: 'Bundle Découverte actif',        type: 'toggle' },
  bundle_alchimiste_enabled:  { label: 'Bundle Alchimiste actif',        type: 'toggle' },
  bundle_famille_enabled:     { label: 'Bundle Famille Monstre actif',   type: 'toggle' },
}

export default function ParametresPage() {
  const [settings, setSettings] = useState({})
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('settings').select('key, value').then(({ data }) => {
      const map = {}
      ;(data || []).forEach((s) => { map[s.key] = s.value })
      setSettings(map)
    })
  }, [])

  function handleChange(key, value) {
    setSettings((prev) => ({ ...prev, [key]: String(value) }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
      )
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Paramètres</h1>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving} type="button">
          <Save size={16} />
          {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      <div className={styles.grid}>
        {Object.entries(SETTINGS_META).map(([key, meta]) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{meta.label}</label>
            {meta.type === 'toggle' ? (
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings[key] === 'true'}
                  onChange={(e) => handleChange(key, e.target.checked ? 'true' : 'false')}
                />
                <span className={styles.toggleSlider} />
              </label>
            ) : (
              <input
                type={meta.type}
                className={styles.input}
                value={settings[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
