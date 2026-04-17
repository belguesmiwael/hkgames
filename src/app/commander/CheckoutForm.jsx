'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck, Truck, Lock } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { createPendingOrder, confirmOrder } from '@/lib/actions/orders'
import { computeBundle } from '@/lib/utils/bundleRules'
import { formatDT } from '@/lib/utils/formatDT'
import styles from './CheckoutForm.module.css'

const GOVERNORATS = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte',
  'Béja','Jendouba','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax',
  'Kairouan','Kasserine','Sidi Bouzid','Gabès','Medenine','Tataouine',
  'Gafsa','Tozeur','Kébili',
]

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName:  z.string().min(2, 'Nom requis (min 2 caractères)'),
  phone:     z.string().regex(/^(\+216|00216|0)(2[0-9]|[3-9][0-9])[0-9]{6}$/, 'Numéro tunisien invalide'),
  address:   z.string().min(10, 'Adresse trop courte (min 10 caractères)'),
  city:      z.string().min(2, 'Gouvernorat requis'),
  notes:     z.string().optional(),
})

const FREE_THRESHOLD = 50
const SHIPPING_PRICE  = 8

export default function CheckoutForm() {
  const router   = useRouter()
  const { items, clearCart } = useCartStore()
  const [mounted, setMounted]         = useState(false)
  const [pendingOrderId, setPendingId] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [serverError, setServerError] = useState(null)
  const phonePendingRef = useRef(false)

  useEffect(() => setMounted(true), [])

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const phoneValue = watch('phone', '')

  async function handlePhoneBlur() {
    const phone = phoneValue
    const valid = /^(\+216|00216|0)(2[0-9]|[3-9][0-9])[0-9]{6}$/.test(phone)
    if (!valid || phonePendingRef.current || pendingOrderId) return

    phonePendingRef.current = true
    const subtotal = items.reduce((s, i) => s + i.price_dt * i.qty, 0)

    const result = await createPendingOrder({ phone, items, subtotalDt: subtotal })
    if (result.orderId) setPendingId(result.orderId)
    phonePendingRef.current = false
  }

  async function onSubmit(data) {
    setSubmitting(true)
    setServerError(null)

    const result = await confirmOrder({ ...data, items }, pendingOrderId)

    if (result.error) {
      setServerError(typeof result.error === 'string' ? result.error : 'Veuillez vérifier vos informations.')
      setSubmitting(false)
      return
    }

    if (typeof window !== 'undefined' && window.fbq) {
      const total = items.reduce((s, i) => s + i.price_dt * i.qty, 0)
      window.fbq('track', 'Purchase', { value: total, currency: 'TND', order_id: result.orderId })
    }

    clearCart()
    router.push(`/merci?id=${result.orderId}`)
  }

  if (!mounted) return null

  if (items.length === 0) {
    router.replace('/panier')
    return null
  }

  const subtotal = items.reduce((s, i) => s + i.price_dt * i.qty, 0)
  const { discount, bundleType, savings } = computeBundle(items)
  const discountAmt = savings
  const shipping    = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING_PRICE
  const total       = subtotal - discountAmt + shipping

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
            <h1 className={styles.title}>Finaliser ma commande</h1>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Vos informations</h2>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="firstName">Prénom *</label>
                  <input id="firstName" className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`} {...register('firstName')} placeholder="Amira" />
                  {errors.firstName && <p className={styles.error}>{errors.firstName.message}</p>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="lastName">Nom *</label>
                  <input id="lastName" className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`} {...register('lastName')} placeholder="Ben Ali" />
                  {errors.lastName && <p className={styles.error}>{errors.lastName.message}</p>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Téléphone *</label>
                <input
                  id="phone"
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  {...register('phone')}
                  onBlur={handlePhoneBlur}
                  placeholder="+216 XX XXX XXX"
                  inputMode="tel"
                />
                {errors.phone && <p className={styles.error}>{errors.phone.message}</p>}
                {pendingOrderId && !errors.phone && (
                  <p className={styles.pendingNote}>✅ Votre commande est enregistrée — continuez pour confirmer</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="address">Adresse complète *</label>
                <textarea
                  id="address"
                  className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                  {...register('address')}
                  placeholder="Rue, immeuble, appartement..."
                  rows={3}
                />
                {errors.address && <p className={styles.error}>{errors.address.message}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="city">Gouvernorat *</label>
                <select id="city" className={`${styles.select} ${errors.city ? styles.inputError : ''}`} {...register('city')}>
                  <option value="">Sélectionner...</option>
                  {GOVERNORATS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.city && <p className={styles.error}>{errors.city.message}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="notes">Instructions livraison (optionnel)</label>
                <textarea
                  id="notes"
                  className={styles.textarea}
                  {...register('notes')}
                  placeholder="Code d'accès, étage, heure préférée..."
                  rows={2}
                />
              </div>
            </div>

            {serverError && (
              <div className={styles.serverError}>{serverError}</div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              <Lock size={18} />
              {submitting ? 'Confirmation en cours...' : 'Confirmer ma commande'}
            </button>

            <p className={styles.codNote}>
              <ShieldCheck size={14} />
              Paiement à la livraison · Vous payez le livreur à la réception
            </p>
          </form>

          {/* Order summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Votre commande</h2>

              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={`${item.product_id}-${item.color}`} className={styles.summaryItem}>
                    <div
                      className={styles.itemDot}
                      style={{ background: item.color_hex || '#a855f7' }}
                    />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemQty}>Qté : {item.qty}</p>
                    </div>
                    <p className={styles.itemPrice}>{formatDT(item.price_dt * item.qty)}</p>
                  </div>
                ))}
              </div>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Sous-total</span>
                  <span>{formatDT(subtotal)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span>Réduction bundle</span>
                    <span>−{formatDT(discountAmt)}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : formatDT(shipping)}</span>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span>Total à payer</span>
                <span className={styles.totalAmount}>{formatDT(total)}</span>
              </div>

              <div className={styles.codBadge}>
                <ShieldCheck size={16} />
                Paiement à la livraison
              </div>

              <div className={styles.deliveryBadge}>
                <Truck size={16} />
                Livraison 24–48h partout en Tunisie
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
