
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';

export interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})

export class CartComponent {
  @Input() items: CartItem[] = [];
  @Output() clearCart = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{ item: CartItem; change: number }>();

  get subtotal(): number {
    return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
}
