import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, EventDTO } from '../core/services/event.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="hero">
        <div class="hero-content">
          <span class="hero-chip">New Events Available</span>
          <h1>Experience Live Events Like Never Before</h1>
          <p>Discover, book, and manage your tickets for the best events happening around you.</p>
          <div class="hero-actions">
            <a routerLink="/events" class="btn btn-primary hero-btn">Browse All Events</a>
          </div>
        </div>
      </div>

      <h2 style="margin-bottom: 16px;">Upcoming Events</h2>

      <div *ngIf="loading" class="loading">Loading events...</div>

      <div class="grid-3" *ngIf="!loading">
        <div class="card" *ngFor="let event of events">
          <h3>{{ event.title }}</h3>
          <p class="event-meta">{{ event.eventDate }} &middot; {{ event.venueName }}</p>
          <p class="event-category">
            <span class="badge badge-blue">{{ event.category }}</span>
            <span class="badge badge-green" *ngIf="event.status === 'UPCOMING'">{{ event.status }}</span>
          </p>
          <p class="event-seats">{{ event.availableSeats }} seats available</p>
          <a [routerLink]="['/events', event.id]" class="btn btn-primary btn-sm" style="margin-top: 10px;">View Event</a>
        </div>
      </div>

      <div *ngIf="!loading && events.length === 0" class="empty">No upcoming events found.</div>
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 80px 20px;
      margin-bottom: 48px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }
    .hero-content {
      max-width: 600px;
      margin: 0 auto;
    }
    .hero-chip {
      display: inline-block;
      background: var(--color-secondary);
      color: var(--color-primary);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 24px;
      border: 1px solid var(--color-border);
    }
    .hero h1 {
      font-size: 48px;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 20px;
    }
    .hero p {
      color: var(--color-muted-foreground);
      margin-bottom: 32px;
      font-size: 18px;
    }
    .hero-btn {
      padding: 12px 28px;
      font-size: 16px;
    }
    .event-meta {
      color: #5f6368;
      font-size: 14px;
      margin: 6px 0;
    }
    .event-category {
      display: flex;
      gap: 6px;
      margin: 6px 0;
    }
    .event-seats {
      font-size: 13px;
      color: #5f6368;
    }
    .card h3 {
      font-size: 16px;
      margin-bottom: 2px;
    }
  `]
})
export class HomeComponent implements OnInit {
  events: EventDTO[] = [];
  loading = true;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data.filter(e => e.status === 'UPCOMING').slice(0, 6);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
