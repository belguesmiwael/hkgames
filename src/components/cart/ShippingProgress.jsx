'use client'

import { useSpring, animated } from '@react-spring/web'
import { Truck } from 'lucide-react'
import { formatDT } from '@/lib/utils/formatDT'
import styles from './ShippingProgress.module.css'

export default function ShippingProgress({ cartTotal, threshold, shippingPrice }) {
  const pct = Math.min((cartTotal / threshold) * 100, 100)
  const remaining = Math.max(threshold - cartTotal, 0)

  const { progress } = useSpring({
    progress: pct,
    config: { tension: 120, friction: 14 },
  })

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
        <animated.div
          className={styles.fill}
          style={{ width: progress.to((p) => `${p}%`) }}
        />
        {/* Slime drip effect */}
        <animated.div
          className={styles.drip}
          style={{ left: progress.to((p) => `calc(${p}% - 8px)`) }}
        />
      </div>
    </div>
  )
}
