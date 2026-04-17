'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Truck, Shield, Star } from 'lucide-react'
import styles from './HeroSection.module.css'

const HERO_PRODUCTS = [
  { name: 'Unicolore Violet', slug: 'unicolore-violet', price: 12, color: '#a855f7', image: null },
  { name: 'Bicolore Rose+Bleu', slug: 'bicolore-rose-bleu', price: 15, color: '#ec4899', image: null },
  { name: 'Buddy Vert', slug: 'buddies-vert', price: 18, color: '#22c55e', image: null },
]

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <Star size={14} />
          <span>1 248 Slimes vendus ce mois</span>
        </div>

        <h1 className={styles.title}>
          Le Slime le plus
          <span className={styles.titleGradient}> Magique </span>
          de Tunisie
        </h1>

        <p className={styles.subtitle}>
          Slimes artisanaux 100% non-toxiques · Livraison partout en Tunisie ·
          Paiement à la réception
        </p>

        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <Truck size={16} className={styles.trustIcon} />
            <span>Livraison J+1 à Tunis</span>
          </div>
          <div className={styles.trustItem}>
            <Shield size={16} className={styles.trustIcon} />
            <span>Non-toxique certifié</span>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <Link href="/shop" className={styles.ctaBtn}>
            Découvrir la boutique
            <ArrowRight size={18} />
          </Link>
          <Link href="#labo" className={styles.secondaryBtn}>
            Créer mon Slime
          </Link>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {HERO_PRODUCTS.map((product, i) => (
          <Link
            key={product.slug}
            href={`/produit/${product.slug}`}
            className={styles.productCard}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div
              className={styles.productPot}
              style={{ background: `radial-gradient(circle at 40% 30%, ${product.color}cc, ${product.color}66)` }}
            >
              <PotSVG color={product.color} />
            </div>
            <p className={styles.productName}>{product.name}</p>
            <p className={styles.productPrice}>{product.price},000 DT</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PotSVG({ color }) {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" aria-hidden="true">
      <ellipse cx="40" cy="55" rx="28" ry="18" fill={color} opacity="0.9" />
      <rect x="12" y="30" width="56" height="28" rx="8" fill={color} />
      <ellipse cx="40" cy="30" rx="28" ry="10" fill={color} opacity="0.7" />
      <ellipse cx="40" cy="30" rx="22" ry="7" fill="white" opacity="0.15" />
      <ellipse cx="32" cy="28" rx="6" ry="3" fill="white" opacity="0.3" />
    </svg>
  )
}
