import LandingNavbar from '../components/LandingNavbar'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import SectorCards from '../components/SectorCards'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorks from '../components/HowItWorks'
import AISection from '../components/AISection'
import LanguageSection from '../components/LanguageSection'
import ComparisonSection from '../components/ComparisonSection'
import Testimonials from '../components/Testimonials'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <SectorCards />
        <FeaturesSection />
        <HowItWorks />
        <AISection />
        <LanguageSection />
        <ComparisonSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
