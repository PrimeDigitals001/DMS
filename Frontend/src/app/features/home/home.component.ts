import { Component, OnInit } from '@angular/core';
import { Product, ProductCardComponent } from './product-card/product-card.component';
import { CartComponent, CartItem } from './cart/cart.component';
import { CommonModule } from '@angular/common';
import { RfidScannerComponent } from "../../components/rfid-scanner/rfid-scanner.component";
import { ItemService } from '../../core/services/item.service';
import { ItemVDM } from '../../shared/models/item.vdm';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-home',
  imports: [
    ProductCardComponent, 
    CartComponent, 
    CommonModule, 
    RfidScannerComponent,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  isuser: boolean = true;
  loading: boolean = false;

  products: Product[] = [];
  cartItems: CartItem[] = [];

  constructor(
    private itemService: ItemService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /** Load products from database */
  loadProducts(): void {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (items: ItemVDM[]) => {
        // Convert ItemVDM to Product interface
        this.products = items.map(item => ({
          id: item._id,
          name: item.name,
          size: item.capacity,
          price: item.price,
          stock: 50, // Default stock value, you can add stock field to your item model
          image: item.image || ''
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.showError('Failed to load products. Please try again.');
        this.loading = false;
      }
    });
  }

  addToCart(product: Product) {
    const existing = this.cartItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
      this.showSuccess(`${product.name} quantity updated in cart!`);
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
      this.showSuccess(`${product.name} added to cart!`);
    }
  }

  updateQuantity({ item, change }: { item: CartItem; change: number }) {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.cartItems = this.cartItems.filter(i => i !== item);
      this.showSuccess(`${item.name} removed from cart!`);
    } else {
      this.showSuccess(`${item.name} quantity updated!`);
    }
  }

  clearCart() {
    this.cartItems = [];
    this.showSuccess('Cart cleared successfully!');
  }

  /** Handle purchase completed event */
  onPurchaseCompleted() {
    this.showSuccess('Purchase completed successfully! Your order has been saved.');
    // You can add additional logic here like redirecting to order confirmation page
  }

  /** Show success message */
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 2000,
    });
  }

  /** Show error message */
  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  }
}
