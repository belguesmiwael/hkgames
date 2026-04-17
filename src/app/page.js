'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/homepage/HeroSection'
import SlimeLab from '@/components/homepage/SlimeLab'
import SocialProof from '@/components/homepage/SocialProof'
import CataloguePreview from '@/components/homepage/CataloguePreview'

const SplashScreen = dynamic(() => import('@/components/homepage/SplashScreen'), { ssr: false })

export default function HomePage() {
  const [splashDone, setSplashDone] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('splashSeen')) {
      setSplashDone(true)
      setShowContent(true)
    }
  }, [])

  function handleSplashComplete() {
    setSplashDone(true)
    setTimeout(() => setShowContent(true), 100)
  }

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      {showContent && (
        <>
          <Navbar />
          <main>
            <HeroSection />
            <SocialProof />
            <SlimeLab />
            <CataloguePreview />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}
