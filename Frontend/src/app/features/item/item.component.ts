import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs/operators';
import { ItemVDM } from '../../shared/models/item.vdm';
import { ItemService } from '../../core/services/item.service';

// PrimeNG Components
import { Dialog, DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    InputNumberModule,
    FileUploadModule,
    ProgressSpinnerModule,
    FloatLabelModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
})
export class ItemComponent implements OnInit {
  @ViewChild('dt') dt: any;

  items: ItemVDM[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  totalItems: number = 0;
  
  // Dialog states
  visible: boolean = false;
  editMode: boolean = false;
  selectedItemId: string | null = null;
  
  // Form
  itemForm!: FormGroup;
  
  // Loading states
  modalLoading: boolean = false;
  deleteLoading: boolean = false;
  imageUploading: boolean = false;
  
  // Success/Error messages
  successMessage: string = '';
  errorMessage: string = '';
  
  // Capacity options
  capacityOptions = [
    { label: '100 ml', value: '100 ml' },
    { label: '250 ml', value: '250 ml' },
    { label: '500 ml', value: '500 ml' },
    { label: '1 Ltr', value: '1 Ltr' },
    { label: '2 Ltr', value: '2 Ltr' },
  ];

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadItems();
  }

  /** Initialize the Add/Edit Item Form */
  initForm() {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      capacity: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      image: [''],
    });
  }

  /** Fetch items from backend */
  loadItems(): void {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (res) => {
        this.items = res;
        this.totalItems = this.items.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching items:', err);
        this.showError('Failed to load items. Please try again.');
        this.loading = false;
      },
    });
  }

  /** Open Add/Edit Dialog */
  showDialog(item?: ItemVDM) {
    // Reset form and state first
    this.resetDialogState();
    
    if (item) {
      // Edit mode
      this.editMode = true;
      this.selectedItemId = item._id || null;
      
      // Use setTimeout to ensure form is properly initialized
      setTimeout(() => {
        this.itemForm.patchValue({
          name: item.name,
          capacity: item.capacity,
          price: item.price,
          image: item.image || '',
        });
      }, 0);
    } else {
      // Add mode
      this.editMode = false;
      this.selectedItemId = null;
    }
    
    this.visible = true;
    this.clearMessages();
  }

  /** Reset dialog state and form */
  resetDialogState() {
    this.editMode = false;
    this.selectedItemId = null;
    this.modalLoading = false;
    this.imageUploading = false;
    this.itemForm.reset();
    this.clearMessages();
  }

  /** Close dialog and reset form */
  closeDialog() {
    this.visible = false;
    this.resetDialogState();
  }

  /** Add new item */
  addItem() {
    console.log('Add item method called');
    console.log('Form valid:', this.itemForm.valid);
    console.log('Form value:', this.itemForm.value);
    
    if (this.itemForm.valid) {
      this.modalLoading = true;
      const newItem = new ItemVDM(this.itemForm.value);
      console.log('New item object:', newItem);
      console.log('Item to remote:', newItem.toRemote());

      this.itemService
        .createItem(newItem)
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            console.log('Item created successfully:', result);
            this.loadItems();
            this.closeDialog();
            this.showSuccess('Item created successfully!');
          },
          error: (err) => {
            console.error('Error adding item:', err);
            this.showError('Failed to create item. Please try again.');
            this.modalLoading = false;
          },
        });
    } else {
      console.log('Form is invalid');
      console.log('Form errors:', this.itemForm.errors);
      this.markFormGroupTouched();
    }
  }

  /** Edit existing item */
  editItem() {
    if (this.itemForm.valid && this.selectedItemId) {
      this.modalLoading = true;
      const updatedItem = new ItemVDM(this.itemForm.value);

      this.itemService
        .updateItem(this.selectedItemId, updatedItem)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.loadItems();
            this.closeDialog();
            this.showSuccess('Item updated successfully!');
          },
          error: (err) => {
            console.error('Error updating item:', err);
            this.showError('Failed to update item. Please try again.');
            this.modalLoading = false;
          },
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  /** Delete item with confirmation */
  deleteItem(item: ItemVDM) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.confirmDelete(item._id!);
      },
    });
  }

  /** Confirm delete operation */
  confirmDelete(itemId: string) {
    this.deleteLoading = true;
    this.itemService
      .deleteItem(itemId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadItems();
          this.showSuccess('Item deleted successfully!');
          this.deleteLoading = false;
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          this.showError('Failed to delete item. Please try again.');
          this.deleteLoading = false;
        },
      });
  }

  /** Handle image upload */
  onImageUpload(event: any) {
    const file = event.files[0];
    if (!file) return;

    this.imageUploading = true;
    this.clearMessages();

    this.itemService.uploadImage(file).subscribe({
      next: (res) => {
        this.itemForm.patchValue({ image: res.url });
        this.imageUploading = false;
        this.showSuccess('Image uploaded successfully!');
      },
      error: (err) => {
        console.error('Image upload failed:', err);
        this.showError('Failed to upload image. Please try again.');
        this.imageUploading = false;
      },
    });
  }

  /** Clear image */
  clearImage() {
    this.itemForm.patchValue({ image: '' });
  }

  /** Mark all form controls as touched for validation display */
  markFormGroupTouched() {
    Object.keys(this.itemForm.controls).forEach(key => {
      const control = this.itemForm.get(key);
      control?.markAsTouched();
    });
  }

  /** Show success message */
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  }

  /** Show error message */
  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000,
    });
  }

  /** Clear success/error messages */
  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /** Get filtered items for search */
  get filteredItems(): ItemVDM[] {
    if (!this.searchQuery.trim()) {
      return this.items;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.items.filter(
      item =>
        item.name.toLowerCase().includes(query) ||
        item.capacity.toLowerCase().includes(query)
    );
  }
}
