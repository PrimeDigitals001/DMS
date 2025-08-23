import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  
  searchQuery: string = '';

  customer = {
    id: '0001',
    name: 'Swapnil Solanki',
    phone: '9409411724'
  };

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // replace this with actual API call later
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
