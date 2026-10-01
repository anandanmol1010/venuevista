import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, EventDTO } from '../../core/services/event.service';
import { VenueService, VenueDTO } from '../../core/services/venue.service';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Manage Events</h2>
        <button class="btn btn-primary" (click)="openForm()">+ Add Event</button>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

      <!-- Event Form Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editing ? 'Edit Event' : 'Add Event' }}</h3>
          <form (ngSubmit)="saveEvent()">
            <div class="form-group">
              <label>Title</label>
              <input type="text" [(ngModel)]="form.title" name="title" required>
            </div>
            <div class="form-group">
              <label>Category</label>
              <input type="text" [(ngModel)]="form.category" name="category" placeholder="e.g. Technology, Music">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="form.description" name="description"></textarea>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="form.eventDate" name="eventDate" required>
            </div>
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" [(ngModel)]="form.startTime" name="startTime">
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" [(ngModel)]="form.endTime" name="endTime">
            </div>
            <div class="form-group">
              <label>Venue</label>
              <select [(ngModel)]="form.venueId" name="venueId" required>
                <option [ngValue]="0" disabled>Select venue</option>
                <option *ngFor="let v of venues" [ngValue]="v.id">{{ v.name }} - {{ v.city }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="form.status" name="status">
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <table *ngIf="!loading && events.length > 0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Venue</th>
            <th>Available</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of events">
            <td>{{ e.title }}</td>
            <td>{{ e.category }}</td>
            <td>{{ e.eventDate }}</td>
            <td>{{ e.venueName }}</td>
            <td>{{ e.availableSeats }}/{{ e.totalSeats }}</td>
            <td>
              <span class="badge" [ngClass]="{
                'badge-green': e.status === 'UPCOMING',
                'badge-blue': e.status === 'ONGOING',
                'badge-gray': e.status === 'COMPLETED',
                'badge-red': e.status === 'CANCELLED'
              }">{{ e.status }}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-secondary" (click)="editEvent(e)" style="margin-right:4px;">Edit</button>
              <button class="btn btn-sm btn-danger" (click)="deleteEvent(e)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && events.length === 0" class="empty">No events created yet.</div>
    </div>
  `
})
export class AdminEventsComponent implements OnInit {
  events: EventDTO[] = [];
  venues: VenueDTO[] = [];
  loading = true;
  showForm = false;
  editing = false;
  editId = 0;
  saving = false;
  error = '';
  successMsg = '';

  form: EventDTO = this.emptyForm();

  constructor(private eventService: EventService, private venueService: VenueService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.venueService.getAll().subscribe({ next: (v) => this.venues = v });
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (data) => { this.events = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  emptyForm(): EventDTO {
    return { title: '', description: '', category: '', eventDate: '', startTime: '', endTime: '', venueId: 0, status: 'UPCOMING' };
  }

  openForm(): void {
    this.form = this.emptyForm();
    this.editing = false;
    this.showForm = true;
    this.error = '';
  }

  editEvent(e: EventDTO): void {
    this.form = { ...e };
    this.editing = true;
    this.editId = e.id!;
    this.showForm = true;
    this.error = '';
  }

  saveEvent(): void {
    this.saving = true;
    this.error = '';
    this.successMsg = '';
    const obs = this.editing
      ? this.eventService.update(this.editId, this.form)
      : this.eventService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.successMsg = this.editing ? 'Event updated' : 'Event created';
        this.loadEvents();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to save event';
      }
    });
  }

  deleteEvent(e: EventDTO): void {
    if (!confirm('Delete event "' + e.title + '"?')) return;
    this.eventService.delete(e.id!).subscribe({
      next: () => {
        this.successMsg = 'Event deleted';
        this.loadEvents();
      },
      error: (err) => { this.error = err.error?.message || 'Failed to delete'; }
    });
  }
}
