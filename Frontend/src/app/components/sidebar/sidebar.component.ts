import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

type UserRole = 'admin' | 'super-admin';

interface MenuItem {
  icon: string;          // primeicons class e.g. 'pi pi-users'
  label: string;
  route: string;
  roles: UserRole[];     // which roles can see this item
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Option 1: pass role from parent: <app-sidebar [role]="userRole"></app-sidebar>
  @Input() role?: UserRole;

  // Fallback: read role from localStorage if not provided via @Input
  currentRole: UserRole = 'admin';

  // Full menu; visibility is filtered by role
  private allMenuItems: MenuItem[] = [
    { icon: 'pi pi-chart-line', label: 'Analytics',         route: '/analytics', roles: ['admin', 'super-admin'] },
    { icon: 'pi pi-users',      label: 'Manage Customers',  route: '/customers', roles: ['admin', 'super-admin'] },
    { icon: 'pi pi-box',        label: 'Manage Items',      route: '/items',     roles: ['admin', 'super-admin'] },
    { icon: 'pi pi-briefcase',  label: 'Manage Clients',    route: '/clients',   roles: ['super-admin'] },
  ];

  get menuItems(): MenuItem[] {
    return this.allMenuItems.filter(m => m.roles.includes(this.currentRole));
  }

  ngOnInit(): void {
    if (this.role) {
      this.currentRole = this.role;
    } else {
      const stored = (localStorage.getItem('role') as UserRole | null) ?? 'admin';
      this.currentRole = stored === 'super-admin' ? 'super-admin' : 'admin';
    }
  }
}