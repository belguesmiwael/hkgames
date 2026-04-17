import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import StarRating from '@/components/ui/StarRating'
import Image from 'next/image'
import styles from './avis.module.css'

export const metadata = {
  title: 'Avis clients — HK Games Slime Store',
}

export const revalidate = 300

export default async function AvisPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('testimonials')
    .select('id, customer_name, customer_city, rating, review_text, photo_url, created_at')
    .eq('is_approved', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <div className={styles.container}>
          <h1 className={styles.title}>Avis de nos clients</h1>
          <p className={styles.subtitle}>{reviews?.length || 0} avis vérifiés</p>

          <div className={styles.grid}>
            {(reviews || []).map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.name}>{r.customer_name}</p>
                    {r.customer_city && <p className={styles.city}>{r.customer_city}</p>}
                  </div>
                  <StarRating rating={r.rating} size={14} />
                </div>
                <p className={styles.text}>{r.review_text}</p>
                {r.photo_url && (
                  <Image
                    src={r.photo_url}
                    alt={`Avis de ${r.customer_name}`}
                    width={200}
                    height={200}
                    className={styles.photo}
                  />
                )}
                <p className={styles.date}>
                  {new Date(r.created_at).toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
