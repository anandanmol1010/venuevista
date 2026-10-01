import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService, EventDTO } from '../../core/services/event.service';
import { VenueService, SeatDTO } from '../../core/services/venue.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-event-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <a [routerLink]="['/events', eventId]" style="font-size:14px;">&larr; Back to Event</a>

      <div *ngIf="loading" class="loading">Loading seats...</div>

      <div *ngIf="!loading && event">
        <h2 style="margin: 12px 0 4px;">Book Tickets - {{ event.title }}</h2>
        <p style="color:#5f6368; font-size:14px; margin-bottom:16px;">{{ event.venueName }} &middot; {{ event.eventDate }}</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">
          Booking successful! Reference: <strong>{{ bookingRef }}</strong>
          <br><a [routerLink]="['/bookings', bookingId]">View Booking Details</a>
        </div>

        <!-- Seat legend -->
        <div class="legend" *ngIf="!success">
          <span><span class="seat-box available"></span> Available</span>
          <span><span class="seat-box selected"></span> Selected</span>
          <span><span class="seat-box booked"></span> Booked</span>
          <span><span class="seat-box vip"></span> VIP</span>
          <span><span class="seat-box premium"></span> Premium</span>
        </div>

        <!-- Screen -->
        <div class="screen" *ngIf="!success">SCREEN / STAGE</div>

        <!-- Seat layout -->
        <div class="seat-layout" *ngIf="!success">
          <div *ngFor="let row of seatRows" class="seat-row">
            <span class="row-label">{{ row.label }}</span>
            <button
              *ngFor="let seat of row.seats"
              class="seat-btn"
              [ngClass]="{
                'booked': seat.booked,
                'selected': isSelected(seat),
                'vip': seat.seatType === 'VIP' && !seat.booked && !isSelected(seat),
                'premium': seat.seatType === 'PREMIUM' && !seat.booked && !isSelected(seat)
              }"
              [disabled]="seat.booked"
              (click)="toggleSeat(seat)"
              [title]="seat.seatLabel + ' - ₹' + seat.price + ' (' + seat.seatType + ')'">
              {{ seat.seatNumber }}
            </button>
          </div>
        </div>

        <!-- Booking summary -->
        <div class="summary card" *ngIf="selectedSeats.length > 0 && !success">
          <h3>Booking Summary</h3>
          <p><strong>Event:</strong> {{ event.title }}</p>
          <p><strong>Seats:</strong> {{ getSelectedSeatLabels() }}</p>
          <table>
            <thead><tr><th>Seat</th><th>Type</th><th>Price</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of selectedSeats">
                <td>{{ s.seatLabel }}</td>
                <td>{{ s.seatType }}</td>
                <td>₹{{ s.price }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td colspan="2"><strong>Total</strong></td><td><strong>₹{{ getTotal() }}</strong></td></tr>
            </tfoot>
          </table>
          <button class="btn btn-primary" style="margin-top:12px; width:100%;" (click)="confirmBooking()" [disabled]="submitting">
            {{ submitting ? 'Processing...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legend {
      display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; flex-wrap: wrap;
    }
    .legend span { display: flex; align-items: center; gap: 4px; }
    .seat-box {
      display: inline-block; width: 18px; height: 18px; border-radius: 3px;
      border: 1px solid #ccc;
    }
    .seat-box.available { background: #fff; }
    .seat-box.selected { background: #1a73e8; border-color: #1a73e8; }
    .seat-box.booked { background: #dadce0; }
    .seat-box.vip { background: #fef7e0; border-color: #f9ab00; }
    .seat-box.premium { background: #e8f0fe; border-color: #1a73e8; }

    .screen {
      text-align: center; background: #e8eaed; padding: 6px; border-radius: 4px;
      font-size: 12px; color: #5f6368; margin-bottom: 16px; letter-spacing: 2px;
    }
    .seat-layout { margin-bottom: 20px; }
    .seat-row {
      display: flex; align-items: center; gap: 6px; margin-bottom: 6px; justify-content: center;
    }
    .row-label {
      width: 20px; font-size: 13px; font-weight: 600; color: #5f6368; text-align: right;
    }
    .seat-btn {
      width: 36px; height: 32px; border: 1px solid #dadce0; border-radius: 4px;
      background: #fff; cursor: pointer; font-size: 12px; color: #333;
    }
    .seat-btn:hover:not(.booked) { border-color: #1a73e8; }
    .seat-btn.booked { background: #e8eaed; color: #999; cursor: not-allowed; }
    .seat-btn.selected { background: #1a73e8; color: #fff; border-color: #1a73e8; }
    .seat-btn.vip { background: #fef7e0; border-color: #f9ab00; }
    .seat-btn.premium { background: #e8f0fe; border-color: #a8c7fa; }

    .summary { margin-top: 16px; max-width: 450px; }
    .summary h3 { margin-bottom: 10px; font-size: 16px; }
    .summary p { font-size: 14px; margin: 4px 0; }
  `]
})
export class EventBookingComponent implements OnInit {
  eventId = 0;
  event: EventDTO | null = null;
  seats: SeatDTO[] = [];
  seatRows: { label: string; seats: SeatDTO[] }[] = [];
  selectedSeats: SeatDTO[] = [];
  loading = true;
  error = '';
  success = false;
  submitting = false;
  bookingRef = '';
  bookingId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private venueService: VenueService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.venueService.getSeats(event.venueId, this.eventId).subscribe({
          next: (seats) => {
            this.seats = seats;
            this.buildRows();
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  buildRows(): void {
    const rowMap = new Map<string, SeatDTO[]>();
    for (const seat of this.seats) {
      if (!rowMap.has(seat.rowNumber)) {
        rowMap.set(seat.rowNumber, []);
      }
      rowMap.get(seat.rowNumber)!.push(seat);
    }
    this.seatRows = Array.from(rowMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, seats]) => ({ label, seats: seats.sort((a, b) => a.seatNumber - b.seatNumber) }));
  }

  toggleSeat(seat: SeatDTO): void {
    if (seat.booked) return;
    const idx = this.selectedSeats.findIndex(s => s.id === seat.id);
    if (idx >= 0) {
      this.selectedSeats.splice(idx, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  isSelected(seat: SeatDTO): boolean {
    return this.selectedSeats.some(s => s.id === seat.id);
  }

  getTotal(): number {
    let total = 0;
    for (const s of this.selectedSeats) { total += s.price; }
    return total;
  }

  getSelectedSeatLabels(): string {
    return this.selectedSeats.map(s => s.seatLabel).join(', ');
  }

  confirmBooking(): void {
    this.error = '';
    this.submitting = true;
    const seatIds = this.selectedSeats.map(s => s.id);
    this.bookingService.createBooking({ eventId: this.eventId, seatIds }).subscribe({
      next: (booking) => {
        this.submitting = false;
        this.success = true;
        this.bookingRef = booking.bookingReference;
        this.bookingId = booking.id;
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Booking failed. Please try again.';
      }
    });
  }
}
