import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Lock, User, Mail, Calendar, Hash, Heart, Shield, Briefcase,
  GraduationCap, IndianRupee, MapPin, Building, Home,
  Languages, Save, Cpu, Sparkles, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../firebase/AuthProvider'
import type { CitizenProfile } from '../services/userService'

interface CitizenProfileFormProps {
  onSuccess?: () => void
  isModal?: boolean
  isDark?: boolean
}

export default function CitizenProfileForm({ onSuccess, isModal = false, isDark: propIsDark }: CitizenProfileFormProps) {
  const [isDarkState, setIsDarkState] = useState(() => {
    if (typeof propIsDark === 'boolean') return propIsDark
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  useEffect(() => {
    if (typeof propIsDark === 'boolean') {
      setIsDarkState(propIsDark)
    } else if (typeof document !== 'undefined') {
      setIsDarkState(document.documentElement.classList.contains('dark'))
    }
  }, [propIsDark])

  const isDark = typeof propIsDark === 'boolean' ? propIsDark : isDarkState
  const { profile, saveCitizenProfile, user } = useAuth()
  const [saving, setSaving] = useState(false)

  // Local form state representing all citizen_profiles database columns
  const [formData, setFormData] = useState<Partial<CitizenProfile>>({
    profileId: profile?.profileId || profile?.citizenId || 'Civs1001',
    citizenId: profile?.citizenId || profile?.profileId || 'Civs1001',
    firebaseUid: user?.uid || profile?.firebaseUid || '',
    email: profile?.email || user?.email || '',
    fullName: profile?.fullName || user?.displayName || '',
    dateOfBirth: profile?.dateOfBirth || '',
    age: profile?.age || null,
    gender: profile?.gender || 'Male',
    maritalStatus: profile?.maritalStatus || 'Single',
    casteCategory: profile?.casteCategory || 'General',
    occupation: profile?.occupation || '',
    employmentStatus: profile?.employmentStatus || 'Employed',
    educationQualification: profile?.educationQualification || '',
    annualFamilyIncome: profile?.annualFamilyIncome || null,
    state: profile?.state || '',
    district: profile?.district || '',
    mandal: profile?.mandal || '',
    villageCity: profile?.villageCity || '',
    residenceType: profile?.residenceType || 'Urban',
    pincode: profile?.pincode || '',
    disabilityPercentage: profile?.disabilityPercentage || 0,
    preferredLanguage: profile?.preferredLanguage || 'English',
    profilePhotoUrl: profile?.profilePhotoUrl || user?.photoURL || '',
    profileCompleted: profile?.profileCompleted || false,
  })

  // Sync state when profile updates from backend
  useEffect(() => {
    if (profile) {
      setFormData({
        profileId: profile.profileId || profile.citizenId || 'Civs1001',
        citizenId: profile.citizenId || profile.profileId || 'Civs1001',
        firebaseUid: user?.uid || profile.firebaseUid || '',
        email: profile.email || user?.email || '',
        fullName: profile.fullName || user?.displayName || '',
        dateOfBirth: profile.dateOfBirth || '',
        age: profile.age || null,
        gender: profile.gender || 'Male',
        maritalStatus: profile.maritalStatus || 'Single',
        casteCategory: profile.casteCategory || 'General',
        occupation: profile.occupation || '',
        employmentStatus: profile.employmentStatus || 'Employed',
        educationQualification: profile.educationQualification || '',
        annualFamilyIncome: profile.annualFamilyIncome || null,
        state: profile.state || '',
        district: profile.district || '',
        mandal: profile.mandal || '',
        villageCity: profile.villageCity || '',
        residenceType: profile.residenceType || 'Urban',
        pincode: profile.pincode || '',
        disabilityPercentage: profile.disabilityPercentage || 0,
        preferredLanguage: profile.preferredLanguage || 'English',
        profilePhotoUrl: profile.profilePhotoUrl || user?.photoURL || '',
        profileCompleted: profile.profileCompleted || false,
      })
    }
  }, [profile, user])

  // Calculate age automatically when DOB changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value
    let calculatedAge: number | null = null
    if (dob) {
      const birthDate = new Date(dob)
      const today = new Date()
      calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
    }
    setFormData(prev => ({
      ...prev,
      dateOfBirth: dob,
      age: calculatedAge,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await saveCitizenProfile(formData)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Failed to save citizen profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const cardBgClass = isDark
    ? 'p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md space-y-5'
    : 'p-6 rounded-3xl bg-[#FFFCF5] border border-[#EFE4C8] shadow-xs space-y-5'

  const cardHeaderBorder = isDark ? 'border-b border-slate-800 pb-3' : 'border-b border-[#EFE4C8] pb-3'
  const sectionTitleClass = `text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#111111]'}`
  const sectionDescClass = `text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-[#6B7280]'}`
  const iconBoxClass = `w-8 h-8 rounded-xl flex items-center justify-center border ${
    isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D4A537]'
  }`
  const labelClass = `text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-[#111111]'}`
  const labelIconColor = isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'

  const inputClass = `w-full h-11 px-4 rounded-2xl border font-bold text-sm outline-none transition-all ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00B87C] focus:border-[#00B87C]'
      : 'bg-white border-[#EFE4C8] text-[#111111] placeholder-slate-400 focus:ring-2 focus:ring-[#D4A537] focus:border-[#D4A537]'
  }`

  const readOnlyInputClass = `w-full h-11 px-4 pr-10 rounded-2xl border font-bold text-sm cursor-not-allowed select-none shadow-inner ${
    isDark
      ? 'bg-slate-800/80 border-slate-700 text-emerald-400'
      : 'bg-[#FFF9EA] border-[#EFE4C8] text-[#92400E]'
  }`

  return (
    <div className={`space-y-6 ${isDark ? 'text-white' : 'text-[#111111]'}`}>
      {/* Header Info Banner */}
      {!isModal && (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl border backdrop-blur-xl transition-all ${
          isDark
            ? 'bg-gradient-to-r from-[#00B87C]/15 via-[#059669]/10 to-[#00B87C]/5 border-[#00B87C]/30 text-white'
            : 'bg-gradient-to-r from-[#F59E0B]/15 via-[#FBBF24]/10 to-[#D4A537]/15 border-[#D4A537]/40 text-[#111111] shadow-xs'
        }`}>
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${
              isDark
                ? 'bg-[#00B87C]/20 border border-[#00B87C]/30 text-[#00B87C]'
                : 'bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#D4A537]'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              Official Citizen Registration
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#111111]'}`}>
              Citizen Profile Information
            </h2>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#4B5563]'}`}>
              Fill in your complete profile details to unlock personalized AI government scheme eligibility matching.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`px-4 py-2 rounded-2xl border shadow-xs flex items-center gap-2 ${
              isDark
                ? 'bg-slate-900 border-[#00B87C]/40 text-white'
                : 'bg-[#FFFCF5] border-[#D4A537]/40 text-[#111111]'
            }`}>
              <Shield className={`w-4 h-4 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} />
              <span className="text-xs font-black">Status: {formData.profileCompleted ? 'Verified' : 'Draft'}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==================== SECTION 1: SYSTEM CREDENTIALS (READ ONLY) ==================== */}
        <div className={cardBgClass}>
          <div className={`flex items-center gap-2.5 ${cardHeaderBorder}`}>
            <div className={iconBoxClass}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className={sectionTitleClass}>
                System Credentials (Read Only)
              </h3>
              <p className={sectionDescClass}>
                Auto-assigned unique citizen profile ID and linked account email. Cannot be edited.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CITIZEN ID / PROFILE ID (Civs{number}) - READ ONLY */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Hash className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Citizen ID (Profile ID) <span className="text-amber-500 text-[10px] font-extrabold">(Read-Only)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.profileId || formData.citizenId || 'Civs1001'}
                  readOnly
                  disabled
                  className={readOnlyInputClass}
                />
                <Lock className="w-4 h-4 text-amber-500 absolute right-3.5 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Database profile_id used as official Citizen ID (Civs{`{order}`})</p>
            </div>

            {/* EMAIL - READ ONLY */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Mail className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-[#D4A537]'}`} />
                Email Address <span className="text-amber-500 text-[10px] font-extrabold">(Read-Only)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={formData.email || ''}
                  readOnly
                  disabled
                  className={readOnlyInputClass}
                />
                <Lock className="w-4 h-4 text-amber-500 absolute right-3.5 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Verified email from user authentication table</p>
            </div>
          </div>
        </div>

        {/* ==================== SECTION 2: PERSONAL DETAILS ==================== */}
        <div className={cardBgClass}>
          <div className={`flex items-center gap-2.5 ${cardHeaderBorder}`}>
            <div className={iconBoxClass}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className={sectionTitleClass}>
                Personal Information
              </h3>
              <p className={sectionDescClass}>Basic demographics and identity details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* FULL NAME */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <User className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                required
                className={inputClass}
              />
            </div>

            {/* DATE OF BIRTH */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Calendar className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={handleDobChange}
                className={inputClass}
              />
            </div>

            {/* AGE */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Hash className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Age (Years)
              </label>
              <input
                type="number"
                value={formData.age !== null && formData.age !== undefined ? formData.age : ''}
                onChange={e => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value, 10) : null })}
                placeholder="Age in years"
                min="0"
                max="120"
                className={inputClass}
              />
            </div>

            {/* GENDER */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Heart className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Gender
              </label>
              <select
                value={formData.gender || 'Male'}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className={inputClass}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* MARITAL STATUS */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Heart className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Marital Status
              </label>
              <select
                value={formData.maritalStatus || 'Single'}
                onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                className={inputClass}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            {/* CASTE CATEGORY */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Shield className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Caste Category
              </label>
              <select
                value={formData.casteCategory || 'General'}
                onChange={e => setFormData({ ...formData, casteCategory: e.target.value })}
                className={inputClass}
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== SECTION 3: EMPLOYMENT & FINANCIAL ==================== */}
        <div className={cardBgClass}>
          <div className={`flex items-center gap-2.5 ${cardHeaderBorder}`}>
            <div className={iconBoxClass}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className={sectionTitleClass}>
                Employment & Financial Background
              </h3>
              <p className={sectionDescClass}>Occupation, income brackets, and education status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* OCCUPATION */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Briefcase className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Occupation
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g. Farmer, Student, Teacher, Engineer"
                className={inputClass}
              />
            </div>

            {/* EMPLOYMENT STATUS */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <User className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Employment Status
              </label>
              <select
                value={formData.employmentStatus || 'Employed'}
                onChange={e => setFormData({ ...formData, employmentStatus: e.target.value })}
                className={inputClass}
              >
                <option value="Employed">Employed</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            {/* EDUCATION QUALIFICATION */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <GraduationCap className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Education Qualification
              </label>
              <input
                type="text"
                value={formData.educationQualification || ''}
                onChange={e => setFormData({ ...formData, educationQualification: e.target.value })}
                placeholder="e.g. 10th, 12th, Bachelor's, Master's"
                className={inputClass}
              />
            </div>

            {/* ANNUAL FAMILY INCOME */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <IndianRupee className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Annual Family Income (₹)
              </label>
              <input
                type="number"
                value={formData.annualFamilyIncome !== null && formData.annualFamilyIncome !== undefined ? formData.annualFamilyIncome : ''}
                onChange={e => setFormData({ ...formData, annualFamilyIncome: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 250000"
                min="0"
                step="1000"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ==================== SECTION 4: LOCATION & ADDRESS ==================== */}
        <div className={cardBgClass}>
          <div className={`flex items-center gap-2.5 ${cardHeaderBorder}`}>
            <div className={iconBoxClass}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className={sectionTitleClass}>
                Location & Residential Address
              </h3>
              <p className={sectionDescClass}>State, district, mandal, and local area details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* STATE */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <MapPin className={`w-3.5 h-3.5 ${labelIconColor}`} />
                State
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Telangana, Andhra Pradesh, Maharashtra"
                className={inputClass}
              />
            </div>

            {/* DISTRICT */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Building className={`w-3.5 h-3.5 ${labelIconColor}`} />
                District
              </label>
              <input
                type="text"
                value={formData.district || ''}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Hyderabad, Rangareddy"
                className={inputClass}
              />
            </div>

            {/* MANDAL */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <MapPin className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Mandal / Tehsil
              </label>
              <input
                type="text"
                value={formData.mandal || ''}
                onChange={e => setFormData({ ...formData, mandal: e.target.value })}
                placeholder="Enter mandal"
                className={inputClass}
              />
            </div>

            {/* VILLAGE / CITY */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Home className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Village / City
              </label>
              <input
                type="text"
                value={formData.villageCity || ''}
                onChange={e => setFormData({ ...formData, villageCity: e.target.value })}
                placeholder="Enter village or city name"
                className={inputClass}
              />
            </div>

            {/* RESIDENCE TYPE */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Building className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Residence Type
              </label>
              <select
                value={formData.residenceType || 'Urban'}
                onChange={e => setFormData({ ...formData, residenceType: e.target.value })}
                className={inputClass}
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            {/* PINCODE */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Hash className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode || ''}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="6-digit PIN code"
                maxLength={10}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ==================== SECTION 5: ADDITIONAL PREFERENCES & MEDIA ==================== */}
        <div className={cardBgClass}>
          <div className={`flex items-center gap-2.5 ${cardHeaderBorder}`}>
            <div className={iconBoxClass}>
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className={sectionTitleClass}>
                Additional Info & Preferences
              </h3>
              <p className={sectionDescClass}>Disability status, preferred language, and photo URL (read-only)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* DISABILITY PERCENTAGE */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Shield className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Disability Percentage (%)
              </label>
              <input
                type="number"
                value={formData.disabilityPercentage !== undefined ? formData.disabilityPercentage : 0}
                onChange={e => setFormData({ ...formData, disabilityPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                max="100"
                step="0.5"
                className={inputClass}
              />
            </div>

            {/* PREFERRED LANGUAGE */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Languages className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Preferred Language
              </label>
              <select
                value={formData.preferredLanguage || 'English'}
                onChange={e => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className={inputClass}
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            {/* PROFILE PHOTO URL - READ ONLY */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className={labelClass}>
                <ImageIcon className={`w-3.5 h-3.5 ${labelIconColor}`} />
                Profile Photo URL <span className="text-amber-500 text-[10px] font-extrabold">(Read-Only)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.profilePhotoUrl || ''}
                  readOnly
                  disabled
                  placeholder="Auto-synced from user account"
                  className={readOnlyInputClass}
                />
                <Lock className="w-4 h-4 text-amber-500 absolute right-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT SAVE BUTTON */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className={`px-8 h-13 rounded-2xl text-white font-black text-sm cursor-pointer shadow-lg flex items-center gap-2.5 transition-all ${
              isDark
                ? 'bg-gradient-to-r from-[#00B87C] via-[#059669] to-[#00B87C] shadow-[#00B87C]/30 hover:shadow-[#00B87C]/50'
                : 'bg-gradient-to-r from-[#D4A537] via-[#F59E0B] to-[#D4A537] shadow-[#F59E0B]/30 hover:shadow-[#F59E0B]/50'
            }`}
          >
            {saving ? (
              <>
                <Cpu className="w-5 h-5 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save & Complete Profile
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
