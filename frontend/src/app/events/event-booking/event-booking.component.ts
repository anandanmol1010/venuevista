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
      display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; flex-wrap: wrap; font-weight: 500; color: var(--color-foreground);
    }
    .legend span { display: flex; align-items: center; gap: 6px; }
    .seat-box {
      display: inline-block; width: 18px; height: 18px; border-radius: 4px;
      border: 1px solid var(--color-border);
    }
    .seat-box.available { background: var(--color-card); }
    .seat-box.selected { background: var(--color-primary); border-color: var(--color-primary); }
    .seat-box.booked { background: var(--color-muted); }
    .seat-box.vip { background: #fef3c7; border-color: #f59e0b; }
    .seat-box.premium { background: #dbeafe; border-color: #3b82f6; }

    .screen {
      text-align: center; background: var(--color-muted); padding: 12px; border-radius: 8px;
      font-size: 11px; color: var(--color-muted-foreground); margin-bottom: 24px; letter-spacing: 4px; font-weight: 700; border: 1px solid var(--color-border);
    }
    .seat-layout { margin-bottom: 32px; background: var(--color-card); padding: 24px; border-radius: 8px; border: 1px solid var(--color-border); overflow-x: auto; }
    .seat-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px; justify-content: center; min-width: max-content;
    }
    .row-label {
      width: 24px; font-size: 12px; font-weight: 700; color: var(--color-muted-foreground); text-align: right; margin-right: 8px;
    }
    .seat-btn {
      width: 36px; height: 36px; border: 1px solid var(--color-border); border-radius: 6px;
      background: var(--color-card); cursor: pointer; font-size: 11px; font-weight: 600; color: var(--color-foreground);
      transition: all 0.15s ease;
    }
    .seat-btn:hover:not(.booked) { border-color: var(--color-primary); }
    .seat-btn.booked { background: var(--color-muted); color: var(--color-muted-foreground); cursor: not-allowed; opacity: 0.6; }
    .seat-btn.selected { background: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); }
    .seat-btn.vip { background: #fef3c7; border-color: #f59e0b; }
    .seat-btn.premium { background: #dbeafe; border-color: #3b82f6; }

    .summary { margin-top: 24px; max-width: 500px; }
    .summary h3 { margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px; }
    .summary p { font-size: 14px; margin: 8px 0; color: var(--color-muted-foreground); }
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
