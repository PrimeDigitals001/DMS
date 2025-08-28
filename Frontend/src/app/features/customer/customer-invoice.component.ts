import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription, combineLatest, of, switchMap, map, firstValueFrom } from 'rxjs';
import { CustomerService } from '../../core/services/customer.service';
import { PurchaseService } from '../../core/services/purchase.service';

interface ViewOrderRow {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Component({
  selector: 'app-customer-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    TableModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: './customer-invoice.component.html',
  styleUrls: ['./customer-invoice.component.css']
})
export class CustomerInvoiceComponent implements OnInit, OnDestroy {
  customerId: string = '';
  customer: any = null;
  orders: ViewOrderRow[] = [];
  loading: boolean = true;
  error: string | null = null;
  successMessage: string = '';
  showInvoiceModal: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedOrders: ViewOrderRow[] = [];
  sendingInvoice: boolean = false;

  currentPage: number = 1;
  readonly itemsPerPage = 10;

  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private purchaseService: PurchaseService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.queryParamMap
        .pipe(
          map((params) => params.get('customerId') || ''),
          switchMap((id) => {
            this.customerId = id;
            console.log('Loading data for customer ID:', id);
            if (!id) return of(null);
            this.loading = true;
            this.error = null;
            return combineLatest([
              this.customerService.getCustomerById(id),
              this.purchaseService.getPurchasesByCustomerSimple(id), // Use simple query
            ]);
          })
        )
        .subscribe({
          next: (result: any) => {
            if (!result) return;
            const [customer, purchases] = result;
            console.log('Customer data:', customer);
            console.log('Purchases found:', purchases);
            
            this.customer = customer;
            
            if (purchases && purchases.length > 0) {
              this.loadCompletePurchaseData(purchases);
            } else {
              console.log('No purchases found for customer');
              this.orders = [];
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('Error in ngOnInit:', err);
            this.loading = false;
            this.error = 'Failed to load customer data. Please try again.';
          },
        })
    );
  }

