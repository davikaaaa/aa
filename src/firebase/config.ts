import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";
import { connectStorageEmulator } from "firebase/storage";
import { toast } from 'react-toastify';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5lXq_bqUQO_Xc8T_aBVn9KGoJcl3aYKQ",
  authDomain: "dikandbauls.firebaseapp.com",
  projectId: "dikandbauls",
  storageBucket: "dikandbauls.firebasestorage.app",
  messagingSenderId: "392659103407",
  appId: "1:392659103407:web:96e2c3e45351fb59012e5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Handle online/offline state
window.addEventListener('online', () => {
  enableNetwork(db).then(() => {
    toast.success('Back online! Reconnecting to Firebase...');
  });
});

window.addEventListener('offline', () => {
  disableNetwork(db).then(() => {
    toast.warning('You are offline. Some features may be limited.');
  });
});

// Connect to Firebase emulators in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Firebase emulators successfully');
  } catch (error) {
    console.error('Failed to connect to Firebase emulators:', error);
    toast.error('Failed to connect to Firebase emulators. Please ensure they are running.');
  }
}

export default app;