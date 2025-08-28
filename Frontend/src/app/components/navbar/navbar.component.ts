import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, ButtonModule, TooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  
  searchQuery: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // replace this with actual API call later
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  getRoleDisplayName(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'super-admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'staff':
        return 'Staff';
      default:
        return 'User';
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local data and redirect
        this.router.navigate(['/login']);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
