'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { computeBundle, getBundleUpsell, BUNDLE_LABELS } from '@/lib/utils/bundleRules'
import { formatDT } from '@/lib/utils/formatDT'
import ShippingProgress from '@/components/cart/ShippingProgress'
import CrossSell from '@/components/cart/CrossSell'
import styles from './CartContent.module.css'

const FREE_THRESHOLD = 50
const SHIPPING_PRICE  = 8

export default function CartContent() {
  const { items, removeItem, updateQty } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <ShoppingBag size={56} className={styles.emptyIcon} />
        <h2>Ton panier est vide</h2>
        <p>Découvre nos slimes artisanaux et trouve ton bonheur !</p>
        <Link href="/shop" className={styles.shopBtn}>
          Voir la boutique
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  const subtotal   = items.reduce((s, i) => s + i.price_dt * i.qty, 0)
  const { discount, bundleType, savings } = computeBundle(items)
  const upsell     = getBundleUpsell(items)
  const discountAmt = savings
  const shipping   = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING_PRICE
  const total      = subtotal - discountAmt + shipping

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mon Panier</h1>

      <div className={styles.layout}>
        {/* Items list */}
        <div className={styles.itemsList}>
          {/* Bundle badge */}
          {bundleType && (
            <div className={styles.bundleBadge}>
              <span>{BUNDLE_LABELS[bundleType]}</span>
              <span className={styles.bundleSavings}>Tu économises {formatDT(discountAmt)}</span>
            </div>
          )}

          {/* Upsell */}
          {upsell && (
            <div className={styles.upsellBanner}>
              {upsell.message}
            </div>
          )}

          {items.map((item) => (
            <div key={`${item.product_id}-${item.color}`} className={styles.item}>
              <div
                className={styles.itemImage}
                style={{ background: `radial-gradient(circle, ${item.color_hex || '#a855f7'}55, transparent)` }}
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                ) : (
                  <PotMini color={item.color_hex || '#a855f7'} />
                )}
              </div>

              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                {item.buddy_name && (
                  <p className={styles.itemSub}>Buddy : {item.buddy_name}</p>
                )}
                <p className={styles.itemPrice}>{formatDT(item.price_dt)}</p>
              </div>

              <div className={styles.itemActions}>
                <div className={styles.qtyControl}>
                  <button onClick={() => updateQty(item.product_id, item.color, item.qty - 1)} aria-label="Diminuer" type="button">−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, item.color, item.qty + 1)} aria-label="Augmenter" type="button">+</button>
                </div>
                <p className={styles.itemTotal}>{formatDT(item.price_dt * item.qty)}</p>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.product_id, item.color)}
                  aria-label={`Supprimer ${item.name}`}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <CrossSell items={items} />
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Résumé</h2>

            <ShippingProgress
              cartTotal={subtotal}
              threshold={FREE_THRESHOLD}
              shippingPrice={SHIPPING_PRICE}
            />

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Sous-total</span>
                <span>{formatDT(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className={`${styles.summaryRow} ${styles.discount}`}>
                  <span>{BUNDLE_LABELS[bundleType] || 'Réduction'}</span>
                  <span>−{formatDT(discountAmt)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Livraison</span>
                <span>{shipping === 0 ? 'Gratuite' : formatDT(shipping)}</span>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>{formatDT(total)}</span>
            </div>

            <div className={styles.codBadge}>
              ✅ Paiement à la livraison — Vous payez à la réception
            </div>

            <Link href="/commander" className={styles.checkoutBtn}>
              Commander
              <ArrowRight size={18} />
            </Link>

            <Link href="/shop" className={styles.continueLink}>
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function PotMini({ color }) {
  return (
    <svg viewBox="0 0 40 40" width={40} height={40} fill="none" aria-hidden="true">
      <ellipse cx="20" cy="28" rx="14" ry="9" fill={color} opacity="0.9" />
      <rect x="6" y="15" width="28" height="14" rx="4" fill={color} />
      <ellipse cx="20" cy="15" rx="14" ry="5" fill={color} opacity="0.7" />
    </svg>
  )
}
