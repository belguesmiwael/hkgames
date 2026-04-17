import { createClient } from '@/lib/supabase/client'

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { error: 'Push notifications non supportées sur ce navigateur.' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { error: 'Permission notifications refusée.' }
  }

  const registration = await navigator.serviceWorker.ready

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return { error: 'VAPID public key manquante.' }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  const supabase = createClient()
  const { error } = await supabase.from('push_subscriptions').insert({
    subscription: subscription.toJSON(),
    device_name: navigator.userAgent.slice(0, 100),
    is_active: true,
  })

  if (error) return { error: 'Erreur lors de l\'enregistrement de la subscription.' }

  return { success: true, subscription }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return { success: true }

  const supabase = createClient()
  await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('subscription->>endpoint', subscription.endpoint)

  await subscription.unsubscribe()
  return { success: true }
}

export async function checkPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return !!subscription
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
