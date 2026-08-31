import { Leaf, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

const footerLinks = {
  platform: {
    title: 'Platform',
    links: [
      { label: 'About CivicSphere', href: '#about' },
      { label: 'Features', href: '#features' },
      { label: 'Civic Assist', href: '#civic-assist' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
  },
  sectors: {
    title: 'Government Sectors',
    links: [
      { label: 'Agriculture', href: '#sectors' },
      { label: 'Education', href: '#sectors' },
      { label: 'Healthcare', href: '#sectors' },
      { label: 'Employment', href: '#sectors' },
      { label: 'Social Welfare', href: '#sectors' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'FAQs', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
  languages: {
    title: 'Languages',
    links: [
      { label: '🇬🇧 English', href: '#languages' },
      { label: '🇮🇳 తెలుగు (Telugu)', href: '#languages' },
      { label: '🇮🇳 हिन्दी (Hindi)', href: '#languages' },
    ],
  },
}

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer
      className="bg-gradient-to-b from-gray-900 to-slate-950 text-gray-400"
      role="contentinfo"
      aria-label="CivicSphere footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-heading text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                CivicSphere
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-5 text-gray-500">
              An Intelligent Platform for Personalized Citizen-Centric Government Schemes — powered by AI.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                <span>Andhra Pradesh, India</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                <span>contact@civicsphere.in</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                <span>Final Year Project — 2026</span>
              </div>
            </div>

            {/* External links */}
            <div className="mt-5 space-y-1.5">
              {[
                { label: 'India.gov.in', href: 'https://india.gov.in', desc: 'National Portal' },
                { label: 'myScheme.gov.in', href: 'https://myscheme.gov.in', desc: 'Official Schemes' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {link.label}
                  <span className="text-gray-600">— {link.desc}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-heading text-sm font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5" role="list">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => {
                        if (link.href.startsWith('#')) scrollTo(link.href)
                      }}
                      className="text-sm text-gray-500 hover:text-green-400 transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500 text-center sm:text-left">
              © 2026 <span className="text-white font-semibold">CivicSphere</span> — Final Year Project
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'RAG + LLM'].map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Flag */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <span className="text-red-500 text-lg">❤️</span>
              <span>for</span>
              <span className="text-lg">🇮🇳</span>
              <span>India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
