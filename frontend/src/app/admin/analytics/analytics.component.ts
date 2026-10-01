import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, EventSalesDTO } from '../../core/services/admin.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Sales Analytics</h2>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ totalTickets }}</div>
            <div class="stat-label">Tickets Sold</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">₹{{ totalRevenue }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ sales.length }}</div>
            <div class="stat-label">Events</div>
          </div>
        </div>

        <h3 style="margin-bottom:10px;">Event-wise Sales</h3>
        <table *ngIf="sales.length > 0">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Venue</th>
              <th>Tickets Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sales">
              <td>{{ s.eventTitle }}</td>
              <td>{{ s.category }}</td>
              <td>{{ s.venueName }}</td>
              <td>{{ s.ticketsSold }}</td>
              <td>₹{{ s.revenue }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="sales.length === 0" class="empty">No sales data available.</div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  sales: EventSalesDTO[] = [];
  loading = true;
  totalTickets = 0;
  totalRevenue = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getSalesAnalytics().subscribe({
      next: (data) => {
        this.sales = data;
        this.totalTickets = data.reduce((sum, s) => sum + s.ticketsSold, 0);
        this.totalRevenue = data.reduce((sum, s) => sum + s.revenue, 0);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
