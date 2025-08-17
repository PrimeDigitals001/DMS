import { Component } from '@angular/core';
import { Product, ProductCardComponent } from './product-card/product-card.component';
import { CartComponent, CartItem } from './cart/cart.component';
import { CommonModule } from '@angular/common';
import { RfidScannerComponent } from "../../components/rfid-scanner/rfid-scanner.component";

@Component({
  selector: 'app-home',
  imports: [ProductCardComponent, CartComponent, CommonModule, RfidScannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  isuser: boolean = true;

  products: Product[] = [
    { name: 'Amul Gold Milk', size: '1 Ltr', price: 33, stock: 15 },
    { name: 'Amul Taaza', size: '500 ml', price: 50, stock: 20 }
  ];

  cartItems: CartItem[] = [];

  addToCart(product: Product) {
    const existing = this.cartItems.find(item => item.name === product.name);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }
  }

  updateQuantity({ item, change }: { item: CartItem; change: number }) {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.cartItems = this.cartItems.filter(i => i !== item);
    }
  }

  clearCart() {
    this.cartItems = [];
  }
}
