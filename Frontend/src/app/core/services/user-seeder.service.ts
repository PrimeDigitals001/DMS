import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';

export interface UserData {
  username: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  role: 'super-admin' | 'admin' | 'staff';
  client?: string;
  passwordHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSeederService {
  private usersCollection = 'users';

  constructor() {}

  // Seed users in the database
  seedUsers(): Observable<{ success: boolean; message: string; createdUsers?: string[] }> {
    const users: UserData[] = [
      {
        username: 'superadmin@example.com',
        ownerName: 'Super Administrator',
        email: 'superadmin@example.com',
        phoneNumber: '1234567890',
        role: 'super-admin',
        passwordHash: 'password123' // In production, use proper hashing
      },
      {
        username: 'admin@example.com',
        ownerName: 'Administrator',
        email: 'admin@example.com',
        phoneNumber: '1234567891',
        role: 'admin',
        passwordHash: 'password123'
      },
      {
        username: 'staff@example.com',
        ownerName: 'Staff Member',
        email: 'staff@example.com',
        phoneNumber: '1234567892',
        role: 'staff',
        passwordHash: 'password123'
      }
    ];

    return from(this.createUsersIfNotExist(users)).pipe(
      map((result) => ({
        success: true,
        message: `Seeding completed. ${result.createdUsers.length} users created.`,
        createdUsers: result.createdUsers
      })),
      catchError((error) => {
        console.error('Seeding error:', error);
        return of({
          success: false,
          message: 'Failed to seed users'
        });
      })
    );
  }

  // Create users only if they don't exist
  private async createUsersIfNotExist(users: UserData[]): Promise<{ createdUsers: string[] }> {
    const createdUsers: string[] = [];

    for (const userData of users) {
      try {
        // Check if user already exists
        const usersRef = collection(db, this.usersCollection);
        const q = query(usersRef, where('email', '==', userData.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // User doesn't exist, create it
          const docRef = await addDoc(usersRef, userData);
          createdUsers.push(userData.email);
          console.log(`Created user: ${userData.email} (${userData.role})`);
        } else {
          console.log(`User ${userData.email} already exists, skipping...`);
        }
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }

    return { createdUsers };
  }

  // Get all users from database
  getAllUsers(): Observable<{ success: boolean; users?: any[]; message?: string }> {
    return from(this.fetchAllUsers()).pipe(
      map((users) => ({
        success: true,
        users
      })),
      catchError((error) => {
        console.error('Get users error:', error);
        return of({
          success: false,
          message: 'Failed to fetch users'
        });
      })
    );
  }

  private async fetchAllUsers(): Promise<any[]> {
    const usersRef = collection(db, this.usersCollection);
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Clear all users (use with caution)
  clearAllUsers(): Observable<{ success: boolean; message: string }> {
    return from(this.deleteAllUsers()).pipe(
      map(() => ({
        success: true,
        message: 'All users cleared successfully'
      })),
      catchError((error) => {
        console.error('Clear users error:', error);
        return of({
          success: false,
          message: 'Failed to clear users'
        });
      })
    );
  }

  private async deleteAllUsers(): Promise<void> {
    const usersRef = collection(db, this.usersCollection);
    const querySnapshot = await getDocs(usersRef);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}
