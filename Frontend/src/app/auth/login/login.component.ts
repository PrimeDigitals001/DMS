// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  login() {
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Form',
        detail: 'Please correct the errors in the form.',
      });
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    // Call the auth service
    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: `Welcome back, ${response.data.ownerName}!`,
          });

          // Navigate based on user role
          const role = this.authService.getRole();
          if (role === 'super-admin') {
            this.router.navigate(['/clients']); // Super admin can access everything
          } else if (role === 'admin') {
            this.router.navigate(['/items']); // Admin can access items and customers
          } else {
            this.router.navigate(['/']); // Staff can only access home/cart
          }
        } else {
          this.errorMessage = response.message || 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Invalid username or password.',
        });
      }
    });
  }
}