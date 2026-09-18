import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, IndianRupee, Sprout, ArrowRight,
  RotateCcw, MapPin, CheckCircle2, ChevronDown, Sparkles
} from 'lucide-react';
import type { CitizenEligibilityProfile } from './eligibilityTypes';

const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': [
    'All Districts', 'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna',
    'Kurnool', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram',
    'West Godavari', 'YSR Kadapa', 'NTR', 'Bapatla', 'Palnadu', 'Tirupati', 'Annamayya'
  ],
  'Telangana': [
    'All Districts', 'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon',
    'Karimnagar', 'Khammam', 'Mahabubnagar', 'Medak', 'Nalgonda', 'Nizamabad',
    'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Warangal'
  ],
  'Karnataka': [
    'All Districts', 'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chikkamagaluru', 'Dharwad', 'Hassan', 'Kalaburagi', 'Mandya', 'Mysuru', 'Shivamogga'
  ],
  'Tamil Nadu': [
    'All Districts', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dindigul', 'Erode', 'Kanchipuram', 'Madurai', 'Salem', 'Thanjavur', 'Tiruchirappalli'
  ],
  'Maharashtra': [
    'All Districts', 'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Kolhapur',
    'Nagpur', 'Nanded', 'Nashik', 'Pune', 'Solapur', 'Thane'
  ],
  'Uttar Pradesh': [
    'All Districts', 'Agra', 'Aligarh', 'Ayodhya', 'Bareilly', 'Gorakhpur',
    'Kanpur', 'Lucknow', 'Meerut', 'Prayagraj', 'Varanasi'
  ],
  'Madhya Pradesh': [
    'All Districts', 'Bhopal', 'Gwalior', 'Indore', 'Jabalpur', 'Rewa', 'Sagar', 'Ujjain'
  ],
  'Gujarat': [
    'All Districts', 'Ahmedabad', 'Amreli', 'Anand', 'Bhavnagar', 'Gandhinagar', 'Rajkot', 'Surat', 'Vadodara'
  ],
  'Punjab': [
    'All Districts', 'Amritsar', 'Bathinda', 'Faridkot', 'Jalandhar', 'Ludhiana', 'Patiala'
  ],
  'Rajasthan': [
    'All Districts', 'Ajmer', 'Alwar', 'Bikaner', 'Jaipur', 'Jodhpur', 'Kota', 'Udaipur'
  ],
  'Bihar': [
    'All Districts', 'Bhagalpur', 'Darbhanga', 'Gaya', 'Muzaffarpur', 'Patna', 'Purnia'
  ],
  'Odisha': [
    'All Districts', 'Balasore', 'Bhadrak', 'Cuttack', 'Ganjam', 'Khordha', 'Puri', 'Sambalpur'
  ],
  'West Bengal': [
    'All Districts', 'Bankura', 'Bardhaman', 'Darjeeling', 'Howrah', 'Kolkata', 'Murshidabad', 'Nadia'
  ],
  'Kerala': [
    'All Districts', 'Alappuzha', 'Ernakulam', 'Idukki', 'Kozhikode', 'Malappuram', 'Palakkad', 'Thiruvananthapuram'
  ],
  'Haryana': [
    'All Districts', 'Ambala', 'Faridabad', 'Gurugram', 'Hisar', 'Karnal', 'Panipat', 'Rohtak'
  ]
};

