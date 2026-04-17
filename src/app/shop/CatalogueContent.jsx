'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/product/ProductCard'
import styles from './CatalogueContent.module.css'

const TABS = [
  { id: null,          label: 'Tous' },
  { id: 'unicolore',   label: 'Unicolore' },
  { id: 'bicolore',    label: 'Bicolore' },
  { id: 'buddies',     label: 'Buddies' },
]

const COLORS = ['Rouge', 'Bleu', 'Jaune', 'Vert', 'Rose', 'Violet']
const COLOR_HEX = { Rouge: '#ef4444', Bleu: '#3b82f6', Jaune: '#eab308', Vert: '#22c55e', Rose: '#ec4899', Violet: '#a855f7' }

const SORT_OPTIONS = [
  { value: 'position',  label: 'Popularité' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc',label: 'Prix décroissant' },
]

export default function CatalogueContent({ initialProducts = [], initialLine }) {
  const [activeTab, setActiveTab] = useState(initialLine || null)
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [colorFilter, setColorFilter] = useState([])
  const [sort, setSort] = useState('position')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('products')
        .select('id, slug, name, description, line, price_dt, images, colors, bicolor_combos, is_active, position')
        .eq('is_active', true)

      if (activeTab) query = query.eq('line', activeTab)

      if (sort === 'price_asc')  query = query.order('price_dt', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price_dt', { ascending: false })
      else query = query.order('position', { ascending: true })

      const { data } = await query
      setProducts(data || [])
      setLoading(false)
    }

    fetchProducts()
  }, [activeTab, sort])

  // Realtime stock updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('products-stock')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setProducts((prev) =>
          prev.map((p) => p.id === payload.new.id ? { ...p, ...payload.new } : p)
        )
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = colorFilter.length > 0
    ? products.filter((p) =>
        p.colors?.some((c) => colorFilter.includes(c.name))
      )
    : products

  function toggleColor(color) {
    setColorFilter((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Notre Boutique</h1>
        <p className={styles.subtitle}>
          {filtered.length} slimes disponibles · Livraison partout en Tunisie
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={String(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => startTransition(() => setActiveTab(tab.id))}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className={styles.filtersRow}>
        <div className={styles.colorFilters}>
          {COLORS.map((c) => (
            <button
              key={c}
              className={`${styles.colorFilter} ${colorFilter.includes(c) ? styles.colorFilterActive : ''}`}
              style={{ '--filter-color': COLOR_HEX[c] }}
              onClick={() => toggleColor(c)}
              title={c}
              aria-label={c}
              aria-pressed={colorFilter.includes(c)}
              type="button"
            />
          ))}
        </div>

        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => startTransition(() => setSort(e.target.value))}
          aria-label="Trier par"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun produit trouvé.</p>
          <button onClick={() => { setColorFilter([]); setActiveTab(null) }} type="button" className={styles.resetBtn}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className={`${styles.grid} ${isPending ? styles.pending : ''}`}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
