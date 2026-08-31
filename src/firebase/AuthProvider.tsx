import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth, googleProvider } from './firebase';
import type { CitizenProfile } from '../services/userService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: CitizenProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, details: Partial<CitizenProfile>) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state — build profile directly from Firebase user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Build profile purely from Firebase user data — no backend needed
        setProfile({
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || 'Citizen',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          provider: firebaseUser.providerData[0]?.providerId || 'email',
          language: 'English',
          occupation: '',
          state: '',
          district: '',
          gender: '',
          dob: null,
          avatarUrl: firebaseUser.photoURL || '',
          profileCompleted: false,
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email + Password Login
  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      let msg = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Incorrect email or password.';
      if (err.code === 'auth/user-not-found') msg = 'No account found. Please sign up first.';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
      toast.error(msg);
      throw err;
    }
  };

  // Email + Password Signup
  const signup = async (email: string, pass: string, details: Partial<CitizenProfile>) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      // Store extra signup details in profile state immediately
      setProfile({
        uid: cred.user.uid,
        email: cred.user.email || email,
        fullName: details.fullName || cred.user.displayName || 'Citizen',
        phone: details.phone || '',
        provider: 'email',
        language: details.language || 'English',
        occupation: details.occupation || '',
        state: details.state || '',
        district: details.district || '',
        gender: details.gender || '',
        dob: details.dob || null,
        profileCompleted: false,
      });
      toast.success('Account created successfully!');
    } catch (err: any) {
      let msg = 'Signup failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please log in.';
      if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      toast.error(msg);
      throw err;
    }
  };

  // Google Sign In
  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google!');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google Sign-In failed. Please try again.');
      }
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (err) {
      toast.error('Failed to log out.');
      throw err;
    }
  };

  // Forgot Password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      toast.error('Failed to send reset link. Check your email address.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      googleLogin,
      logout,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