const PRESETS: { label: string; icon: string; desc: string; profile: CitizenEligibilityProfile }[] = [
  {
    label: 'Small Farmer (AP)',
    icon: '🌾',
    desc: 'Marginal landholder, PM-Kisan active',
    profile: {
      fullName: 'Ramesh Kumar',
      age: 36,
      gender: 'Male',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      occupation: 'Farmer',
      caste: 'OBC',
      isMinority: false,
      hasDisability: false,
      annualFamilyIncome: 140000,
      farmerCategory: 'Small',
      landOwnershipAcres: 2.5,
      ownsLand: true,
      cropType: 'Paddy / Rice',
      irrigationType: 'Borewell / Tube well',
      isOrganicFarmer: false,
      hasLivestock: true,
      isWomanFarmer: false,
      isTenantFarmer: false,
      hasAadhaar: true,
      hasBankAccountLinked: true,
      isPmKisanBeneficiary: true,
      hasSoilHealthCard: true
    }
  },
  {
    label: 'Woman Farmer',
    icon: '👩‍🌾',
    desc: 'Affirmative gender & organic subsidies',
    profile: {
      fullName: 'Lakshmi Devi',
      age: 42,
      gender: 'Female',
      state: 'Telangana',
      district: 'Warangal',
      occupation: 'Farmer',
      caste: 'SC',
      isMinority: false,
      hasDisability: false,
      annualFamilyIncome: 95000,
      farmerCategory: 'Marginal',
      landOwnershipAcres: 1.5,
      ownsLand: true,
      cropType: 'Cotton',
      irrigationType: 'Canal / River water',
      isOrganicFarmer: true,
      hasLivestock: true,
      isWomanFarmer: true,
      isTenantFarmer: false,
      hasAadhaar: true,
      hasBankAccountLinked: true,
      isPmKisanBeneficiary: true,
      hasSoilHealthCard: true
    }
  },
  {
    label: 'Tenant Farmer',
    icon: '🚜',
    desc: 'Landless cultivator, credit & rental subsidies',
    profile: {
      fullName: 'Suresh Patel',
      age: 29,
      gender: 'Male',
      state: 'Karnataka',
      district: 'Belagavi',
      occupation: 'Farmer',
      caste: 'General',
      isMinority: false,
      hasDisability: false,
      annualFamilyIncome: 110000,
      farmerCategory: 'Marginal',
      landOwnershipAcres: 0,
      ownsLand: false,
      cropType: 'Sugarcane',
      irrigationType: 'Rainfed / Dryland',
      isOrganicFarmer: false,
      hasLivestock: false,
      isWomanFarmer: false,
      isTenantFarmer: true,
      hasAadhaar: true,
      hasBankAccountLinked: true,
      isPmKisanBeneficiary: false,
      hasSoilHealthCard: false
    }
  },
  {
    label: 'Youth Agri-Entrepreneur',
    icon: '🌱',
    desc: 'Age <35, horticulture & organic schemes',
    profile: {
      fullName: 'Ananya Sharma',
      age: 26,
      gender: 'Female',
      state: 'Maharashtra',
      district: 'Pune',
      occupation: 'Self Employed',
      caste: 'General',
      isMinority: false,
      hasDisability: false,
      annualFamilyIncome: 200000,
      farmerCategory: 'Marginal',
      landOwnershipAcres: 0.5,
      ownsLand: false,
      cropType: 'Vegetables',
      irrigationType: 'Borewell / Tube well',
      isOrganicFarmer: true,
      hasLivestock: false,
      isWomanFarmer: true,
      isTenantFarmer: false,
      hasAadhaar: true,
      hasBankAccountLinked: true,
      isPmKisanBeneficiary: false,
      hasSoilHealthCard: false
    }
  },
  {
    label: 'Senior Pensioner',
    icon: '👵',
    desc: 'Age 60+, social welfare & pension aid',
    profile: {
      fullName: 'Venkataiah',
      age: 63,
      gender: 'Male',
      state: 'Andhra Pradesh',
      district: 'Anantapur',
      occupation: 'Agricultural Laborer',
      caste: 'EWS',
      isMinority: false,
      hasDisability: false,
      annualFamilyIncome: 60000,
      farmerCategory: 'Marginal',
      landOwnershipAcres: 0,
      ownsLand: false,
      cropType: 'Millets',
      irrigationType: 'Rainfed / Dryland',
      isOrganicFarmer: false,
      hasLivestock: false,
      isWomanFarmer: false,
      isTenantFarmer: true,
      hasAadhaar: true,
      hasBankAccountLinked: true,
      isPmKisanBeneficiary: true,
      hasSoilHealthCard: false
    }
  }
];

export interface AnotherPersonFormProps {
  initialData?: CitizenEligibilityProfile;
  onEvaluate: (profile: CitizenEligibilityProfile) => void;
  isDark?: boolean;
}

