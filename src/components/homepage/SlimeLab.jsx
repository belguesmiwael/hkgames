'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import { FlaskConical, Palette, Tag, ShoppingCart, RefreshCw } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { formatDT } from '@/lib/utils/formatDT'
import { generateBuddyName } from '@/lib/utils/buddyNames'
import styles from './SlimeLab.module.css'

const PRODUCT_TYPES = [
  { id: 'unicolore', label: 'Unicolore', emoji: '🔵', desc: 'Une couleur pure, intense', price: 12, line: 'unicolore' },
  { id: 'bicolore',  label: 'Bicolore',  emoji: '🟣', desc: 'Mélange magique de 2 couleurs', price: 15, line: 'bicolore' },
  { id: 'buddies',   label: 'Buddy',     emoji: '👾', desc: 'Mon monstre, mon ami', price: 18, line: 'buddies' },
]

const COLORS = [
  { name: 'Rouge',  hex: '#ef4444' },
  { name: 'Bleu',   hex: '#3b82f6' },
  { name: 'Jaune',  hex: '#eab308' },
  { name: 'Vert',   hex: '#22c55e' },
  { name: 'Rose',   hex: '#ec4899' },
  { name: 'Violet', hex: '#a855f7' },
]

const BICOLOR_COMBOS = [
  { color1: 'Rose', color2: 'Bleu',  result: 'Violet',  hex: '#a855f7' },
  { color1: 'Rose', color2: 'Jaune', result: 'Orangé',  hex: '#f97316' },
  { color1: 'Bleu', color2: 'Jaune', result: 'Vert',    hex: '#22c55e' },
]

