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
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'users', label: 'Clients', route: '/clients' },
    { icon: 'box', label: 'Items', route: '/items' },
    { icon: 'users', label: 'Customers', route: '/customers' }
  ];

  selectedRoute: string = '/';

  constructor(private router: Router) {}

  ngOnInit() {
    // Track route changes to highlight active menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.selectedRoute = event.url;
    });
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
}
