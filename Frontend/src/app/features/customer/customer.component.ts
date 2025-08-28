import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { take, finalize } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SearchFilterPipe } from '../../shared/pipes/search-filter.pipe';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { CustomerVDM } from '../../shared/models/customer.vdm';
import { CustomerService } from '../../core/services/customer.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TableModule,
    TooltipModule,
    SkeletonModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  customers: CustomerVDM[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  submitting: boolean = false;
  totalCustomers: number = 0;
  visible: boolean = false;
  customerForm!: FormGroup;

  editMode: boolean = false;
  selectedCustomerId: string | null = null;

  // RFID dialog state
  rfidDialogVisible: boolean = false;
  rfidInput: string = '';
  rfidValidating: boolean = false;
  rfidError: string = '';

  // Client-side pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedCustomers: CustomerVDM[] = [];
  totalFiltered: number = 0;
  totalPages: number = 1;
  totalPagesArray: number[] = [1];

  private searchChanged$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
    this.searchChanged$.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage = 1;
      this.applyFilterAndPaging();
    });
  }

  /** Initialize the Add/Edit Customer Form */
  initForm() {
    this.customerForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      rfid: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    });
  }

  /** Open Add/Edit Dialog */
  showDialog(customer?: CustomerVDM) {
    if (customer) {
      // Edit mode
      this.editMode = true;
      this.selectedCustomerId = customer._id || null;
      this.customerForm.patchValue(customer);
    } else {
      // Add mode
      this.editMode = false;
      this.selectedCustomerId = null;
      this.customerForm.reset();
      // open RFID dialog first; details dialog opens after successful scan
      this.openRfidDialog();
      return;
    }
    this.visible = true;
  }

  /** Fetch customers from backend */
  loadCustomers(): void {
    this.loading = true;
    this.customerService
      .getCustomers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.customers = res;
          this.totalCustomers = this.customers.length;
          this.applyFilterAndPaging();
        },
        error: (err) => {
          console.error('Error fetching customers:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load customers. Please try again.',
            life: 5000,
          });
        },
      });
  }

  /** Apply search filter and paginate */
  applyFilterAndPaging() {
    const q = this.searchQuery.trim().toLowerCase();
    const filtered = this.customers.filter((c) => {
      if (!q) return true;
      return (
        (c.customerName || '').toLowerCase().includes(q) ||
        (c.phoneNumber || '').toLowerCase().includes(q) ||
        (c.rfid || '').toLowerCase().includes(q)
      );
    });
    this.totalFiltered = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalFiltered / this.itemsPerPage));
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedCustomers = filtered.slice(start, end);
  }

  onSearchChange() {
    this.searchChanged$.next(this.searchQuery);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilterAndPaging();
  }

  /** Add new customer */
  addCustomer() {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.submitting = true;
    const newCustomer = new CustomerVDM(this.customerForm.value);
    // Validate RFID uniqueness first
    this.customerService
      .validateRfid(newCustomer.rfid)
      .pipe(take(1))
      .subscribe({
        next: (val) => {
          if (!val.isValid) {
            this.submitting = false;
            this.messageService.add({ severity: 'warn', summary: 'Duplicate RFID', detail: val.message || 'RFID already exists', life: 4000 });
            return;
          }
          this.createCustomer(newCustomer);
        },
        error: () => {
          this.submitting = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to validate RFID', life: 4000 });
        },
      });
  }

  private createCustomer(newCustomer: CustomerVDM) {
    this.customerService
      .createCustomer(newCustomer)
      .pipe(take(1), finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.loadCustomers();
          this.visible = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Customer added successfully', life: 3000 });
        },
        error: (err) => {
          console.error('Error adding customer:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to add customer. Please try again.', life: 5000 });
        },
      });
  }

  /** Edit existing customer */
  editCustomer() {
    if (this.customerForm.invalid || !this.selectedCustomerId) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.submitting = true;
    const updatedCustomer = new CustomerVDM(this.customerForm.value);

    this.customerService
      .validateRfid(updatedCustomer.rfid, this.selectedCustomerId || undefined)
      .pipe(take(1))
      .subscribe({
        next: (val) => {
          if (!val.isValid) {
            this.submitting = false;
            this.messageService.add({ severity: 'warn', summary: 'Duplicate RFID', detail: val.message || 'RFID already exists', life: 4000 });
            return;
          }
          this.customerService
            .updateCustomer(this.selectedCustomerId!, updatedCustomer)
            .pipe(take(1), finalize(() => (this.submitting = false)))
            .subscribe({
              next: () => {
                this.loadCustomers();
                this.visible = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Customer updated successfully', life: 3000 });
              },
              error: (err) => {
                console.error('Error updating customer:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update customer. Please try again.', life: 5000 });
              },
            });
        },
        error: () => {
          this.submitting = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to validate RFID', life: 4000 });
        },
      });
  }

  /** Delete customer with confirmation */
  deleteCustomer(customer: CustomerVDM) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete customer "${customer.customerName}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.performDelete(customer._id!, customer.customerName);
      },
    });
  }

  /** Perform the actual delete operation */
  private performDelete(customerId: string, customerName: string) {
    this.customerService
      .deleteCustomer(customerId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadCustomers();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Customer "${customerName}" deleted successfully`,
            life: 3000,
          });
        },
        error: (err) => {
          console.error('Error deleting customer:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to delete customer. Please try again.',
            life: 5000,
          });
        },
      });
  }

  /** View customer invoices */
  viewInvoices(customer: CustomerVDM) {
    // Navigate to invoices page with customer ID
    this.router.navigate(['/invoices'], { 
      queryParams: { customerId: customer._id, customerName: customer.customerName } 
    });
  }

  // RFID modal handlers
  openRfidDialog() {
    // In add mode, if RFID already set, do not allow re-scan
    const currentRfid = this.customerForm?.get('rfid')?.value;
    if (!this.editMode && currentRfid) {
      return;
    }
    this.rfidInput = '';
    this.rfidError = '';
    this.rfidDialogVisible = true;
  }

  cancelRfidDialog() {
    this.rfidDialogVisible = false;
    this.rfidInput = '';
    this.rfidError = '';
  }

  confirmRfid() {
    const value = (this.rfidInput || '').trim();
    if (!value) {
      this.rfidError = 'Please tap your RFID card';
      return;
    }
    this.rfidValidating = true;
    const exclude = this.editMode ? this.selectedCustomerId || undefined : undefined;
    this.customerService
      .validateRfid(value, exclude)
      .pipe(take(1), finalize(() => (this.rfidValidating = false)))
      .subscribe({
        next: (val) => {
          if (!val.isValid) {
            this.rfidError = val.message || 'RFID is already registered';
            return;
          }
          this.customerForm.get('rfid')?.setValue(value);
          this.rfidDialogVisible = false;
          this.rfidError = '';
          // if adding, open details dialog now
          if (!this.editMode) {
            this.visible = true;
          }
        },
        error: () => {
          this.rfidError = 'Failed to validate RFID. Please try again.';
        },
      });
  }

  /** Mark all form fields as touched to show validation errors */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /** Get form control for validation */
  get f() {
    return this.customerForm.controls;
  }

  /** Check if field has error */
  hasError(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /** Get error message for field */
  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['pattern']) {
        return 'Phone number must be exactly 10 digits';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  /** Get field label for error messages */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      customerName: 'Customer name',
      phoneNumber: 'Phone number',
      rfid: 'RFID',
    };
    return labels[fieldName] || fieldName;
  }

  /** Close dialog and reset form */
  closeDialog() {
    this.visible = false;
    this.customerForm.reset();
    this.submitting = false;
  }

  /** Handle form submission */
  onSubmit() {
    if (this.editMode) {
      this.editCustomer();
    } else {
      this.addCustomer();
    }
  }
}