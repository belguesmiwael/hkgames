'use client'

import { motion } from 'framer-motion'
import { Truck } from 'lucide-react'
import { formatDT } from '@/lib/utils/formatDT'
import styles from './ShippingProgress.module.css'

export default function ShippingProgress({ cartTotal, threshold, shippingPrice }) {
  const pct = Math.min((cartTotal / threshold) * 100, 100)
  const remaining = Math.max(threshold - cartTotal, 0)
  const spring = { type: 'spring', stiffness: 120, damping: 14 }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Truck size={16} className={pct >= 100 ? styles.iconGreen : styles.iconMuted} />
        {pct >= 100 ? (
          <span className={styles.free}>Livraison gratuite activée !</span>
        ) : (
          <span className={styles.remaining}>
            Plus que <strong>{formatDT(remaining)}</strong> pour la livraison gratuite
          </span>
        )}
      </div>

      <div className={styles.track}>
        <motion.div
          className={styles.fill}
          animate={{ width: `${pct}%` }}
          transition={spring}
        />
        <motion.div
          className={styles.drip}
          animate={{ left: `calc(${pct}% - 8px)` }}
          transition={spring}
        />
      </div>
    </div>
  )
}
