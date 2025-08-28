import { Injectable, computed, signal } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    ownerName: string;
    email?: string;
    phoneNumber: string;
    role: 'super-admin' | 'admin' | 'staff';
    client?: string;
  };
}

export interface UserData {
  id: string;
  username: string;
  ownerName: string;
  email?: string;
  phoneNumber: string;
  role: 'super-admin' | 'admin' | 'staff';
  client?: string;
  passwordHash: string;
}

export type UserRole = 'super-admin' | 'admin' | 'staff';
type StoredUser = LoginResponse['data'];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userKey = 'auth_user';
  private usersCollection = 'users';

  // Reactive user state using Angular signals
  private userSig = signal<StoredUser | null>(this.readStoredUser());

  // Derived role from the stored user
  private roleSig = computed<UserRole | null>(() => this.userSig()?.role || null);

  // Convenience computed values
  private isAuthedSig = computed<boolean>(() => this.userSig() !== null);
  private canSeeSidebarSig = computed<boolean>(() => {
    const role = this.roleSig();
    return role === 'super-admin' || role === 'admin';
  });

  constructor() {}

  // Attempt to log in the user
  login(payload: LoginPayload): Observable<LoginResponse> {
    return from(this.authenticateUser(payload.username, payload.password)).pipe(
      map((result) => {
        if (result.success && result.data) {
          this.writeStoredUser(result.data);
          this.userSig.set(result.data);
        }
        return result;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of({
          success: false,
          message: 'Login failed. Please try again.',
          data: {
            id: '',
            username: '',
            ownerName: '',
            phoneNumber: '',
            role: 'staff' as const
          }
        });
      })
    );
  }

  // Authenticate user against Firestore
  private async authenticateUser(username: string, password: string): Promise<LoginResponse> {
    try {
      // Find user by email or phone number
      const usersRef = collection(db, this.usersCollection);
      const q = query(
        usersRef,
        where('email', '==', username)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Try searching by phone number
        const phoneQuery = query(
          usersRef,
          where('phoneNumber', '==', username)
        );
        const phoneSnapshot = await getDocs(phoneQuery);
        
        if (phoneSnapshot.empty) {
          return {
            success: false,
            message: 'Invalid username or password',
            data: {
              id: '',
              username: '',
              ownerName: '',
              phoneNumber: '',
              role: 'staff'
            }
          };
        }
        
        // Use phone number result
        const userDoc = phoneSnapshot.docs[0];
        const userData = userDoc.data() as UserData;
        
        // Verify password (simple comparison for demo - use bcrypt in production)
        if (userData.passwordHash !== password) {
          return {
            success: false,
            message: 'Invalid username or password',
            data: {
              id: '',
              username: '',
              ownerName: '',
              phoneNumber: '',
              role: 'staff'
            }
          };
        }

        return {
          success: true,
          message: 'Login successful',
          data: {
            id: userDoc.id,
            username: userData.email || userData.phoneNumber,
            ownerName: userData.ownerName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
            client: userData.client
          }
        };
      }

      // Use email result
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as UserData;
      
      // Verify password (simple comparison for demo - use bcrypt in production)
      if (userData.passwordHash !== password) {
        return {
          success: false,
          message: 'Invalid username or password',
          data: {
            id: '',
            username: '',
            ownerName: '',
            phoneNumber: '',
            role: 'staff'
          }
        };
      }

      return {
        success: true,
        message: 'Login successful',
        data: {
          id: userDoc.id,
          username: userData.email || userData.phoneNumber,
          ownerName: userData.ownerName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          client: userData.client
        }
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'Authentication failed',
        data: {
          id: '',
          username: '',
          ownerName: '',
          phoneNumber: '',
          role: 'staff'
        }
      };
    }
  }

  // Log out user by clearing data
  logout(): Observable<any> {
    return of({}).pipe(
      map(() => {
        localStorage.removeItem(this.userKey);
        this.userSig.set(null);
        return { success: true, message: 'Logout successful' };
      })
    );
  }

  // Get current user from stored data
  getCurrentUser(): Observable<LoginResponse> {
    const user = this.getUser();
    if (user) {
      return of({
        success: true,
        message: 'User found',
        data: user
      });
    } else {
      return of({
        success: false,
        message: 'No user logged in',
        data: {
          id: '',
          username: '',
          ownerName: '',
          phoneNumber: '',
          role: 'staff'
        }
      });
    }
  }

  // Create a new user in the database
  createUser(userData: Omit<UserData, 'id'>): Observable<{ success: boolean; message: string; userId?: string }> {
    return from(addDoc(collection(db, this.usersCollection), userData)).pipe(
      map((docRef) => ({
        success: true,
        message: 'User created successfully',
        userId: docRef.id
      })),
      catchError((error) => {
        console.error('Create user error:', error);
        return of({
          success: false,
          message: 'Failed to create user'
        });
      })
    );
  }

  // Get the logged-in user's data (reactive-safe)
  getUser(): StoredUser | null {
    return this.userSig();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthedSig();
  }

  // Get user role
  getRole(): UserRole | null {
    return this.roleSig();
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    return this.roleSig() === 'super-admin';
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.roleSig() === 'admin';
  }

  // Check if user is staff
  isStaff(): boolean {
    return this.roleSig() === 'staff';
  }

  // Check if user can see sidebar (admin and super-admin only)
  canSeeSidebar(): boolean {
    return this.canSeeSidebarSig();
  }

  // Check if user can access clients (super-admin only)
  canAccessClients(): boolean {
    return this.roleSig() === 'super-admin';
  }

  // Check if user can access items (admin and super-admin)
  canAccessItems(): boolean {
    const role = this.roleSig();
    return role === 'admin' || role === 'super-admin';
  }

  // Check if user can access customers (admin and super-admin)
  canAccessCustomers(): boolean {
    const role = this.roleSig();
    return role === 'admin' || role === 'super-admin';
  }

  // Check if user can access home/cart (all users)
  canAccessHome(): boolean {
    return this.isLoggedIn();
  }

  // ============ Helpers ============

  private readStoredUser(): StoredUser | null {
    const json = localStorage.getItem(this.userKey);
    if (!json) return null;
    try {
      return JSON.parse(json) as StoredUser;
    } catch {
      return null;
    }
  }

  private writeStoredUser(user: StoredUser | null): void {
    if (!user) {
      localStorage.removeItem(this.userKey);
      return;
    }
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}