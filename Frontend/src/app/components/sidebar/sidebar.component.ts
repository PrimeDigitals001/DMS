import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: '/', roles: ['super-admin', 'admin', 'staff'] },
    { icon: 'users', label: 'Clients', route: '/clients', roles: ['super-admin'] },
    { icon: 'box', label: 'Items', route: '/items', roles: ['admin'] },
    { icon: 'users', label: 'Customers', route: '/customers', roles: ['admin'] }
  ];

  selectedRoute: string = '/';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Track route changes to highlight active menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.selectedRoute = event.url;
    });
  }

  getFilteredMenuItems(): MenuItem[] {
    const userRole = this.authService.getRole();
    if (!userRole) return [];
    
    return this.menuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  selectMenu(item: MenuItem) {
    this.selectedRoute = item.route;
    this.router.navigate([item.route]);
  }

  onMouseEnter() {
    if (!this.isOpen) {
      this.sidebarToggle.emit();
    }
  }

  onMouseLeave() {
    if (this.isOpen) {
      this.sidebarToggle.emit();
    }
  }

  isRouteActive(route: string): boolean {
    return this.selectedRoute === route;
  }

  getIconClass(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'home': 'pi pi-home',
      'users': 'pi pi-users',
      'box': 'pi pi-box'
    };
    return iconMap[icon] || 'pi pi-circle';
  }

  getUserDisplayName(): string {
    const user = this.authService.getUser();
    return user?.ownerName || 'User';
  }

  getUserRole(): string {
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
}
