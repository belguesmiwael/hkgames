/**
 * Bundle rules for the cart
 * Returns { discount: percentage, bundleType: string | null, savings: number }
 */
export function computeBundle(items) {
  if (!items || items.length === 0) return { discount: 0, bundleType: null, savings: 0 }

  const unicolores = items.filter((i) => i.line === 'unicolore')
  const bicolores  = items.filter((i) => i.line === 'bicolore')
  const buddies    = items.filter((i) => i.line === 'buddies')

  const uniqueUnicoloreColors = new Set(unicolores.map((i) => i.color))
  const uniqueBuddyColors     = new Set(buddies.map((i) => i.color))

  const subtotal = items.reduce((s, i) => s + (i.price_dt || 0) * (i.qty || 1), 0)

  // Pack Famille Monstre: ≥ 3 Buddies de couleurs différentes
  if (uniqueBuddyColors.size >= 3) {
    const savings = parseFloat((subtotal * 0.18).toFixed(3))
    return { discount: 18, bundleType: 'famille_monstre', savings }
  }

  // Pack Alchimiste: Les 3 Bicolores dans le panier
  if (bicolores.length >= 3) {
    const savings = parseFloat((subtotal * 0.20).toFixed(3))
    return { discount: 20, bundleType: 'alchimiste', savings }
  }

  // Pack Découverte: ≥ 3 Unicolores de couleurs différentes
  if (uniqueUnicoloreColors.size >= 3) {
    const savings = parseFloat((subtotal * 0.15).toFixed(3))
    return { discount: 15, bundleType: 'decouverte', savings }
  }

  return { discount: 0, bundleType: null, savings: 0 }
}

export function getBundleUpsell(items) {
  if (!items || items.length === 0) return null

  const unicolores = items.filter((i) => i.line === 'unicolore')
  const bicolores  = items.filter((i) => i.line === 'bicolore')
  const buddies    = items.filter((i) => i.line === 'buddies')

  const uniqueUnicoloreColors = new Set(unicolores.map((i) => i.color))
  const uniqueBuddyColors     = new Set(buddies.map((i) => i.color))

  if (uniqueBuddyColors.size === 2) {
    return { message: "Ajoute 1 Buddy d'une autre couleur → Pack Famille Monstre (-18%) !", type: 'buddies' }
  }

  if (bicolores.length === 2) {
    return { message: 'Ajoute le 3ème Bicolore → Pack Alchimiste (-20%) !', type: 'bicolore' }
  }

  if (uniqueUnicoloreColors.size === 2) {
    return { message: "Ajoute 1 Unicolore d'une autre couleur → Pack Découverte (-15%) !", type: 'unicolore' }
  }

  return null
}

export const BUNDLE_LABELS = {
  decouverte:     '🎁 Pack Découverte activé !',
  alchimiste:     '⚗️ Pack Alchimiste activé !',
  famille_monstre:'👨‍👩‍👧 Famille Monstre activé !',
}
