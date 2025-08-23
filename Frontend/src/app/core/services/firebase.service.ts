import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app!: FirebaseApp;
  public db!: Firestore;
  public auth!: Auth;
  public storage!: FirebaseStorage;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebaseConfig);
    
    // Initialize Firebase services
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);
    
    console.log('Firebase initialized successfully');
  }

  // Get Firestore database instance
  getFirestore(): Firestore {
    return this.db;
  }

  // Get Authentication instance
  getAuth(): Auth {
    return this.auth;
  }

  // Get Storage instance
  getStorage(): FirebaseStorage {
    return this.storage;
  }
}
