import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs/operators';
import { ClientVDM } from '../../shared/models/client.vdm';
import { ClientService } from '../../core/services/client.service';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SearchFilterPipe } from '../../shared/pipes/search-filter.pipe';
import { FloatLabel } from 'primeng/floatlabel';

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
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit {
  clients: ClientVDM[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  totalClients: number = 0;
  visible: boolean = false;
  clientForm!: FormGroup;

  editMode: boolean = false;
  selectedClientId: string | null = null;

  /** Open Add/Edit Dialog */
  showDialog(client?: ClientVDM) {
    if (client) {
      // Edit mode
      this.editMode = true;
      this.selectedClientId = client._id || null;
      this.clientForm.patchValue(client); // fill form with client data
    } else {
      // Add mode
      this.editMode = false;
      this.selectedClientId = null;
      this.clientForm.reset();
    }
    this.visible = true;
  }

  constructor(private fb: FormBuilder, private clientService: ClientService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  /** Initialize the Add/Edit Client Form */
  initForm() {
    this.clientForm = this.fb.group({
      client: ['', Validators.required],
      ownerName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /** Fetch clients from backend and map to VDM */
  loadClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: (res) => {
        this.clients = res;
        this.totalClients = this.clients.length;
        // this.clients = list.map(ClientVDM.toLocal);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.loading = false;
      },
    });
  }

  /** Add new client */
  addClient() {
    if (this.clientForm.valid) {
      const newClient = new ClientVDM(this.clientForm.value);

      this.clientService
        .createClient(newClient)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.loadClients();
            this.visible = false;
          },
          error: (err) => console.error('Error adding client:', err),
        });
    }
  }

  editClient() {
    if (this.clientForm.valid && this.selectedClientId) {
      const updatedClient = new ClientVDM(this.clientForm.value);

      this.clientService
        .updateClient(this.selectedClientId, updatedClient)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.loadClients();
            this.visible = false;
          },
          error: (err) => console.error('Error updating client:', err),
        });
    }
  }

  /** Delete client */
  deleteClient(clientId: string) {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService
        .deleteClient(clientId)
        .pipe(take(1))
        .subscribe({
          next: () => this.loadClients(),
          error: (err) => console.error('Error deleting client:', err),
        });
    }
  }
}
