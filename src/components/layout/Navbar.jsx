'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="HK Games Slime Store">
          <Image
            src="/icons/hk-logo-192.png"
            alt="HK Games"
            width={40}
            height={40}
            priority
          />
          <span className={styles.logoText}>HK Games</span>
        </Link>

        {/* COD badge — toujours visible */}
        <div className={styles.codBadge}>
          <span className={styles.codDot} />
          Paiement à la livraison
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="/shop" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Boutique
          </Link>
          <Link href="/shop/unicolore" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Unicolore
          </Link>
          <Link href="/shop/bicolore" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Bicolore
          </Link>
          <Link href="/shop/buddies" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Buddies
          </Link>
          <Link href="/avis" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Avis
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/panier" className={styles.cartBtn} aria-label={`Panier — ${itemCount} articles`}>
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount}</span>
            )}
          </Link>

          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}