export default function SlimeLab() {
  const [step, setStep] = useState(1)
  const [type, setType] = useState(null)
  const [color, setColor] = useState(null)
  const [buddyName, setBuddyName] = useState(() => generateBuddyName())
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const selectedType = PRODUCT_TYPES.find((t) => t.id === type)
  const selectedColor = COLORS.find((c) => c.name === (typeof color === 'object' ? color?.result : color))

  function handleTypeSelect(t) {
    setType(t)
    setStep(2)
  }

  function handleColorSelect(c) {
    setColor(c)
    setStep(3)
  }

  function handleAddToCart() {
    if (!selectedType || (!color && type !== 'buddies')) return
    const colorName = typeof color === 'object' ? color.result : (color || 'Aléatoire')
    const colorHex  = typeof color === 'object' ? color.hex : (COLORS.find((c) => c.name === colorName)?.hex || '#a855f7')
    const slugMap   = { unicolore: `unicolore-${colorName.toLowerCase()}`, bicolore: `bicolore-${colorName.toLowerCase()}`, buddies: `buddies-${colorName.toLowerCase()}` }

    addItem({
      product_id:  `lab-${type}-${colorName}`,
      slug:        slugMap[type],
      name:        type === 'buddies' ? `Buddy ${colorName}` : `Slime ${selectedType.label} ${colorName}`,
      price_dt:    selectedType.price,
      color:       colorName,
      color_hex:   colorHex,
      line:        type,
      buddy_name:  type === 'buddies' ? buddyName : undefined,
      qty:         1,
      image:       null,
    })

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#06b6d4', '#fbbf24', '#10b981'],
    })

    setAdded(true)
    setTimeout(() => {
      setStep(1); setType(null); setColor(null); setAdded(false)
    }, 1800)
  }

  return (
    <section className={styles.lab} id="labo">
      <div className={styles.container}>
        <div className={styles.header}>
          <FlaskConical size={28} className={styles.headerIcon} />
          <h2 className={styles.title}>Le Laboratoire du Slimeur</h2>
          <p className={styles.subtitle}>Crée ton Slime en 3 étapes et ajoute-le directement au panier</p>
        </div>

        {/* Steps indicator */}
        <div className={styles.steps}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`${styles.step} ${step >= s ? styles.stepActive : ''}`}>
              <div className={styles.stepDot}>{s}</div>
              <span className={styles.stepLabel}>
                {s === 1 ? 'Type' : s === 2 ? 'Couleur' : 'Résultat'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1 — Type */}
        {step === 1 && (
          <div className={styles.typeGrid}>
            {PRODUCT_TYPES.map((t) => (
              <button
                key={t.id}
                className={styles.typeCard}
                onClick={() => handleTypeSelect(t.id)}
                type="button"
              >
                <span className={styles.typeEmoji}>{t.emoji}</span>
                <span className={styles.typeName}>{t.label}</span>
                <span className={styles.typeDesc}>{t.desc}</span>
                <span className={styles.typePrice}>{t.price},000 DT</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Color */}
        {step === 2 && type === 'unicolore' && (
          <div className={styles.colorStep}>
            <h3 className={styles.stepTitle}>Choisis ta couleur</h3>
            <div className={styles.colorGrid}>
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  className={`${styles.colorSwatch} ${color === c.name ? styles.colorSelected : ''}`}
                  onClick={() => handleColorSelect(c.name)}
                  style={{ background: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                  type="button"
                />
              ))}
            </div>
            <button className={styles.backBtn} onClick={() => setStep(1)} type="button">Retour</button>
          </div>
        )}

        {step === 2 && type === 'bicolore' && (
          <div className={styles.colorStep}>
            <h3 className={styles.stepTitle}>Choisis ta combinaison</h3>
            <div className={styles.comboGrid}>
              {BICOLOR_COMBOS.map((combo) => (
                <button
                  key={`${combo.color1}-${combo.color2}`}
                  className={`${styles.comboCard} ${color?.result === combo.result ? styles.comboSelected : ''}`}
                  onClick={() => handleColorSelect(combo)}
                  type="button"
                >
                  <div className={styles.comboDots}>
                    <span style={{ background: COLORS.find((c) => c.name === combo.color1)?.hex }} />
                    <span>+</span>
                    <span style={{ background: COLORS.find((c) => c.name === combo.color2)?.hex }} />
                    <span>=</span>
                    <span style={{ background: combo.hex }} />
                  </div>
                  <p>{combo.color1} + {combo.color2} → {combo.result}</p>
                </button>
              ))}
            </div>
            <button className={styles.backBtn} onClick={() => setStep(1)} type="button">Retour</button>
          </div>
        )}

        {step === 2 && type === 'buddies' && (
          <div className={styles.colorStep}>
            <h3 className={styles.stepTitle}>Couleur de ton Buddy</h3>
            <div className={styles.colorGrid}>
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  className={`${styles.colorSwatch} ${color === c.name ? styles.colorSelected : ''}`}
                  onClick={() => handleColorSelect(c.name)}
                  style={{ background: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                  type="button"
                />
              ))}
            </div>
            <button className={styles.backBtn} onClick={() => setStep(1)} type="button">Retour</button>
          </div>
        )}

        {/* Step 3 — Result */}
        {step === 3 && (
          <div className={styles.result}>
            {added ? (
              <div className={styles.addedMsg}>
                <ShoppingCart size={32} className={styles.addedIcon} />
                <p>Ajouté au panier !</p>
              </div>
            ) : (
              <>
                <div
                  className={styles.resultPot}
                  style={{
                    background: `radial-gradient(circle at 40% 30%, ${typeof color === 'object' ? color.hex : COLORS.find((c) => c.name === color)?.hex || '#a855f7'}cc, ${typeof color === 'object' ? color.hex : COLORS.find((c) => c.name === color)?.hex || '#a855f7'}44)`,
                  }}
                >
                  <PotIcon color={typeof color === 'object' ? color.hex : COLORS.find((c) => c.name === color)?.hex || '#a855f7'} />
                </div>

                {type === 'buddies' && (
                  <div className={styles.buddyName}>
                    <Tag size={16} />
                    <span>{buddyName}</span>
                    <button onClick={() => setBuddyName(generateBuddyName())} type="button" className={styles.regenBtn} aria-label="Générer un nouveau nom">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}

                <p className={styles.resultLabel}>
                  {type === 'buddies'
                    ? `${buddyName}`
                    : `Slime ${selectedType?.label} ${typeof color === 'object' ? color.result : color}`}
                </p>
                <p className={styles.resultPrice}>{formatDT(selectedType?.price || 0)}</p>

                <button className={styles.addBtn} onClick={handleAddToCart} type="button">
                  <ShoppingCart size={18} />
                  Ajouter au panier
                </button>
                <button className={styles.backBtn} onClick={() => setStep(2)} type="button">Retour</button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function PotIcon({ color }) {
  return (
    <svg viewBox="0 0 100 100" width="100" height="100" fill="none" aria-hidden="true">
      <ellipse cx="50" cy="70" rx="34" ry="22" fill={color} opacity="0.9" />
      <rect x="16" y="38" width="68" height="35" rx="10" fill={color} />
      <ellipse cx="50" cy="38" rx="34" ry="12" fill={color} opacity="0.7" />
      <ellipse cx="50" cy="38" rx="26" ry="8" fill="white" opacity="0.18" />
      <ellipse cx="40" cy="36" rx="8" ry="4" fill="white" opacity="0.35" />
    </svg>
  )
}
