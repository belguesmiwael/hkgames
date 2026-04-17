'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateOrderStatus, softDeleteOrder, updateOrderItems } from '@/lib/actions/orders'
import { formatDT } from '@/lib/utils/formatDT'
import { CheckCircle, Phone, XCircle, Trash2, Edit3, ChevronDown } from 'lucide-react'
import styles from './commandes.module.css'

const STATUS_TABS = [
  { id: null,        label: 'Toutes' },
  { id: 'pending',   label: 'En attente' },
  { id: 'confirmed', label: 'Confirmées' },
  { id: 'shipped',   label: 'Expédiées' },
  { id: 'delivered', label: 'Livrées' },
  { id: 'cancelled', label: 'Annulées' },
]

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: '#fbbf24' },
  confirmed: { label: 'Confirmée',   color: '#10b981' },
  on_hold:   { label: 'En suspens',  color: '#fb923c' },
  shipped:   { label: 'Expédiée',    color: '#60a5fa' },
  delivered: { label: 'Livrée',      color: '#34d399' },
  cancelled: { label: 'Annulée',     color: '#ef4444' },
}

const CANCEL_REASONS = [
  'Client injoignable',
  'Client a refusé la livraison',
  'Stock insuffisant',
  'Double commande',
  'Autre',
]

export default function CommandesPage() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState(null)
  const [search, setSearch]           = useState('')
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0])
  const [editModal, setEditModal]     = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    let q = supabase
      .from('orders')
      .select('id, order_number, status, customer_name, customer_phone, customer_city, items, total_dt, created_at, customer_address, customer_notes')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (activeTab) q = q.eq('status', activeTab)
    if (search)    q = q.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`)

    const { data } = await q
    setOrders(data || [])
    setLoading(false)
  }, [activeTab, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Realtime
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()

    // Audio alert
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
      const audio = new Audio('/sounds/order-alert.mp3')
      audio.play().catch(() => {})
    })

    return () => supabase.removeChannel(channel)
  }, [fetchOrders])

  async function handleAction(orderId, action, extra = {}) {
    setActionLoading(orderId + action)
    if (action === 'confirm')      await updateOrderStatus(orderId, 'confirmed', { navexTrigger: true })
    else if (action === 'on_hold') await updateOrderStatus(orderId, 'on_hold')
    else if (action === 'cancel')  await updateOrderStatus(orderId, 'cancelled', { reason: extra.reason })
    else if (action === 'delete')  await softDeleteOrder(orderId)
    setActionLoading(null)
    fetchOrders()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Commandes</h1>
        <input
          className={styles.search}
          placeholder="Rechercher par nom, téléphone, #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={String(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : orders.length === 0 ? (
        <p className={styles.empty}>Aucune commande trouvée.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>#</span><span>Client</span><span>Téléphone</span>
            <span>Ville</span><span>Total</span><span>Statut</span>
            <span>Date</span><span>Actions</span>
          </div>
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || {}
            return (
              <div key={order.id} className={styles.tableRow}>
                <span className={styles.orderNum}>{order.order_number || order.id.slice(0,8)}</span>
                <span>{order.customer_name || '—'}</span>
                <span>
                  <a href={`tel:${order.customer_phone}`} className={styles.phoneLink}>
                    {order.customer_phone}
                  </a>
                </span>
                <span>{order.customer_city || '—'}</span>
                <span className={styles.total}>{formatDT(order.total_dt || 0)}</span>
                <span>
                  <span className={styles.statusBadge} style={{ '--status-color': cfg.color }}>
                    {cfg.label || order.status}
                  </span>
                </span>
                <span className={styles.date}>
                  {new Date(order.created_at).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className={styles.actions}>
                  {order.status === 'pending' && (
                    <button
                      className={`${styles.actionBtn} ${styles.confirm}`}
                      onClick={() => handleAction(order.id, 'confirm')}
                      disabled={actionLoading === order.id + 'confirm'}
                      title="Confirmer"
                      type="button"
                    >
                      <CheckCircle size={15} />
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button
                      className={`${styles.actionBtn} ${styles.hold}`}
                      onClick={() => handleAction(order.id, 'on_hold')}
                      title="Injoignable"
                      type="button"
                    >
                      <Phone size={15} />
                    </button>
                  )}
                  {order.status !== 'cancelled' && (
                    <button
                      className={`${styles.actionBtn} ${styles.cancel}`}
                      onClick={() => setCancelModal(order.id)}
                      title="Annuler"
                      type="button"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                  <button
                    className={`${styles.actionBtn} ${styles.delete}`}
                    onClick={() => { if (confirm('Supprimer définitivement ?')) handleAction(order.id, 'delete') }}
                    title="Supprimer"
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className={styles.overlay} onClick={() => setCancelModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Raison d'annulation</h3>
            <select
              className={styles.select}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className={styles.modalActions}>
              <button className={styles.cancelConfirmBtn} type="button"
                onClick={async () => {
                  await handleAction(cancelModal, 'cancel', { reason: cancelReason })
                  setCancelModal(null)
                }}
              >
                Confirmer l'annulation
              </button>
              <button className={styles.modalClose} type="button" onClick={() => setCancelModal(null)}>
                Retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
