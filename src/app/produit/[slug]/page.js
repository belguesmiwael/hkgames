import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductDetail from './ProductDetail'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }) {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', params.slug)
    .single()

  if (!product) return {}
  return {
    title: `${product.name} — HK Games Slime Store`,
    description: product.description || `Slime artisanal ${product.name}. Livraison Tunisie.`,
  }
}

export async function generateStaticParams() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('slug').eq('is_active', true)
  return (products || []).map((p) => ({ slug: p.slug }))
}

export const revalidate = 300

export default async function ProductPage({ params }) {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name, description, line, price_dt, images, colors, bicolor_combos, is_active, position')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // Cross-sell
  const { data: related } = await supabase
    .from('products')
    .select('id, slug, name, price_dt, images, colors, line')
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  // Testimonials
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, customer_name, customer_city, rating, review_text, photo_url')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('is_featured', { ascending: false })
    .limit(6)

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <ProductDetail product={product} related={related || []} testimonials={testimonials || []} />
      </main>
      <Footer />
    </>
  )
}
