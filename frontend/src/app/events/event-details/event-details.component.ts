import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService, EventDTO } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div *ngIf="loading" class="loading">Loading event...</div>

      <div *ngIf="event && !loading">
        <a routerLink="/events" style="font-size:14px;">&larr; Back to Events</a>

        <div class="card" style="margin-top:12px;">
          <h2>{{ event.title }}</h2>
          <span class="badge" [ngClass]="event.status === 'UPCOMING' ? 'badge-green' : 'badge-gray'">{{ event.status }}</span>
          <span class="badge badge-blue" style="margin-left:6px;">{{ event.category }}</span>

          <div class="details-grid">
            <div class="detail-item">
              <strong>Date</strong>
              <span>{{ event.eventDate }}</span>
            </div>
            <div class="detail-item">
              <strong>Time</strong>
              <span>{{ event.startTime }} - {{ event.endTime }}</span>
            </div>
            <div class="detail-item">
              <strong>Venue</strong>
              <span>{{ event.venueName }}</span>
            </div>
            <div class="detail-item">
              <strong>Address</strong>
              <span>{{ event.venueAddress }}, {{ event.venueCity }}</span>
            </div>
            <div class="detail-item">
              <strong>Available Seats</strong>
              <span>{{ event.availableSeats }} / {{ event.totalSeats }}</span>
            </div>
          </div>

          <div *ngIf="event.description" style="margin-top:14px;">
            <strong>Description</strong>
            <p style="margin-top:4px; color:#5f6368; font-size:14px;">{{ event.description }}</p>
          </div>

          <div style="margin-top:18px;">
            <a *ngIf="auth.isLoggedIn() && event.status === 'UPCOMING' && event.availableSeats! > 0"
               [routerLink]="['/events', event.id, 'book']"
               class="btn btn-primary">Book Tickets</a>
            <a *ngIf="!auth.isLoggedIn()"
               routerLink="/login"
               class="btn btn-primary">Login to Book</a>
            <span *ngIf="event.availableSeats === 0" style="color:#d93025; font-weight:500;">Sold Out</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 16px;
    }
    .detail-item {
      font-size: 14px;
    }
    .detail-item strong {
      display: block;
      color: #5f6368;
      font-size: 12px;
      margin-bottom: 2px;
    }
    @media (max-width: 500px) {
      .details-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class EventDetailsComponent implements OnInit {
  event: EventDTO | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getById(id).subscribe({
      next: (data) => { this.event = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
