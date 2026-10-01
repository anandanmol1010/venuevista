import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService, EventDTO } from '../../core/services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Events</h2>
      </div>

      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTitle" placeholder="Search by name..." (keyup.enter)="onSearch()">
        <input type="text" [(ngModel)]="searchCategory" placeholder="Category...">
        <input type="text" [(ngModel)]="searchCity" placeholder="City...">
        <button class="btn btn-primary btn-sm" (click)="onSearch()">Search</button>
        <button class="btn btn-secondary btn-sm" (click)="clearSearch()">Clear</button>
      </div>

      <div *ngIf="loading" class="loading">Loading events...</div>

      <div class="grid-3" *ngIf="!loading">
        <div class="card" *ngFor="let event of events">
          <h3>{{ event.title }}</h3>
          <p class="meta">{{ event.eventDate }} &middot; {{ event.startTime }}</p>
          <p class="meta">{{ event.venueName }}, {{ event.venueCity }}</p>
          <div class="tags">
            <span class="badge badge-blue">{{ event.category }}</span>
            <span class="badge" [ngClass]="event.status === 'UPCOMING' ? 'badge-green' : 'badge-gray'">{{ event.status }}</span>
          </div>
          <p class="seats-info">{{ event.availableSeats }}/{{ event.totalSeats }} seats available</p>
          <a [routerLink]="['/events', event.id]" class="btn btn-primary btn-sm" style="margin-top:8px;">View Details</a>
        </div>
      </div>

      <div *ngIf="!loading && events.length === 0" class="empty">No events found.</div>
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .search-bar input {
      padding: 7px 12px;
      border: 1px solid #dadce0;
      border-radius: 4px;
      font-size: 14px;
      width: 180px;
    }
    .card h3 { font-size: 16px; }
    .meta { color: #5f6368; font-size: 13px; margin: 3px 0; }
    .tags { display: flex; gap: 6px; margin: 6px 0; }
    .seats-info { font-size: 13px; color: #5f6368; }
  `]
})
export class EventListComponent implements OnInit {
  events: EventDTO[] = [];
  loading = true;
  searchTitle = '';
  searchCategory = '';
  searchCity = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (data) => { this.events = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    this.loading = true;
    this.eventService.search(
      this.searchTitle || undefined,
      this.searchCategory || undefined,
      this.searchCity || undefined
    ).subscribe({
      next: (data) => { this.events = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  clearSearch(): void {
    this.searchTitle = '';
    this.searchCategory = '';
    this.searchCity = '';
    this.loadEvents();
  }
}
