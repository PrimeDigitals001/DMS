import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserSeederService } from '../../core/services/user-seeder.service';

@Component({
  selector: 'app-user-seeder',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="seeder-container">
      <h2>User Database Seeder</h2>
      <p>This will create test users in your Firebase database.</p>
      
      <div class="button-group">
        <button 
          pButton 
          label="Seed Users" 
          icon="pi pi-database" 
          (click)="seedUsers()" 
          [loading]="seeding"
          class="p-button-success"
        ></button>
        
        <button 
          pButton 
          label="View Users" 
          icon="pi pi-eye" 
          (click)="viewUsers()" 
          [loading]="loading"
          class="p-button-info"
        ></button>
        
        <button 
          pButton 
          label="Clear Users" 
          icon="pi pi-trash" 
          (click)="clearUsers()" 
          [loading]="clearing"
          class="p-button-danger"
        ></button>
      </div>
      
      @if (users.length > 0) {
        <div class="users-list">
          <h3>Current Users:</h3>
          <div class="user-item" *ngFor="let user of users">
            <strong>{{ user.ownerName }}</strong> ({{ user.role }})
            <br>
            <small>{{ user.email }} | {{ user.phoneNumber }}</small>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .seeder-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    
    .users-list {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .user-item {
      padding: 10px;
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 10px;
    }
    
    .user-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
  `]
})
export class UserSeederComponent {
  seeding = false;
  loading = false;
  clearing = false;
  users: any[] = [];

  constructor(
    private userSeederService: UserSeederService,
    private messageService: MessageService
  ) {}

  seedUsers() {
    this.seeding = true;
    this.userSeederService.seedUsers().subscribe({
      next: (result) => {
        this.seeding = false;
        if (result.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: result.message
          });
          this.viewUsers(); // Refresh the list
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message
          });
        }
      },
      error: (error) => {
        this.seeding = false;
        console.error('Seeding error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to seed users'
        });
      }
    });
  }

  viewUsers() {
    this.loading = true;
    this.userSeederService.getAllUsers().subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success && result.users) {
          this.users = result.users;
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: `Found ${this.users.length} users`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message || 'Failed to fetch users'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('View users error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch users'
        });
      }
    });
  }

  clearUsers() {
    if (confirm('Are you sure you want to delete all users? This action cannot be undone.')) {
      this.clearing = true;
      this.userSeederService.clearAllUsers().subscribe({
        next: (result) => {
          this.clearing = false;
          if (result.success) {
            this.users = [];
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: result.message
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: result.message
            });
          }
        },
        error: (error) => {
          this.clearing = false;
          console.error('Clear users error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to clear users'
          });
        }
      });
    }
  }
}
