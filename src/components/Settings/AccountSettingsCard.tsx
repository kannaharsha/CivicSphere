import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ExternalLink, MapPin, Briefcase, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountSettingsCardProps {
  isDark?: boolean;
  profile?: any;
}

const Field: React.FC<{ icon: React.ReactNode; label: string; value: string; isDark: boolean }> = ({
  icon, label, value, isDark,
}) => (
  <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all group ${
    isDark
      ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/70'
  }`}>
    <div className={`mt-0.5 ${isDark ? 'text-emerald-400/70' : 'text-amber-600/70'}`}>{icon}</div>
    <div>
      <div className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
        {label}
      </div>
      <div className={`text-sm font-semibold truncate ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  </div>
);

export const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({
  isDark = true,
  profile,
}) => {
  const navigate = useNavigate();

  const fullName  = profile?.fullName  || profile?.full_name  || profile?.name  || 'Verified Citizen';
  const email     = profile?.email     || 'citizen@civicsphere.gov.in';
  const phone     = profile?.phoneNumber|| profile?.phone      || '+91 ••••• •••••';
  const state     = profile?.state     || 'Andhra Pradesh';
  const district  = profile?.district  || 'Visakhapatnam';
  const occupation= profile?.occupation|| 'Farmer / Agriculture';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl overflow-hidden border transition-all ${
        isDark
          ? 'bg-slate-900/40 border-white/8 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-950/30'
          : 'bg-white/80 border-slate-100 hover:border-amber-300/50 hover:shadow-xl hover:shadow-amber-500/8'
      } backdrop-blur-sm`}
    >
      {/* Colored top accent line */}
      <div className={`h-1 w-full ${isDark ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500' : 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500'}`} />

      <div className="p-6 sm:p-7">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Account Information
                </h2>
                <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isDark
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-800 border border-amber-400/30'
                }`}>
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Read from your citizen_profiles record
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isDark
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/25 hover:border-emerald-500/40'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border-amber-500/25 hover:border-amber-500/40'
            }`}
          >
            View / Edit
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Grid fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field isDark={isDark} icon={<User    className="w-3.5 h-3.5" />} label="Full Name"    value={fullName}   />
          <Field isDark={isDark} icon={<Mail    className="w-3.5 h-3.5" />} label="Email"        value={email}      />
          <Field isDark={isDark} icon={<Phone   className="w-3.5 h-3.5" />} label="Phone"        value={phone}      />
          <Field isDark={isDark} icon={<MapPin  className="w-3.5 h-3.5" />} label="State"        value={state}      />
          <Field isDark={isDark} icon={<MapPin  className="w-3.5 h-3.5" />} label="District"     value={district}   />
          <Field isDark={isDark} icon={<Briefcase className="w-3.5 h-3.5" />} label="Occupation" value={occupation} />
        </div>
      </div>
    </motion.div>
  );
};