export const AnotherPersonForm: React.FC<AnotherPersonFormProps> = ({
  initialData,
  onEvaluate,
  isDark = false
}) => {
  const [formData, setFormData] = useState<CitizenEligibilityProfile>(() => initialData || PRESETS[0].profile);
  const onEvaluateRef = useRef(onEvaluate);
  onEvaluateRef.current = onEvaluate;

  const prevSerializedRef = useRef<string>(JSON.stringify(initialData || PRESETS[0].profile));

  // Synchronize when initialData prop changes externally
  useEffect(() => {
    if (initialData) {
      const incoming = JSON.stringify(initialData);
      if (incoming !== prevSerializedRef.current) {
        prevSerializedRef.current = incoming;
        setFormData(initialData);
      }
    }
  }, [initialData]);

  const notifyParent = (newProfile: CitizenEligibilityProfile) => {
    const serialized = JSON.stringify(newProfile);
    if (serialized !== prevSerializedRef.current) {
      prevSerializedRef.current = serialized;
      onEvaluateRef.current(newProfile);
    }
  };

  const states = Object.keys(INDIAN_STATES_DISTRICTS);
  const availableDistricts = formData.state && INDIAN_STATES_DISTRICTS[formData.state]
    ? INDIAN_STATES_DISTRICTS[formData.state]
    : ['All Districts'];

  const updateField = (field: keyof CitizenEligibilityProfile, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'landOwnershipAcres') {
        const acres = Number(value);
        if (acres === 0) {
          updated.farmerCategory = 'Marginal';
          updated.ownsLand = false;
        } else if (acres <= 2.5) {
          updated.farmerCategory = 'Marginal';
          updated.ownsLand = true;
        } else if (acres <= 5.0) {
          updated.farmerCategory = 'Small';
          updated.ownsLand = true;
        } else if (acres <= 10.0) {
          updated.farmerCategory = 'Medium';
          updated.ownsLand = true;
        } else {
          updated.farmerCategory = 'Large';
          updated.ownsLand = true;
        }
      }

      if (field === 'gender') {
        updated.isWomanFarmer = value === 'Female';
      }

      notifyParent(updated);
      return updated;
    });
  };

  const handleSelectPreset = (p: typeof PRESETS[0]) => {
    setFormData(p.profile);
    notifyParent(p.profile);
  };

  const handleReset = () => {
    setFormData(PRESETS[0].profile);
    notifyParent(PRESETS[0].profile);
  };

  /* ── Design Tokens ── */
  const accent = isDark ? '#00B87C' : '#C9890A';
  const cardBg = isDark ? 'rgba(12,26,43,0.92)' : 'rgba(255,253,247,0.98)';
  const cardBorder = isDark ? '1px solid rgba(0,184,124,0.22)' : '1px solid rgba(212,160,23,0.25)';
  const cardShadow = isDark ? '0 8px 30px rgba(0,0,0,0.30)' : '0 6px 24px rgba(212,160,23,0.08)';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#7A5009';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(212,160,23,0.14)';

  const inputBg = isDark ? 'rgba(7,18,30,0.85)' : 'rgba(255,255,255,0.98)';
  const inputBorder = isDark ? 'rgba(0,184,124,0.25)' : 'rgba(212,160,23,0.28)';

  return (
    <div
      className="rounded-2xl p-5 space-y-5 relative overflow-hidden backdrop-blur-md"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
      }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 right-0 w-64 h-32 rounded-full pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at top right, ${isDark ? 'rgba(0,184,124,0.15)' : 'rgba(212,160,23,0.12)'}, transparent 70%)`
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b relative z-10" style={{ borderColor: divider }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black flex-shrink-0"
            style={{
              background: isDark ? 'rgba(0,184,124,0.12)' : 'rgba(212,160,23,0.12)',
              color: accent,
              border: `1.5px solid ${isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.30)'}`
            }}
          >
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight" style={{ color: textColor }}>
              Check For Another Citizen
            </h3>
            <p className="text-[11px] font-medium" style={{ color: textMuted }}>
              Evaluate family members, neighbor farmers, or simulate specific beneficiary scenarios
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.90)',
            color: isDark ? '#CBD5E1' : '#4B5563',
            border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(212,160,23,0.25)'
          }}
        >
          <RotateCcw className="w-3 h-3" style={{ color: accent }} />
          <span>Reset Form</span>
        </motion.button>
      </div>

      {/* Preset Profiles Carousel / Grid */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: textMuted }}>
            Quick Simulation Presets
          </span>
          <span className="text-[10px] font-bold" style={{ color: accent }}>
            Select to auto-fill
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRESETS.map((p, idx) => {
            const isSelected = formData.fullName === p.profile.fullName;
            return (
              <motion.button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p)}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2.5 rounded-xl text-left border transition-all relative overflow-hidden"
                style={{
                  background: isSelected
                    ? isDark ? 'rgba(0,184,124,0.16)' : 'rgba(254,243,199,0.90)'
                    : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
                  borderColor: isSelected
                    ? accent
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(212,160,23,0.20)',
                  boxShadow: isSelected
                    ? isDark ? '0 4px 16px rgba(0,184,124,0.25)' : '0 4px 16px rgba(201,137,10,0.20)'
                    : 'none'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-black truncate" style={{ color: isSelected ? accent : textColor }}>
                    {p.label}
                  </span>
                </div>
                <p className="text-[10px] line-clamp-1" style={{ color: textMuted }}>
                  {p.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10 pt-1">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Applicant Full Name
          </label>
          <input
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          />
        </div>

        {/* Age */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Age (Years)
          </label>
          <input
            type="number"
            min={15}
            max={100}
            value={formData.age || ''}
            onChange={(e) => updateField('age', Number(e.target.value))}
            placeholder="e.g. 35"
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          />
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Gender
          </label>
          <select
            value={formData.gender || 'Male'}
            onChange={(e) => updateField('gender', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Caste Category */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Social Category / Caste
          </label>
          <select
            value={formData.caste || 'General'}
            onChange={(e) => updateField('caste', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            <option value="General">General</option>
            <option value="OBC">OBC (Other Backward Class)</option>
            <option value="SC">SC (Scheduled Caste)</option>
            <option value="ST">ST (Scheduled Tribe)</option>
            <option value="EWS">EWS (Economically Weaker Section)</option>
          </select>
        </div>

        {/* State */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            State / UT
          </label>
          <select
            value={formData.state || states[0]}
            onChange={(e) => {
              const newState = e.target.value;
              const newDistricts = INDIAN_STATES_DISTRICTS[newState] || ['All Districts'];
              updateField('state', newState);
              updateField('district', newDistricts[0]);
            }}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            District
          </label>
          <select
            value={formData.district || availableDistricts[0]}
            onChange={(e) => updateField('district', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            {availableDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Annual Income */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Annual Family Income (₹)
          </label>
          <input
            type="number"
            step={10000}
            min={0}
            value={formData.annualFamilyIncome ?? ''}
            onChange={(e) => updateField('annualFamilyIncome', Number(e.target.value))}
            placeholder="e.g. 150000"
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          />
        </div>

        {/* Land Holding */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Cultivable Land (Acres)
          </label>
          <input
            type="number"
            step={0.5}
            min={0}
            value={formData.landOwnershipAcres ?? ''}
            onChange={(e) => updateField('landOwnershipAcres', Number(e.target.value))}
            placeholder="e.g. 2.5 (0 = Landless)"
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          />
        </div>

        {/* Farmer Category */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Farmer Category
          </label>
          <select
            value={formData.farmerCategory || 'Small'}
            onChange={(e) => updateField('farmerCategory', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            <option value="Marginal">Marginal (&lt; 2.5 Acres)</option>
            <option value="Small">Small (2.5 - 5 Acres)</option>
            <option value="Medium">Medium (5 - 10 Acres)</option>
            <option value="Large">Large (&gt; 10 Acres)</option>
          </select>
        </div>

        {/* Crop Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Primary Crop Cultivated
          </label>
          <select
            value={formData.cropType || 'Paddy / Rice'}
            onChange={(e) => updateField('cropType', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            <option value="Paddy / Rice">Paddy / Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Cotton">Cotton</option>
            <option value="Sugarcane">Sugarcane</option>
            <option value="Millets">Millets</option>
            <option value="Pulses">Pulses</option>
            <option value="Oilseeds">Oilseeds</option>
            <option value="Vegetables">Vegetables & Horticulture</option>
            <option value="Fruits">Fruits & Orchards</option>
          </select>
        </div>

        {/* Irrigation Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Irrigation Source
          </label>
          <select
            value={formData.irrigationType || 'Borewell / Tube well'}
            onChange={(e) => updateField('irrigationType', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            <option value="Borewell / Tube well">Borewell / Tube well</option>
            <option value="Canal / River water">Canal / River water</option>
            <option value="Rainfed / Dryland">Rainfed / Dryland</option>
            <option value="Drip / Sprinkler Micro Irrigation">Drip / Sprinkler Micro Irrigation</option>
          </select>
        </div>

        {/* Occupation */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold block" style={{ color: textMuted }}>
            Occupation
          </label>
          <select
            value={formData.occupation || 'Farmer'}
            onChange={(e) => updateField('occupation', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium outline-none transition-all cursor-pointer"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textColor
            }}
          >
            <option value="Farmer">Farmer / Cultivator</option>
            <option value="Agricultural Laborer">Agricultural Laborer</option>
            <option value="Tenant Farmer">Tenant Farmer</option>
            <option value="Dairy / Poultry Farmer">Dairy / Poultry Farmer</option>
            <option value="Self Employed">Self Employed / Rural Entrepreneur</option>
          </select>
        </div>
      </div>

      {/* Boolean Toggles Grid */}
      <div className="pt-2 border-t space-y-2 relative z-10" style={{ borderColor: divider }}>
        <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: textMuted }}>
          Beneficiary Attributes & Scheme Tags
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: 'PM-Kisan Active', key: 'isPmKisanBeneficiary' as const, active: formData.isPmKisanBeneficiary },
            { label: 'Organic Farming', key: 'isOrganicFarmer' as const, active: formData.isOrganicFarmer },
            { label: 'Woman Farmer', key: 'isWomanFarmer' as const, active: formData.isWomanFarmer },
            { label: 'Owns Land', key: 'ownsLand' as const, active: formData.ownsLand },
            { label: 'Tenant Cultivator', key: 'isTenantFarmer' as const, active: formData.isTenantFarmer },
            { label: 'Has Livestock', key: 'hasLivestock' as const, active: formData.hasLivestock },
            { label: 'Soil Health Card', key: 'hasSoilHealthCard' as const, active: formData.hasSoilHealthCard },
            { label: 'Minority Comm.', key: 'isMinority' as const, active: formData.isMinority },
            { label: 'Person w/ Disability', key: 'hasDisability' as const, active: formData.hasDisability },
            { label: 'Aadhaar Verified', key: 'hasAadhaar' as const, active: formData.hasAadhaar },
            { label: 'DBT Bank Linked', key: 'hasBankAccountLinked' as const, active: formData.hasBankAccountLinked },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => updateField(item.key, !item.active)}
              className="p-2 rounded-xl text-left border flex items-center justify-between gap-1.5 transition-all cursor-pointer select-none"
              style={{
                background: item.active
                  ? isDark ? 'rgba(0,184,124,0.16)' : 'rgba(254,243,199,0.90)'
                  : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
                borderColor: item.active
                  ? accent
                  : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(212,160,23,0.20)',
              }}
            >
              <span className="text-[11px] font-bold truncate" style={{ color: item.active ? accent : textColor }}>
                {item.label}
              </span>
              <span
                className="w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{
                  background: item.active ? accent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  color: item.active ? '#FFFFFF' : 'transparent'
                }}
              >
                ✓
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Submit Button */}
      <div className="pt-2 flex justify-end relative z-10">
        <motion.button
          type="button"
          onClick={() => {
            prevSerializedRef.current = JSON.stringify(formData);
            onEvaluateRef.current(formData);
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-md"
          style={{
            background: isDark
              ? 'linear-gradient(135deg,#00B87C,#10B981)'
              : 'linear-gradient(135deg,#C9890A,#D4A017)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,184,124,0.35)'
              : '0 4px 16px rgba(201,137,10,0.30)'
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Re-Evaluate Eligibility</span>
        </motion.button>
      </div>
    </div>
  );
};
