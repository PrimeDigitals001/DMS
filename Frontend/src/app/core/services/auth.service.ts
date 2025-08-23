import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  username: string;
  password: string;
  adminPassword?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    client: string | null;    // client might be null/empty for super-admins
    username: string;
    ownerName: string;
    email?: string;
    phoneNumber: string;
    isAdmin: boolean;         // backend flag (true for admin/super-admin)
    role?: 'admin' | 'super-admin'; // optional from backend (if available)
    isSuperAdmin?: boolean;   // optional from backend (if available)
  };
}

export type UserRole = 'admin' | 'super-admin';
type StoredUser = LoginResponse['data']; // we persist exactly what we receive (+ optional role fields)

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token'; // reserved if you add token later
  private userKey = 'auth_user';

  // Reactive user state using Angular signals
  private userSig = signal<StoredUser | null>(this.readStoredUser());

  // Derived role from the stored user
  private roleSig = computed<UserRole | null>(() => this.deriveRole(this.userSig()));

  // Convenience computed values
  private isAuthedSig = computed<boolean>(() => this.userSig() !== null);
  private canSeeSidebarSig = computed<boolean>(() => {
    const r = this.roleSig();
    return r === 'admin' || r === 'super-admin';
  });

  constructor(private http: HttpClient) {}

  // Attempt to log in the user
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          // If backend doesn’t send role/isSuperAdmin, derive role locally
          const derivedRole = this.deriveRole(res.data);
          const toStore: StoredUser = {
            ...res.data,
            role: res.data.role ?? derivedRole ?? undefined,
          };
          this.writeStoredUser(toStore);
          this.userSig.set(toStore);
        }
      })
    );
  }

  // Log out user by clearing data
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSig.set(null);
  }

  // Get the logged-in user's data (reactive-safe)
  getUser(): StoredUser | null {
    return this.userSig();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthedSig();
  }

  // Original method kept for compatibility (checks backend flag)
  isAdmin(): boolean {
    const user = this.userSig();
    return user?.isAdmin === true && this.getRole() === 'admin';
  }

  // New: true only for super-admins
  isSuperAdmin(): boolean {
    return this.roleSig() === 'super-admin';
  }

  // New: return 'admin' | 'super-admin' | null
  getRole(): UserRole | null {
    return this.roleSig();
  }

  // New: show sidebar only for admin or super-admin
  canSeeSidebar(): boolean {
    return this.canSeeSidebarSig();
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

  private deriveRole(user: StoredUser | null): UserRole | null {
    if (!user) return null;

    // If backend already provides 'role', trust it
    if (user.role === 'admin' || user.role === 'super-admin') {
      return user.role;
    }

    // If backend provides explicit super-admin flag
    if (user.isSuperAdmin === true) return 'super-admin';

    // Heuristic:
    // - If isAdmin true AND has a client => admin of that client
    // - If isAdmin true AND no/empty client => super-admin
    if (user.isAdmin === true) {
      const clientStr = (user.client ?? '').toString().trim().toLowerCase();
      if (!clientStr || clientStr === 'super-admin') {
        return 'super-admin';
      }
      return 'admin';
    }

    // Not an admin or super admin
    return null;
  }
}