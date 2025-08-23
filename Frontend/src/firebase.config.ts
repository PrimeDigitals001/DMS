import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { environment } from './environments/environment';

// Initialize Firebase
console.log('Initializing Firebase with config:', environment.firebaseConfig);

let app: any;
let db: any;
let auth: any;
let storage: any;

try {
  app = initializeApp(environment.firebaseConfig);
  console.log('Firebase app initialized:', app);

  // Initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  console.log('Firebase initialized successfully');
  console.log('Firestore instance:', db);
  console.log('Auth instance:', auth);
  console.log('Storage instance:', storage);
  
  // Test Firestore connection
  console.log('Testing Firestore connection...');
  console.log('App name:', app.name);
  
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

export { db, auth, storage };
