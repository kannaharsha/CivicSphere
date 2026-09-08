import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Hash, Calendar, Heart, Shield, Briefcase, GraduationCap,
  IndianRupee, MapPin, Building, Home, Languages, CheckCircle2,
  Edit3, Copy, Check, Sparkles, ArrowLeft, Clock,
  Key, CheckCircle
} from 'lucide-react'
import { useAuth } from '../../firebase/AuthProvider'
import CitizenProfileForm from '../CitizenProfileForm'

interface ProfileSectionProps {
  isDark?: boolean
}

export default function ProfileSection({ isDark = false }: ProfileSectionProps) {
  const { profile, fetchCitizenProfile, user, resendVerification, resetPassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false)

  const handleUpdatePassword = async () => {
    if (!userEmail) return
    setSendingPasswordReset(true)
    try {
      await resetPassword(userEmail)
    } catch (err) {
      console.error('Failed to send password reset email:', err)
    } finally {
      setTimeout(() => setSendingPasswordReset(false), 800)
    }
  }

  const handleCopy = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleResendEmail = async () => {
    setSendingVerification(true)
    try {
      await resendVerification()
    } finally {
      setTimeout(() => setSendingVerification(false), 800)
    }
  }

  // Calculate profile completeness percentage
  const calculateCompletion = () => {
    if (!profile) return 25
    if (profile.profileCompleted) return 100
    const fields = [
      profile.fullName, profile.dateOfBirth, profile.gender, profile.maritalStatus,
      profile.casteCategory, profile.occupation, profile.employmentStatus,
      profile.educationQualification, profile.annualFamilyIncome, profile.state,
      profile.district, profile.mandal, profile.villageCity, profile.residenceType, profile.pincode
    ]
    const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length
    return Math.min(100, Math.max(25, Math.round((filled / fields.length) * 100)))
  }

  const completionPercent = calculateCompletion()

  // Generate missing fields list dynamically
  const getMissingFields = () => {
    if (!profile) return ['Full Profile Details']
    const missing: string[] = []
    if (!profile.dateOfBirth) missing.push('Date of Birth')
    if (!profile.occupation) missing.push('Occupation')
    if (!profile.annualFamilyIncome) missing.push('Annual Family Income')
    if (!profile.district) missing.push('District')
    if (!profile.mandal) missing.push('Mandal / Tehsil')
    if (!profile.pincode) missing.push('Pincode')
    if (!profile.educationQualification) missing.push('Education Qualification')
    return missing
  }

  const missingFields = getMissingFields()

  // Citizen ID directly matches database profile_id (was the citizen_id, e.g. Civs1001)
  const getCitizenDisplayId = () => {
    if (profile?.profileId) {
      return profile.profileId
    }
    if (profile?.citizenId) {
      return profile.citizenId
    }
    return 'Civs1001'
  }

  const citizenId = getCitizenDisplayId()
  const userEmail = profile?.email || user?.email || 'citizen@civicsphere.com'
  const userFullName = profile?.fullName || user?.displayName || 'Citizen User'
  const isEmailVerified = user?.emailVerified ?? true
  const userPhone = profile?.phone || '+91 98765 43210'

  // Format currency
  const formatIncome = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return '₹ 2,50,000 / year'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  // Format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '15 Aug 1996'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // SVG Circular Progress Ring calculations
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference

  return (
    <div className={`space-y-8 min-h-screen select-none font-sans ${isDark ? 'text-white' : 'text-[#111111]'}`}>

      {/* ==================== 1. TOP TITLE CONTROL & ACTION BAR ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EFE4C8]/80 dark:border-slate-800"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#111111]'
            }`}>
              Citizen Profile Dashboard
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs ${
              isDark
                ? 'bg-[#00B87C]/15 border border-[#00B87C]/40 text-[#00B87C]'
                : 'bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#D4A537]'
            }`}>
              <Sparkles className="w-3.5 h-3.5" /> CivicSphere Portal
            </span>
          </div>
          <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-[#4B5563]'}`}>
            Manage your personal information, account verification status, and profile preferences
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Update Password via Firebase Reset Email Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpdatePassword}
            disabled={sendingPasswordReset}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                : 'bg-[#FFFCF5] border-[#EFE4C8] text-[#111111] hover:bg-[#FFF9EA] hover:border-[#D4A537]'
            }`}
            title="Send Firebase Password Reset Email"
          >
            <Key className={`w-3.5 h-3.5 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'} ${sendingPasswordReset ? 'animate-spin' : ''}`} />
            <span>{sendingPasswordReset ? 'Sending Email...' : 'Update Password'}</span>
          </motion.button>

          {/* Toggle Edit Profile Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg text-white transition-all relative overflow-hidden group ${
              isDark
                ? 'bg-gradient-to-r from-[#00B87C] via-[#059669] to-[#00B87C] shadow-[#00B87C]/25'
                : 'bg-gradient-to-r from-[#D4A537] via-[#F59E0B] to-[#D4A537] shadow-[#F59E0B]/25'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            {isEditing ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                Back to Profile View
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Profile Info
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ==================== 2. MAIN VIEW SWITCHER (VIEW MODE VS EDIT MODE) ==================== */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <CitizenProfileForm
              isModal={false}
              isDark={isDark}
              onSuccess={() => {
                setIsEditing(false)
                fetchCitizenProfile()
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* ==================== SECTION A: HERO PROFILE HEADER & COMPLETION WIDGET ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* FLOATING HERO PROFILE HEADER (8 COLS) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.005 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`lg:col-span-8 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                {/* Background Ambient Glow Lines (Emerald Green in Dark Mode, Yellow in Light Mode) */}
                <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark ? 'bg-[#00B87C]/25' : 'bg-[#F59E0B]/20'
                }`} />
                {isDark && (
                  <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-gradient-to-tr from-[#00B87C]/20 via-[#059669]/10 to-transparent blur-3xl pointer-events-none" />
                )}

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                  {/* Avatar Photo Frame */}
                  <div className="relative group/avatar shrink-0">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] shadow-xl transition-transform group-hover/avatar:scale-105 ${
                      isDark
                        ? 'bg-gradient-to-tr from-[#00B87C] via-[#059669] to-[#00B87C]'
                        : 'bg-gradient-to-tr from-[#D4A537] via-[#F59E0B] to-[#D4A537]'
                    }`}>
                      {profile?.profilePhotoUrl ? (
                        <img
                          src={profile.profilePhotoUrl}
                          alt={userFullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-3xl font-black text-white font-heading">
                          {userFullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-7 h-7 ${isDark ? 'bg-[#00B87C]' : 'bg-[#D4A537]'} border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md animate-pulse`}>
                      ✓
                    </span>
                  </div>

                  {/* Profile Key Info */}
                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className={`text-2xl sm:text-3xl font-black tracking-tight font-heading ${
                        isDark ? 'text-white' : 'text-[#111111]'
                      }`}>
                        {userFullName}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs ${
                        isDark
                          ? 'bg-[#00B87C]/15 border border-[#00B87C]/40 text-[#00B87C]'
                          : 'bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#D4A537]'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Account Verified
                      </span>
                    </div>

                    {/* Citizen ID & Email Copy Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                      <button
                        onClick={() => handleCopy(citizenId, 'id')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                          isDark
                            ? 'bg-slate-900/90 border-[#00B87C]/40 text-emerald-400 hover:bg-slate-800 hover:border-[#00B87C]'
                            : 'bg-white/90 border-[#FCD34D]/70 text-[#111111] hover:bg-[#FEF3C7]/60 hover:border-[#F59E0B] shadow-xs'
                        }`}
                        title="Click to copy Citizen ID"
                      >
                        <Hash className={`w-3.5 h-3.5 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} />
                        <span>Citizen ID: {citizenId}</span>
                        {copiedField === 'id' ? <Check className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> : <Copy className="w-3 h-3 opacity-60" />}
                      </button>

                      <button
                        onClick={() => handleCopy(userEmail, 'email')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                          isDark
                            ? 'bg-slate-900/90 border-[#00B87C]/40 text-emerald-400 hover:bg-slate-800 hover:border-[#00B87C]'
                            : 'bg-white/90 border-[#FCD34D]/70 text-[#111111] hover:bg-[#FEF3C7]/60 hover:border-[#F59E0B] shadow-xs'
                        }`}
                        title="Click to copy Email"
                      >
                        <Mail className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-[#D4A537]'}`} />
                        <span className="truncate max-w-[170px] sm:max-w-[210px]">{userEmail}</span>
                        {copiedField === 'email' ? <Check className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> : <Copy className="w-3 h-3 opacity-60" />}
                      </button>
                    </div>

                    <p className={`text-xs font-bold pt-1 ${isDark ? 'text-slate-400' : 'text-[#4B5563]'}`}>
                      {profile?.occupation ? `${profile.occupation} • ` : 'Citizen • '}
                      {profile?.district ? `${profile.district}, ` : 'Hyderabad, '}
                      {profile?.state || 'Telangana, India'}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata Line */}
                <div className={`flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t relative z-10 text-xs font-bold ${
                  isDark ? 'border-[#00B87C]/30' : 'border-[#FCD34D]/40'
                }`}>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-[#00B87C]' : 'text-[#F59E0B]'}`} />
                    <span>Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`}>
                    <Languages className="w-3.5 h-3.5" />
                    <span>Preferred Language: {profile?.preferredLanguage || 'English'}</span>
                  </div>
                </div>
              </motion.div>

              {/* PROFILE COMPLETION WIDGET (4 COLS) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`lg:col-span-4 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                {/* Glowing Ambient Radial Light Spheres */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#00B87C]/25 via-[#059669]/15 to-transparent'
                    : 'bg-gradient-to-br from-[#F59E0B]/15 via-[#FBBF24]/10 to-transparent'
                }`} />

                <div className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                  isDark ? 'border-[#00B87C]/30' : 'border-[#FCD34D]/40'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} />
                    <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      Profile Completion
                    </h3>
                  </div>
                  <span className={`text-xs font-black ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`}>{completionPercent}%</span>
                </div>

                <div className="flex items-center gap-5 my-3 relative z-10">
                  {/* Animated SVG Progress Circle */}
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        className={isDark ? 'text-slate-800' : 'text-slate-200/90'}
                        fill="transparent"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={isDark ? '#00B87C' : '#D4A537'}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className={`text-base font-black ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`}>{completionPercent}%</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {missingFields.length > 0 ? 'Incomplete Fields:' : 'Status Verified'}
                    </span>
                    {missingFields.length > 0 ? (
                      <ul className="space-y-1 text-xs font-bold text-slate-600 dark:text-slate-300 max-h-16 overflow-y-auto">
                        {missingFields.slice(0, 2).map((field, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#00B87C]' : 'bg-[#D4A537]'}`} />
                            <span className="truncate">{field}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-xs font-extrabold ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`}>Profile 100% Completed</p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className={`w-full py-2.5 rounded-2xl text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all relative z-10 overflow-hidden group/btn ${
                    isDark
                      ? 'bg-gradient-to-r from-[#00B87C] via-[#059669] to-[#00B87C] shadow-[#00B87C]/20 hover:shadow-[#00B87C]/40'
                      : 'bg-gradient-to-r from-[#D4A537] via-[#F59E0B] to-[#D4A537] shadow-[#F59E0B]/20 hover:shadow-[#F59E0B]/40'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Complete Profile</span>
                </motion.button>
              </motion.div>

            </div>

            {/* ==================== SECTION B: REAL ACCOUNT VERIFICATION CARD ==================== */}
            <div className="w-full">

              {/* EMAIL VERIFICATION CARD */}
              <motion.div
                whileHover={{ y: -3, scale: 1.005 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-6 rounded-3xl flex items-center justify-between gap-4 group transition-all duration-300 relative overflow-hidden ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#00B87C]/25 via-[#059669]/15 to-transparent'
                    : 'bg-gradient-to-br from-[#F59E0B]/15 via-[#FBBF24]/10 to-transparent'
                }`} />

                <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isEmailVerified
                      ? isDark
                        ? 'bg-[#00B87C]/15 border-[#00B87C]/40 text-[#00B87C]'
                        : 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#D4A537]'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                        Email Address Verification
                      </h4>
                      {isEmailVerified ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isDark
                            ? 'bg-[#00B87C]/20 text-[#00B87C] border border-[#00B87C]/30'
                            : 'bg-[#F59E0B]/20 text-[#D4A537] border border-[#F59E0B]/30'
                        }`}>
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500 truncate mt-0.5">{userEmail}</p>
                  </div>
                </div>

                {!isEmailVerified && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResendEmail}
                    disabled={sendingVerification}
                    className={`px-4 py-2 rounded-xl text-white text-xs font-black cursor-pointer shadow-md shrink-0 relative z-10 ${
                      isDark
                        ? 'bg-gradient-to-r from-[#00B87C] to-[#059669] shadow-[#00B87C]/20'
                        : 'bg-gradient-to-r from-[#D4A537] to-[#F59E0B] shadow-[#F59E0B]/20'
                    }`}
                  >
                    {sendingVerification ? 'Sending...' : 'Verify Now'}
                  </motion.button>
                )}
              </motion.div>

            </div>

            {/* ==================== SECTION C: PERSONAL INFORMATION CARDS ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* CARD 1: PERSONAL INFORMATION */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-6 rounded-3xl space-y-4 group transition-all duration-300 relative overflow-hidden ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#00B87C]/25 via-[#059669]/15 to-transparent'
                    : 'bg-gradient-to-br from-[#F59E0B]/15 via-[#FBBF24]/10 to-transparent'
                }`} />

                <div className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                  isDark ? 'border-[#00B87C]/30' : 'border-[#FCD34D]/40'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D4A537]'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      Personal Information
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`text-xs font-black hover:underline flex items-center gap-1 cursor-pointer ${
                      isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <User className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Full Name
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{userFullName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Date of Birth
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{formatDate(profile?.dateOfBirth)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Hash className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Age
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      {profile?.age !== null && profile?.age !== undefined ? `${profile.age} Years` : '28 Years'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Heart className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Gender
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.gender || 'Male'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Heart className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Marital Status
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.maritalStatus || 'Single'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Shield className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Category / Caste
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.casteCategory || 'General'}</p>
                  </div>
                </div>
              </motion.div>

              {/* CARD 2: CONTACT INFORMATION */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-6 rounded-3xl space-y-4 group transition-all duration-300 relative overflow-hidden ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#00B87C]/25 via-[#059669]/15 to-transparent'
                    : 'bg-gradient-to-br from-[#F59E0B]/15 via-[#FBBF24]/10 to-transparent'
                }`} />

                <div className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                  isDark ? 'border-[#00B87C]/30' : 'border-[#FCD34D]/40'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D4A537]'
                    }`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      Contact Information
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`text-xs font-black hover:underline flex items-center gap-1 cursor-pointer ${
                      isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Mail className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Email Address
                    </span>
                    <p className={`text-xs font-black truncate ${isDark ? 'text-emerald-400' : 'text-[#111111]'}`}>{userEmail}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Phone className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Mobile Number
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{userPhone}</p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Languages className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Preferred Language
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      {profile?.preferredLanguage || 'English'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CARD 3: ADDRESS INFORMATION */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-6 rounded-3xl space-y-4 group transition-all duration-300 relative overflow-hidden ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#00B87C]/25 via-[#059669]/15 to-transparent'
                    : 'bg-gradient-to-br from-[#F59E0B]/15 via-[#FBBF24]/10 to-transparent'
                }`} />

                <div className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                  isDark ? 'border-[#00B87C]/30' : 'border-[#FCD34D]/40'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D4A537]'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      Address & Location
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`text-xs font-black hover:underline flex items-center gap-1 cursor-pointer ${
                      isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> State
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.state || 'Telangana'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Building className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> District
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.district || 'Hyderabad'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Mandal / Tehsil
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.mandal || 'Ameerpet'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Home className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Village / City
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.villageCity || 'Hyderabad'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Building className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Residence Type
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.residenceType || 'Urban'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Hash className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Pincode
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.pincode || '500038'}</p>
                  </div>
                </div>
              </motion.div>

              {/* CARD 4: ACCOUNT INFORMATION */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-6 rounded-3xl space-y-4 group transition-all duration-300 relative overflow-hidden ${
                  isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#00B87C]/25 via-[#059669]/15 to-transparent'
                    : 'bg-gradient-to-br from-[#F59E0B]/15 via-[#FBBF24]/10 to-transparent'
                }`} />

                <div className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                  isDark ? 'border-[#00B87C]/30' : 'border-[#FCD34D]/40'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D4A537]'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      Account Details
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Hash className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> CivicSphere Citizen ID
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-emerald-400' : 'text-[#111111]'}`}>{citizenId}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Briefcase className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Occupation
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.occupation || 'Farmer / Citizen'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <GraduationCap className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Education Qualification
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#111111]'}`}>{profile?.educationQualification || "Bachelor's Degree"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <IndianRupee className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} /> Annual Family Income
                    </span>
                    <p className={`text-xs font-black ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`}>{formatIncome(profile?.annualFamilyIncome)}</p>
                  </div>
                </div>
              </motion.div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
