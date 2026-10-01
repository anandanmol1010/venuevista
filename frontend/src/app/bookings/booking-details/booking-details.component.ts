import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService, BookingDTO } from '../../core/services/booking.service';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <a routerLink="/my-bookings" style="font-size:14px;">&larr; Back to My Bookings</a>

      <div *ngIf="loading" class="loading">Loading booking...</div>

      <div class="ticket-card" *ngIf="booking && !loading" id="ticket">
        <div class="ticket-header">
          <h2>VenueVista</h2>
          <p>Booking Confirmation</p>
        </div>
        <div class="ticket-body">
          <div class="ticket-row">
            <span class="label">Booking ID</span>
            <span>{{ booking.bookingReference }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Event</span>
            <span>{{ booking.eventTitle }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Venue</span>
            <span>{{ booking.venueName }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Address</span>
            <span>{{ booking.venueAddress }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Date</span>
            <span>{{ booking.eventDate }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Time</span>
            <span>{{ booking.eventStartTime }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Seats</span>
            <span>{{ booking.seatLabels.join(', ') }}</span>
          </div>
          <div class="ticket-row">
            <span class="label">Total Amount</span>
            <span><strong>₹{{ booking.totalAmount }}</strong></span>
          </div>
          <div class="ticket-row">
            <span class="label">Status</span>
            <span class="badge" [ngClass]="booking.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'">
              {{ booking.status }}
            </span>
          </div>
        </div>

        <div class="ticket-actions" style="margin-top:16px; display:flex; gap:10px;">
          <button class="btn btn-primary btn-sm" (click)="printTicket()">Print Ticket</button>
          <button class="btn btn-danger btn-sm" (click)="cancelBooking()"
                  *ngIf="booking.status === 'CONFIRMED'" [disabled]="cancelling">
            {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
          </button>
        </div>
      </div>

      <div *ngIf="cancelSuccess" class="alert alert-success" style="margin-top:12px;">
        Booking cancelled successfully.
      </div>
    </div>
  `,
  styles: [`
    .ticket-card {
      max-width: 500px;
      margin: 16px 0;
      background: #fff;
      border: 1px solid #dadce0;
      border-radius: 6px;
      overflow: hidden;
    }
    .ticket-header {
      background: #f8f9fa;
      padding: 16px 20px;
      border-bottom: 1px solid #dadce0;
    }
    .ticket-header h2 { font-size: 18px; margin-bottom: 2px; }
    .ticket-header p { font-size: 13px; color: #5f6368; }
    .ticket-body { padding: 16px 20px; }
    .ticket-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f1f3f4;
      font-size: 14px;
    }
    .ticket-row:last-child { border-bottom: none; }
    .label { color: #5f6368; }
    .ticket-actions { padding: 0 20px 16px; }

    @media print {
      .ticket-actions { display: none !important; }
    }
  `]
})
export class BookingDetailsComponent implements OnInit {
  booking: BookingDTO | null = null;
  loading = true;
  cancelling = false;
  cancelSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getBookingById(id).subscribe({
      next: (data) => { this.booking = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  printTicket(): void {
    window.print();
  }

  cancelBooking(): void {
    if (!this.booking || !confirm('Are you sure you want to cancel this booking?')) return;
    this.cancelling = true;
    this.bookingService.cancelBooking(this.booking.id).subscribe({
      next: (data) => {
        this.booking = data;
        this.cancelling = false;
        this.cancelSuccess = true;
      },
      error: () => { this.cancelling = false; }
    });
  }
}
