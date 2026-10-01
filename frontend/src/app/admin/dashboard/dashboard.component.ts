import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardDTO } from '../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h2 style="margin-bottom:16px;">Admin Dashboard</h2>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="dashboard && !loading">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.totalEvents }}</div>
            <div class="stat-label">Total Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.totalVenues }}</div>
            <div class="stat-label">Total Venues</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.totalBookings }}</div>
            <div class="stat-label">Total Bookings</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">₹{{ dashboard.totalRevenue }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>

        <h3 style="margin-bottom:10px;">Recent Bookings</h3>
        <table *ngIf="dashboard.recentBookings.length > 0">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Event</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of dashboard.recentBookings">
              <td>{{ b.bookingReference }}</td>
              <td>{{ b.userName }}</td>
              <td>{{ b.eventTitle }}</td>
              <td>{{ b.seatLabels.join(', ') }}</td>
              <td>₹{{ b.totalAmount }}</td>
              <td>
                <span class="badge" [ngClass]="b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'">{{ b.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="dashboard.recentBookings.length === 0" class="empty">No bookings yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 8px;
      line-height: 1;
    }
    .stat-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardDTO | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: (data) => { this.dashboard = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
