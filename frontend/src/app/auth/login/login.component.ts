import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="auth-box">
        <h2>Login</h2>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="Enter your email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Enter your password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="submitting">
            {{ submitting ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <p style="margin-top:14px; font-size:14px; text-align:center;">
          Don't have an account? <a routerLink="/register">Register</a>
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
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  submitting = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.submitting = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/events']);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Invalid email or password';
      }
    });
  }
}
