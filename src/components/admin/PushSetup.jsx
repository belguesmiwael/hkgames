'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, CheckCircle } from 'lucide-react'
import { subscribeToPush, unsubscribeFromPush, checkPushSubscription } from '@/lib/push/subscribe'
import styles from './PushSetup.module.css'

export default function PushSetup() {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [msg, setMsg]               = useState(null)

  useEffect(() => {
    checkPushSubscription().then(setSubscribed)
  }, [])

  async function handleSubscribe() {
    setLoading(true)
    const result = await subscribeToPush()
    if (result.success) {
      setSubscribed(true)
      setMsg('Notifications activées ! Vous recevrez une alerte à chaque nouvelle commande.')
    } else {
      setMsg(result.error || 'Erreur lors de l\'activation.')
    }
    setLoading(false)
  }

  async function handleUnsubscribe() {
    setLoading(true)
    await unsubscribeFromPush()
    setSubscribed(false)
    setMsg('Notifications désactivées.')
    setLoading(false)
  }

  async function sendTest() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('HK Games Admin', {
        body: 'Test notification — ça fonctionne !',
        icon: '/icons/hk-logo-192.png',
      })
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          {subscribed ? <Bell size={20} /> : <BellOff size={20} />}
        </div>
        <div>
          <h3 className={styles.title}>Notifications de commandes</h3>
          <p className={styles.subtitle}>
            {subscribed
              ? 'Actives — vous recevrez une alerte à chaque nouvelle commande.'
              : 'Activez les notifications pour être alerté à chaque commande.'}
          </p>
        </div>
        {subscribed && <CheckCircle size={18} className={styles.check} />}
      </div>

      {msg && <p className={styles.msg}>{msg}</p>}

      <div className={styles.actions}>
        {!subscribed ? (
          <button className={styles.btn} onClick={handleSubscribe} disabled={loading} type="button">
            <Bell size={16} />
            {loading ? 'Activation...' : 'Activer les notifications'}
          </button>
        ) : (
          <>
            <button className={styles.testBtn} onClick={sendTest} type="button">
              Tester la notification
            </button>
            <button className={styles.offBtn} onClick={handleUnsubscribe} disabled={loading} type="button">
              {loading ? 'Désactivation...' : 'Désactiver'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
