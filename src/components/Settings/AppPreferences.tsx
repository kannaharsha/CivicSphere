import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, MapPin, Building, Layers } from 'lucide-react';
import type { UserSettings } from './settingsTypes';

interface AppPreferencesProps {
  isDark?: boolean;
  settings: UserSettings;
  onUpdate: (key: keyof UserSettings, value: string) => void;
}

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju',
    'Anakapalli',
    'Ananthapuramu',
    'Annamayya',
    'Bapatla',
    'Chittoor',
    'Dr. B.R. Ambedkar Konaseema',
    'East Godavari',
    'Eluru',
    'Guntur',
    'Kakinada',
    'Krishna',
    'Kurnool',
    'Nandyal',
    'NTR',
    'Palnadu',
    'Parvathipuram Manyam',
    'Prakasam',
    'Sri Potti Sriramulu Nellore',
    'Sri Sathya Sai',
    'Srikakulam',
    'Tirupati',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari',
    'YSR Kadapa',
  ],
  'Telangana': [
    'Adilabad',
    'Bhadradri Kothagudem',
    'Hyderabad',
    'Jagtial',
    'Jangaon',
    'Jayashankar Bhupalpally',
    'Jogulamba Gadwal',
    'Kamareddy',
    'Karimnagar',
    'Khammam',
    'Kumuram Bheem Asifabad',
    'Mahabubabad',
    'Mahabubnagar',
    'Mancherial',
    'Medak',
    'Medchal-Malkajgiri',
    'Mulugu',
    'Nagarkurnool',
    'Nalgonda',
    'Narayanpet',
    'Nirmal',
    'Nizamabad',
    'Peddapalli',
    'Rajanna Sircilla',
    'Rangareddy',
    'Sangareddy',
    'Siddipet',
    'Suryapet',
    'Vikarabad',
    'Wanaparthy',
    'Warangal',
    'Hanamkonda',
    'Yadadri Bhuvanagiri',
  ],
  'Karnataka': [
    'Bagalkot',
    'Ballari',
    'Belagavi',
    'Bengaluru Rural',
    'Bengaluru Urban',
    'Bidar',
    'Chamarajanagar',
    'Chikkaballapur',
    'Chikkamagaluru',
    'Chitradurga',
    'Dakshina Kannada',
    'Davanagere',
    'Dharwad',
    'Gadag',
    'Hassan',
    'Haveri',
    'Kalaburagi',
    'Kodagu',
    'Kolar',
    'Koppal',
    'Mandya',
    'Mysuru',
    'Raichur',
    'Ramanagara',
    'Shivamogga',
    'Tumakuru',
    'Udupi',
    'Uttara Kannada',
    'Vijayapura',
    'Yadgir',
  ],
  'Maharashtra': [
    'Ahmednagar',
    'Akola',
    'Amravati',
    'Aurangabad',
    'Beed',
    'Bhandara',
    'Buldhana',
    'Chandrapur',
    'Dhule',
    'Gadchiroli',
    'Gondia',
    'Hingoli',
    'Jalgaon',
    'Jalna',
    'Kolhapur',
    'Latur',
    'Mumbai City',
    'Mumbai Suburban',
    'Nagpur',
    'Nanded',
    'Nandurbar',
    'Nashik',
    'Osmanabad',
    'Palghar',
    'Parbhani',
    'Pune',
    'Raigad',
    'Ratnagiri',
    'Sangli',
    'Satara',
    'Sindhudurg',
    'Solapur',
    'Thane',
    'Wardha',
    'Washim',
    'Yavatmal',
  ],
};

export const AppPreferences: React.FC<AppPreferencesProps> = ({
  isDark = true,
  settings,
  onUpdate,
}) => {
  const currentState = settings.default_state || 'Andhra Pradesh';
  const districts = STATES_AND_DISTRICTS[currentState] || STATES_AND_DISTRICTS['Andhra Pradesh'];

  const handleStateChange = (newState: string) => {
    onUpdate('default_state', newState);
    const newDistricts = STATES_AND_DISTRICTS[newState];
    if (newDistricts && newDistricts.length > 0) {
      onUpdate('default_district', newDistricts[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={`rounded-3xl p-6 sm:p-7 border transition-all ${
        isDark
          ? 'bg-slate-900/70 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/40'
          : 'bg-white border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10'
      }`}
    >
      <div className="flex items-center gap-3 pb-5 border-b border-white/5">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            isDark
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
          }`}
        >
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            App & Regional Preferences
          </h2>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            Set default geographic region and domain sector for automatic filtering across CivicSphere
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {/* Default Home Sector */}
        <div>
          <label
            className={`block text-xs font-semibold mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-white/80' : 'text-slate-700'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>Default Home Sector</span>
          </label>
          <div className="relative">
            <select
              value={settings.default_sector}
              onChange={(e) => onUpdate('default_sector', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                isDark
                  ? 'bg-slate-950 border-emerald-500/30 text-white focus:border-emerald-500'
                  : 'bg-white border-amber-500/30 text-slate-900 focus:border-amber-500'
              }`}
            >
              <option value="Agriculture">🌾 Agriculture & Allied Services (Active)</option>
              <option value="Education" disabled>
                🎓 Education & Scholarships (Coming Soon)
              </option>
              <option value="Health" disabled>
                🏥 Healthcare & Insurance (Coming Soon)
              </option>
              <option value="Housing" disabled>
                🏠 Rural & Urban Housing (Coming Soon)
              </option>
            </select>
          </div>
          <p className={`text-[11px] mt-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            Currently focused exclusively on agriculture. Other domains are future-ready.
          </p>
        </div>

        {/* Default State */}
        <div>
          <label
            className={`block text-xs font-semibold mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-white/80' : 'text-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Default State</span>
          </label>
          <select
            value={currentState}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
              isDark
                ? 'bg-slate-950 border-emerald-500/30 text-white focus:border-emerald-500'
                : 'bg-white border-amber-500/30 text-slate-900 focus:border-amber-500'
            }`}
          >
            {Object.keys(STATES_AND_DISTRICTS).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <p className={`text-[11px] mt-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            Prioritizes state welfare notifications and eligibility guidelines.
          </p>
        </div>

        {/* Preferred District */}
        <div>
          <label
            className={`block text-xs font-semibold mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-white/80' : 'text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preferred District</span>
          </label>
          <select
            value={settings.default_district}
            onChange={(e) => onUpdate('default_district', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
              isDark
                ? 'bg-slate-950 border-emerald-500/30 text-white focus:border-emerald-500'
                : 'bg-white border-amber-500/30 text-slate-900 focus:border-amber-500'
            }`}
          >
            {districts.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
          <p className={`text-[11px] mt-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            Updates dynamically based on the chosen state.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
