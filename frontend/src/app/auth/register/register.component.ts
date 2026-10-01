import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="auth-box">
        <h2>Register</h2>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Name</label>
            <input type="text" [(ngModel)]="name" name="name" required placeholder="Full name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="Email address">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="phone" name="phone" placeholder="Phone number">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Min 6 characters">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="submitting">
            {{ submitting ? 'Creating account...' : 'Register' }}
          </button>
        </form>
        <p style="margin-top:14px; font-size:14px; text-align:center;">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-box {
      max-width: 400px;
      margin: 40px auto;
      background: #fff;
      border: 1px solid #dadce0;
      border-radius: 6px;
      padding: 28px;
    }
    .auth-box h2 {
      margin-bottom: 18px;
      font-size: 20px;
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  error = '';
  submitting = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }
    this.error = '';
    this.submitting = true;
    this.auth.register({ name: this.name, email: this.email, password: this.password, phone: this.phone }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || err.error?.email || 'Registration failed';
      }
    });
  }
}
