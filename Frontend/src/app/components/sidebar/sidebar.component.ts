import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { icon: 'grid_view', label: 'Clients', route: '/clients' },
    // { icon: 'inventory_2', label: 'Manage Items', route: '/manage-items' },
    // { icon: 'people', label: 'Customers', route: '/customers' }
  ];

  selectedRoute: string = '/dashboard';

  selectMenu(item: MenuItem) {
    this.selectedRoute = item.route;
    // Navigate to route if using Router
    // this.router.navigate([item.route]);
  }
}
