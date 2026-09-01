import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAHxXs2ZJuC_Edalorxth7n6IhAP-HznMk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'civicsphere-ai-platform.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'civicsphere-ai-platform',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'civicsphere-ai-platform.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '484905252285',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:484905252285:web:fc2c7c95b95f8766b58ed4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Enable Browser Local Persistence
setPersistence(auth, browserLocalPersistence)
  .catch((err) => {
    console.error('Firebase persistence initialization error:', err);
  });

// Google Auth Provider Setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { auth, googleProvider };
export default app;