  private async loadCompletePurchaseData(purchases: any[]) {
    try {
      console.log('Loading complete purchase data for purchases:', purchases);
      const rows: ViewOrderRow[] = [];
      
      for (const purchase of purchases) {
        const purchaseDate = purchase.purchaseDate?.toDate?.() || new Date();
        const dateStr = purchaseDate.toISOString().split('T')[0];
        console.log(`Processing purchase ${purchase._id}, date: ${dateStr}`);
        
        // Get purchase items for this purchase
        const purchaseItems = await firstValueFrom(
          this.purchaseService.getPurchaseItemsSimple(purchase._id)
        );
        
        console.log(`Found ${purchaseItems.length} items for purchase ${purchase._id}:`, purchaseItems);
        
        if (purchaseItems && purchaseItems.length > 0) {
          // Process each purchase item
          for (const item of purchaseItems) {
            console.log('Processing purchase item:', item);
            
            // Check if itemName is already stored in purchaseItems
            if (item.itemName) {
              console.log('Item name found in purchase item:', item.itemName);
              rows.push({
                id: `${purchase._id}_${item._id}`,
                itemId: item.itemId || '-',
                itemName: item.itemName,
                date: dateStr,
                quantity: item.quantity || 0,
                unitPrice: item.unitPrice || (item.amount / (item.quantity || 1)) || 0,
                total: item.amount || 0,
              });
            } else {
              // Try to get item details from items collection
              try {
                const itemDetails: any = await firstValueFrom(
                  this.purchaseService.getItemByIdSimple(item.itemId)
                );
                console.log('Item details fetched:', itemDetails);
                
                rows.push({
                  id: `${purchase._id}_${item._id}`,
                  itemId: item.itemId || '-',
                  itemName: itemDetails?.itemName || 'Unknown Item',
                  date: dateStr,
                  quantity: item.quantity || 0,
                  unitPrice: item.unitPrice || (item.amount / (item.quantity || 1)) || 0,
                  total: item.amount || 0,
                });
              } catch (itemError) {
                console.warn(`Could not fetch item details for ${item.itemId}:`, itemError);
                // Fallback with available data
                rows.push({
                  id: `${purchase._id}_${item._id}`,
                  itemId: item.itemId || '-',
                  itemName: 'Item ID: ' + (item.itemId || 'Unknown'),
                  date: dateStr,
                  quantity: item.quantity || 0,
                  unitPrice: item.unitPrice || (item.amount / (item.quantity || 1)) || 0,
                  total: item.amount || 0,
                });
              }
            }
          }
        } else {
          console.log(`No items found for purchase ${purchase._id}, showing purchase total`);
          // Fallback to purchase total if no items found
          rows.push({
            id: purchase._id,
            itemId: purchase._id,
            itemName: `Purchase Total on ${dateStr}`,
            date: dateStr,
            quantity: 1,
            unitPrice: purchase.totalAmount || 0,
            total: purchase.totalAmount || 0,
          });
        }
      }
      
      console.log('Final rows created:', rows);
      this.orders = rows;
      this.loading = false;
      
    } catch (error) {
      console.error('Error loading complete purchase data:', error);
      this.loading = false;
      this.error = 'Failed to load purchase details.';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.orders.length / this.itemsPerPage));
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get paginatedOrders(): ViewOrderRow[] {
    return this.orders.slice(this.startIndex, this.startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  handleCustomInvoice() {
    this.showInvoiceModal = true;
    this.error = null;
    
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.endDate = today;
    this.startDate = thirtyDaysAgo;
    
    // Automatically filter orders for the selected date range
    this.onDateRangeChange();
  }

  onDateRangeChange() {
    if (!this.startDate || !this.endDate) {
      this.selectedOrders = [];
      return;
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    // Reset time to start/end of day for accurate comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    console.log('Filtering orders from', start, 'to', end);
    
    this.selectedOrders = this.orders.filter((order) => {
      const orderDate = new Date(order.date);
      orderDate.setHours(12, 0, 0, 0); // Set to noon for date comparison
      
      const isInRange = orderDate >= start && orderDate <= end;
      console.log(`Order date: ${orderDate}, In range: ${isInRange}`);
      
      return isInRange;
    });
    
    console.log('Selected orders for date range:', this.selectedOrders);
  }

  get totalAmount(): number {
    return this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
  }

  get selectedTotalAmount(): number {
    return this.selectedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }

  get selectedTotalQuantity(): number {
    return this.selectedOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  }

  // Prepare invoice data for PDF export
  prepareInvoiceData() {
    if (!this.customer || this.selectedOrders.length === 0) {
      return null;
    }

    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      customer: {
        id: this.customer._id,
        name: this.customer.customerName,
        phone: this.customer.phoneNumber,
        rfid: this.customer.rfid
      },
      dateRange: {
        start: this.startDate ? this.startDate.toISOString().split('T')[0] : '',
        end: this.endDate ? this.endDate.toISOString().split('T')[0] : ''
      },
      items: this.selectedOrders.map(order => ({
        date: order.date,
        itemId: order.itemId,
        itemName: order.itemName,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        total: order.total
      })),
      summary: {
        totalItems: this.selectedOrders.length,
        totalQuantity: this.selectedTotalQuantity,
        totalAmount: this.selectedTotalAmount,
        currency: '₹'
      }
    };

    console.log('Invoice data prepared for PDF:', invoiceData);
    return invoiceData;
  }

  closeModal() {
    this.showInvoiceModal = false;
    this.selectedOrders = [];
    this.startDate = null;
    this.endDate = null;
    this.error = null;
  }

  sendInvoice() {
    const invoiceData = this.prepareInvoiceData();
    if (!invoiceData) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No invoice data available',
        life: 3000
      });
      return;
    }

    // Placeholder for send action - later this will generate PDF
    this.sendingInvoice = true;
    setTimeout(() => {
      this.sendingInvoice = false;
      this.showInvoiceModal = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Invoice generated for ${invoiceData.customer.name} - ${invoiceData.summary.totalItems} items, Total: ₹${invoiceData.summary.totalAmount}`,
        life: 5000
      });
      
      // Log the invoice data for PDF generation later
      console.log('Invoice ready for PDF export:', invoiceData);
      
    }, 1500);
  }

  backToCustomers() {
    this.router.navigate(['/customers']);
  }
}


