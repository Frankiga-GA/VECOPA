import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAMN8lzpNGjRFSm8HjCVJdJdRgEpqfzK0w',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'vecopa-14fec.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'vecopa-14fec',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'vecopa-14fec.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '156908835145',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:156908835145:web:9e6a5d09d0016db6c60a98',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-G9R9VG9DRW',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

