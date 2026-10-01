import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { BookingDTO } from '../../core/services/booking.service';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>All Bookings</h2>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <table *ngIf="!loading && bookings.length > 0">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User</th>
            <th>Email</th>
            <th>Event</th>
            <th>Date</th>
            <th>Seats</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let b of bookings">
            <td>{{ b.bookingReference }}</td>
            <td>{{ b.userName }}</td>
            <td>{{ b.userEmail }}</td>
            <td>{{ b.eventTitle }}</td>
            <td>{{ b.eventDate }}</td>
            <td>{{ b.seatLabels.join(', ') }}</td>
            <td>₹{{ b.totalAmount }}</td>
            <td>
              <span class="badge" [ngClass]="b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'">{{ b.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && bookings.length === 0" class="empty">No bookings found.</div>
    </div>
  `
})
export class AdminBookingsComponent implements OnInit {
  bookings: BookingDTO[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllBookings().subscribe({
      next: (data) => { this.bookings = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
