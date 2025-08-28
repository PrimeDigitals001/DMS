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
import { ClientVDM } from '../../shared/models/client.vdm';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SearchFilterPipe } from '../../shared/pipes/search-filter.pipe';
import { FloatLabel } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Dialog,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    SearchFilterPipe,
    FloatLabel,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TableModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  clients: ClientVDM[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  submitting: boolean = false;
  totalClients: number = 0;
  visible: boolean = false;
  clientForm!: FormGroup;

  editMode: boolean = false;
  selectedClientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  /** Initialize the Add/Edit Client Form */
  initForm() {
    this.clientForm = this.fb.group({
      client: ['', [Validators.required, Validators.minLength(2)]],
      ownerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /** Open Add/Edit Dialog */
  showDialog(client?: ClientVDM) {
    if (client) {
      // Edit mode
      this.editMode = true;
      this.selectedClientId = client._id || null;
      this.clientForm.patchValue(client);
    } else {
      // Add mode
      this.editMode = false;
      this.selectedClientId = null;
      this.clientForm.reset();
    }
    this.visible = true;
  }

  /** Fetch clients from backend */
  loadClients(): void {
    this.loading = true;
    this.clientService
      .getClients()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.clients = res;
          this.totalClients = this.clients.length;
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load clients. Please try again.',
            life: 5000,
          });
        },
      });
  }

  /** Add new client */
  addClient() {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      return;
    }

    this.submitting = true;
    const newClient = new ClientVDM(this.clientForm.value);

    this.clientService
      .createClient(newClient)
      .pipe(
        take(1),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: (createdClient) => {
          // Create admin user for this client
          const adminUserData = {
            username: this.clientForm.value.email,
            ownerName: this.clientForm.value.ownerName,
            email: this.clientForm.value.email,
            phoneNumber: this.clientForm.value.phoneNumber,
            role: 'admin' as const,
            client: this.clientForm.value.client,
            passwordHash: 'password123' // Default password, should be changed by admin
          };

          this.authService.createUser(adminUserData).subscribe({
            next: (userResult) => {
              if (userResult.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: `Client added successfully. Admin user created with email: ${this.clientForm.value.email} and password: password123`,
                  life: 5000,
                });
              } else {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Client added but failed to create admin user. Please create admin user manually.',
                  life: 5000,
                });
              }
            },
            error: (userError) => {
              console.error('Error creating admin user:', userError);
              this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Client added but failed to create admin user. Please create admin user manually.',
                life: 5000,
              });
            }
          });

          this.loadClients();
          this.visible = false;
        },
        error: (err) => {
          console.error('Error adding client:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add client. Please try again.',
            life: 5000,
          });
        },
      });
  }

  /** Edit existing client */
  editClient() {
    if (this.clientForm.invalid || !this.selectedClientId) {
      this.markFormGroupTouched(this.clientForm);
      return;
    }

    this.submitting = true;
    const updatedClient = new ClientVDM(this.clientForm.value);

    this.clientService
      .updateClient(this.selectedClientId, updatedClient)
      .pipe(
        take(1),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: () => {
          this.loadClients();
          this.visible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Client updated successfully',
            life: 3000,
          });
        },
        error: (err) => {
          console.error('Error updating client:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update client. Please try again.',
            life: 5000,
          });
        },
      });
  }

  /** Delete client with confirmation */
  deleteClient(client: ClientVDM) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete client "${client.client}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performDelete(client._id!);
      },
    });
  }

  /** Perform the actual delete operation */
  private performDelete(clientId: string) {
    this.clientService
      .deleteClient(clientId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadClients();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Client deleted successfully',
            life: 3000,
          });
        },
        error: (err) => {
          console.error('Error deleting client:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete client. Please try again.',
            life: 5000,
          });
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
    return this.clientForm.controls;
  }

  /** Check if field has error */
  hasError(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /** Get error message for field */
  getErrorMessage(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Phone number must be 10 digits';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  /** Get field label for error messages */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      client: 'Client name',
      ownerName: 'Owner name',
      phoneNumber: 'Phone number',
      email: 'Email',
    };
    return labels[fieldName] || fieldName;
  }

  /** Close dialog and reset form */
  closeDialog() {
    this.visible = false;
    this.clientForm.reset();
    this.submitting = false;
  }
}