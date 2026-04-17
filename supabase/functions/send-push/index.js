import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

function buildPayload(type, orderId, orderData) {
  if (type === 'pending') {
    return {
      title: '⏳ Commande en attente — HK Games',
      body: `${orderData?.customer_phone || 'Inconnu'} — ${orderData?.total_dt || 0} DT — ${orderData?.customer_city || ''}`,
      icon: '/icons/hk-logo-192.png',
      badge: '/icons/badge-72.png',
      tag: 'pending-order',
      data: { orderId, url: `/admin/commandes?id=${orderId}` },
      actions: [
        { action: 'view', title: 'Voir la commande' },
        { action: 'call', title: 'Appeler le client' },
      ],
      vibrate: [200, 100, 200],
      requireInteraction: true,
    }
  }

  if (type === 'confirmed') {
    return {
      title: '✅ Nouvelle commande confirmée !',
      body: `${orderData?.customer_name || ''} · ${orderData?.customer_city || ''} · ${orderData?.total_dt || 0} DT`,
      icon: '/icons/hk-logo-192.png',
      badge: '/icons/badge-72.png',
      tag: 'confirmed-order',
      data: { orderId, url: `/admin/commandes?id=${orderId}` },
      vibrate: [100, 50, 100],
    }
  }

  return {
    title: 'HK Games — Mise à jour commande',
    body: `Commande ${orderId.slice(0, 8).toUpperCase()} mise à jour`,
    data: { orderId, url: `/admin/commandes` },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  try {
    const { orderId, type } = await req.json()

    const vapidPublic  = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublic || !vapidPrivate) {
      return new Response('VAPID keys missing', { status: 500 })
    }

    webpush.setVapidDetails('mailto:admin@hkgames.tn', vapidPublic, vapidPrivate)

    // Fetch order data for notification body
    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('customer_phone, customer_name, customer_city, total_dt')
      .eq('id', orderId)
      .single()

    const payload = buildPayload(type, orderId, orderData)

    // Fetch all active push subscriptions
    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('is_active', true)

    if (!subs || subs.length === 0) {
      return new Response('No subscriptions', { status: 200 })
    }

    const results = await Promise.allSettled(
      subs.map(async ({ id, subscription }) => {
        try {
          await webpush.sendNotification(subscription, JSON.stringify(payload))
          // Update last_used_at
          await supabaseAdmin
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', id)
        } catch (err) {
          if (err.statusCode === 410) {
            // Subscription expired — deactivate it
            await supabaseAdmin
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', id)
          }
          throw err
        }
      })
    )

    const sent    = results.filter((r) => r.status === 'fulfilled').length
    const failed  = results.filter((r) => r.status === 'rejected').length

    return new Response(JSON.stringify({ sent, failed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
