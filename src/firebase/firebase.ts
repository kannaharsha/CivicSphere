import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';

// Client-side public Firebase identifiers used as fallback if environment variables are omitted during CI/CD deployment
const defaultFirebaseConfig = {
  apiKey: 'AIzaSyAHxXs2ZJuC_Edalorxth7n6IhAP-HznMk',
  authDomain: 'civicsphere-ai-platform.firebaseapp.com',
  projectId: 'civicsphere-ai-platform',
  storageBucket: 'civicsphere-ai-platform.firebasestorage.app',
  messagingSenderId: '484905252285',
  appId: '1:484905252285:web:fc2c7c95b95f8766b58ed4',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
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
