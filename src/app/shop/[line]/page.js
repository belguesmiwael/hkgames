import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CatalogueContent from '../CatalogueContent'

const LINE_META = {
  unicolore: { title: 'Slimes Unicolores', desc: 'Découvrez nos slimes unicolores artisanaux en 6 couleurs vibrantes.' },
  bicolore:  { title: 'Slimes Bicolores',  desc: 'Créez votre couleur secrète en mélangeant 2 couleurs magiques.' },
  buddies:   { title: 'Slime Buddies',     desc: 'Votre monstre de slime, votre ami. Avec yeux mobiles inclus !' },
}

export async function generateMetadata({ params }) {
  const meta = LINE_META[params.line] || {}
  return { title: `${meta.title} — HK Games`, description: meta.desc }
}

export async function generateStaticParams() {
  return [{ line: 'unicolore' }, { line: 'bicolore' }, { line: 'buddies' }]
}

export const revalidate = 300

export default function LinePage({ params }) {
  const meta = LINE_META[params.line]
  if (!meta) return null

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <CatalogueContent initialLine={params.line} />
      </main>
      <Footer />
    </>
  )
}
