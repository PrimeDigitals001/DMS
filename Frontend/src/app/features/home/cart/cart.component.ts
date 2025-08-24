
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { PurchaseService, PurchaseRequest } from '../../../core/services/purchase.service';
import { MessageService } from 'primeng/api';
import { take } from 'rxjs/operators';

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
  @Output() purchaseCompleted = new EventEmitter<void>();

  // Mock data - you should get these from your authentication service or user context
  private clientId: string = '507f1f77bcf86cd799439011'; // Replace with actual client ID
  private customerId: string = '507f1f77bcf86cd799439012'; // Replace with actual customer ID

  purchasing: boolean = false;

  constructor(
    private purchaseService: PurchaseService,
    private messageService: MessageService
  ) {}

  get subtotal(): number {
    return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  /**
   * Complete the purchase
   */
  completePurchase(): void {
    if (this.items.length === 0) {
      this.showError('Cart is empty. Please add items before completing purchase.');
      return;
    }

    this.purchasing = true;

    // Prepare purchase data
    const purchaseData: PurchaseRequest = {
      clientId: this.clientId,
      customerId: this.customerId,
      itemList: this.items.map(item => ({
        itemId: item.id!,
        qty: item.quantity,
        unitPrice: item.price
      })),
      totalAmount: this.subtotal
    };

    // Create purchase using Firebase
    this.purchaseService.createPurchase(purchaseData)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log('Purchase created successfully in Firebase:', response);
          this.showSuccess('Purchase completed successfully!');
          this.clearCart.emit();
          this.purchaseCompleted.emit();
        },
        error: (error) => {
          console.error('Error creating purchase in Firebase:', error);
          this.showError('Failed to complete purchase. Please try again.');
        },
        complete: () => {
          this.purchasing = false;
        }
      });
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000,
    });
  }
}
