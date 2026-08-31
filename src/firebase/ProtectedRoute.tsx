import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Cpu } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050816] text-white">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-full h-full border-4 border-dashed border-[#00D084] rounded-full animate-spin absolute" />
          <Cpu className="w-6 h-6 text-[#2563EB] animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-bold font-mono tracking-widest uppercase text-slate-400">
          CivicSphere Verification...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
