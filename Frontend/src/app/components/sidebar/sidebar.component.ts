import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    // { icon: 'home', label: 'Home', route: '/' },
    { icon: 'grid_view', label: 'Clients', route: '/clients' },
    { icon: 'inventory_2', label: 'Items', route: '/items' },
  ];

  selectedRoute: string = '/';

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial selected route based on current URL
    this.selectedRoute = this.router.url;
    
    // Listen to route changes to update selected menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.selectedRoute = event.url;
    });
  }

  selectMenu(item: MenuItem) {
    this.selectedRoute = item.route;
    // Navigate to the selected route
    this.router.navigate([item.route]);
  }

  isRouteActive(route: string): boolean {
    return this.selectedRoute === route;
  }

  getIconClass(icon: string): string {
    switch (icon) {
      case 'home':
        return 'pi pi-home';
      case 'grid_view':
        return 'pi pi-users';
      case 'inventory_2':
        return 'pi pi-box';
      default:
        return 'pi pi-circle';
    }
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
}
