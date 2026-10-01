import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService, BookingDTO } from '../../core/services/booking.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>My Bookings</h2>
      </div>

      <div *ngIf="loading" class="loading">Loading bookings...</div>

      <div *ngIf="!loading && bookings.length === 0" class="empty">
        No bookings yet. <a routerLink="/events">Browse events</a> to book tickets.
      </div>

      <table *ngIf="!loading && bookings.length > 0">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Event</th>
            <th>Date</th>
            <th>Seats</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let b of bookings">
            <td>{{ b.bookingReference }}</td>
            <td>{{ b.eventTitle }}</td>
            <td>{{ b.eventDate }}</td>
            <td>{{ b.seatLabels.join(', ') }}</td>
            <td>₹{{ b.totalAmount }}</td>
            <td>
              <span class="badge" [ngClass]="b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'">
                {{ b.status }}
              </span>
            </td>
            <td>
              <a [routerLink]="['/bookings', b.id]" class="btn btn-sm btn-secondary">View</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: BookingDTO[] = [];
  loading = true;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (data) => { this.bookings = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
