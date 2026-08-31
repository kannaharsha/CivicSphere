import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, Globe, Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Sectors', href: '#sectors' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Civic Assist', href: '#civic-assist' },
];

const languages = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TE', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'HI', label: 'हिन्दी', flag: '🇮🇳' },
];

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = navItems.map((item) => item.href.substring(1));
      let currentSection = 'home';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 300 && rect.bottom >= 100) {
            currentSection = id;
          }
        }
      }

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentLang = languages.find((l) => l.code === selectedLang) || languages[0];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[80px] ${scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
          : 'bg-white/90 backdrop-blur-xl border-b border-gray-200/40'
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-full">
        <div className="flex items-center justify-between h-full gap-4">

          {/* 1. Left Section: Logo & Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-1 transition-opacity hover:opacity-95"
              aria-label="CivicSphere Homepage"
            >
              {/* Emblem Logo */}
              <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#16A34A] via-[#F59E0B] to-[#2563EB] p-[2px] shadow-sm">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                    <svg className="w-5 h-5 text-[#2563EB]/40 absolute animate-spin-slow" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                    </svg>
                    <svg className="w-4 h-4 text-[#16A34A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18" stroke="#16A34A" />
                      <circle cx="12" cy="6" r="1.5" fill="#F59E0B" stroke="#F59E0B" />
                      <circle cx="18" cy="12" r="1.5" fill="#2563EB" stroke="#2563EB" />
                      <circle cx="6" cy="12" r="1.5" fill="#16A34A" stroke="#16A34A" />
                      <path d="M12 12l6 0" stroke="#2563EB" />
                      <path d="M12 12l-6 0" stroke="#16A34A" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Brand Text */}
              <div className="flex flex-col justify-center whitespace-nowrap">
                <span className="font-heading font-bold text-xl sm:text-2xl text-gray-900 tracking-tight leading-none">
                  Civic<span className="text-[#16A34A]">Sphere</span>
                </span>
                <span className="text-[11px] text-gray-500 font-medium tracking-normal mt-1 leading-none">
                  AI Powered Government Schemes Platform
                </span>
              </div>
            </a>
          </div>

          {/* 2. Center Section: Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1 min-w-0 px-4" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`group relative text-sm font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm py-1 ${isActive
                      ? 'text-[#16A34A] font-bold'
                      : 'text-gray-600 hover:text-[#16A34A] hover:-translate-y-0.5'
                    }`}
                >
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#16A34A] rounded-full"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#16A34A] rounded-full transition-all duration-200 ease-in-out w-0 group-hover:w-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* 3. Right Section: Pinned Completely to the Far Right of the Webpage */}
          <div className="hidden sm:flex flex-shrink-0 items-center justify-end gap-3 ml-auto">

            {/* Language Selector Pill */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="h-10 px-3.5 inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-full shadow-sm transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="flex items-center gap-1.5 leading-none">
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.label}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-0.5" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-xl rounded-2xl p-1.5 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors whitespace-nowrap ${selectedLang === lang.code
                            ? 'bg-emerald-50 text-[#16A34A]'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {selectedLang === lang.code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Login Button */}
            <a
              href="#login"
              className="h-10 px-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200/80 rounded-full hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>Login</span>
            </a>

            {/* Sign Up Button (Rightmost element anchored to edge) */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#signup"
              className="h-10 px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#16A34A] to-[#2563EB] rounded-full shadow-md hover:shadow-lg hover:shadow-emerald-600/20 transition-all whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span className="whitespace-nowrap">Sign Up</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </motion.a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-gray-200/60 shadow-xl overflow-hidden"
          >
            <div className="px-6 py-6 space-y-5">
              <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.substring(1);
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`px-4 py-3 text-base font-semibold rounded-xl transition-all ${isActive
                          ? 'bg-emerald-50 text-[#16A34A]'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {/* Language Switcher Mobile */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Select Language
                </span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${selectedLang === lang.code
                          ? 'bg-emerald-50 text-[#16A34A] border-emerald-300'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
                <a
                  href="#login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Login</span>
                </a>
                <a
                  href="#signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#16A34A] to-[#2563EB] rounded-full shadow-md"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingNavbar;
