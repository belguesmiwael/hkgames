'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import confetti from 'canvas-confetti'
import StockBadge from '@/components/ui/StockBadge'
import { useCartStore } from '@/lib/cart/store'
import { formatDT } from '@/lib/utils/formatDT'
import styles from './ProductCard.module.css'

const LINE_LABELS = { unicolore: 'Unicolore', bicolore: 'Bicolore', buddies: 'Buddy' }

export default function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null)
  const [hoverStyle, setHoverStyle] = useState({})
  const addItem = useCartStore((s) => s.addItem)

  const stock = selectedColor?.stock ?? null

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    setHoverStyle({ transform: `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)` })
  }

  function handleMouseLeave() {
    setHoverStyle({ transform: 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)' })
  }

  function handleAddToCart(e) {
    e.preventDefault()
    if (!selectedColor || selectedColor.stock === 0) return

    addItem({
      product_id: product.id,
      slug:       product.slug,
      name:       `${product.name} ${selectedColor.name}`,
      price_dt:   product.price_dt,
      color:      selectedColor.name,
      color_hex:  selectedColor.hex,
      line:       product.line,
      qty:        1,
      image:      product.images?.[0] || null,
    })

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#a855f7', '#ec4899', '#06b6d4', '#fbbf24'],
    })
  }

  const imageSrc = product.images?.[0] || null

  return (
    <div
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform var(--transition-base)', ...hoverStyle }}
    >
      <Link href={`/produit/${product.slug}`} className={styles.imageWrap}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div
            className={styles.imagePlaceholder}
            style={{ background: `radial-gradient(circle, ${selectedColor?.hex || '#a855f7'}88, ${selectedColor?.hex || '#a855f7'}22)` }}
          >
            <PotSVG color={selectedColor?.hex || '#a855f7'} />
          </div>
        )}

        <div className={styles.lineBadge}>{LINE_LABELS[product.line]}</div>
        <div className={styles.stockOverlay}>
          <StockBadge stock={stock} />
        </div>
      </Link>

      <div className={styles.body}>
        <Link href={`/produit/${product.slug}`} className={styles.name}>{product.name}</Link>
        <p className={styles.price}>{formatDT(product.price_dt)}</p>

        {product.colors && product.colors.length > 1 && (
          <div className={styles.colorRow}>
            {product.colors.map((c) => (
              <button
                key={c.name}
                className={`${styles.colorDot} ${selectedColor?.name === c.name ? styles.colorDotSelected : ''} ${c.stock === 0 ? styles.colorDotEmpty : ''}`}
                style={{ background: c.hex }}
                onClick={() => setSelectedColor(c)}
                title={`${c.name}${c.stock === 0 ? ' — Épuisé' : ''}`}
                aria-label={c.name}
                disabled={c.stock === 0}
              />
            ))}
          </div>
        )}

        <button
          className={styles.addBtn}
          onClick={handleAddToCart}
          disabled={!selectedColor || stock === 0}
          type="button"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingCart size={16} />
          {stock === 0 ? 'Épuisé' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

function PotSVG({ color }) {
  return (
    <svg viewBox="0 0 80 80" width="70" height="70" fill="none" aria-hidden="true">
      <ellipse cx="40" cy="55" rx="28" ry="18" fill={color} opacity="0.9" />
      <rect x="12" y="30" width="56" height="28" rx="8" fill={color} />
      <ellipse cx="40" cy="30" rx="28" ry="10" fill={color} opacity="0.7" />
      <ellipse cx="40" cy="30" rx="22" ry="7" fill="white" opacity="0.15" />
    </svg>
  )
}
