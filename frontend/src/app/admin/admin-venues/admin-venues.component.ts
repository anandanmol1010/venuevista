import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService, VenueDTO, SeatDTO, SeatConfigRequest } from '../../core/services/venue.service';

@Component({
  selector: 'app-admin-venues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Manage Venues</h2>
        <button class="btn btn-primary" (click)="openVenueForm()">+ Add Venue</button>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

      <!-- Venue Form Modal -->
      <div class="modal-overlay" *ngIf="showVenueForm" (click)="showVenueForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editingVenue ? 'Edit Venue' : 'Add Venue' }}</h3>
          <form (ngSubmit)="saveVenue()">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="venueForm.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" [(ngModel)]="venueForm.address" name="address" required>
            </div>
            <div class="form-group">
              <label>City</label>
              <input type="text" [(ngModel)]="venueForm.city" name="city" required>
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input type="number" [(ngModel)]="venueForm.capacity" name="capacity" required min="1">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="venueForm.description" name="description"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showVenueForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Seat Config Modal -->
      <div class="modal-overlay" *ngIf="showSeatForm" (click)="showSeatForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Configure Seats - {{ selectedVenueName }}</h3>

          <div *ngIf="venueSeats.length > 0" style="margin-bottom:14px;">
            <p style="font-size:13px; color:#5f6368;">Current seats: {{ venueSeats.length }}</p>
            <button class="btn btn-sm btn-danger" (click)="deleteAllSeats()" style="margin-top:6px;">Delete All Seats</button>
          </div>

          <h4 style="font-size:14px; margin-bottom:8px;">Add Seats</h4>
          <form (ngSubmit)="addSeats()">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <div class="form-group" style="flex:1; min-width:80px;">
                <label>Start Row</label>
                <input type="text" [(ngModel)]="seatForm.startRow" name="startRow" placeholder="A" maxlength="1" required>
              </div>
              <div class="form-group" style="flex:1; min-width:80px;">
                <label>End Row</label>
                <input type="text" [(ngModel)]="seatForm.endRow" name="endRow" placeholder="D" maxlength="1" required>
              </div>
              <div class="form-group" style="flex:1; min-width:80px;">
                <label>Seats/Row</label>
                <input type="number" [(ngModel)]="seatForm.seatsPerRow" name="seatsPerRow" min="1" required>
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <div class="form-group" style="flex:1;">
                <label>Type</label>
                <select [(ngModel)]="seatForm.seatType" name="seatType">
                  <option value="REGULAR">Regular</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div class="form-group" style="flex:1;">
                <label>Price (₹)</label>
                <input type="number" [(ngModel)]="seatForm.price" name="price" min="1" required>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showSeatForm = false">Close</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">Add Seats</button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <table *ngIf="!loading && venues.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Capacity</th>
            <th>Seats</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of venues">
            <td>{{ v.name }}</td>
            <td>{{ v.city }}</td>
            <td>{{ v.capacity }}</td>
            <td>{{ v.totalSeats }}</td>
            <td>
              <button class="btn btn-sm btn-secondary" (click)="openSeatConfig(v)" style="margin-right:4px;">Seats</button>
              <button class="btn btn-sm btn-secondary" (click)="editVenue(v)" style="margin-right:4px;">Edit</button>
              <button class="btn btn-sm btn-danger" (click)="deleteVenue(v)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && venues.length === 0" class="empty">No venues created yet.</div>
    </div>
  `
})
export class AdminVenuesComponent implements OnInit {
  venues: VenueDTO[] = [];
  loading = true;
  showVenueForm = false;
  showSeatForm = false;
  editingVenue = false;
  editVenueId = 0;
  saving = false;
  error = '';
  successMsg = '';
  selectedVenueId = 0;
  selectedVenueName = '';
  venueSeats: SeatDTO[] = [];

  venueForm: VenueDTO = { name: '', address: '', city: '', capacity: 0, description: '' };
  seatForm: SeatConfigRequest = { startRow: '', endRow: '', seatsPerRow: 6, seatType: 'REGULAR', price: 500 };

  constructor(private venueService: VenueService) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.venueService.getAll().subscribe({
      next: (data) => { this.venues = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openVenueForm(): void {
    this.venueForm = { name: '', address: '', city: '', capacity: 0, description: '' };
    this.editingVenue = false;
    this.showVenueForm = true;
    this.error = '';
  }

  editVenue(v: VenueDTO): void {
    this.venueForm = { ...v };
    this.editingVenue = true;
    this.editVenueId = v.id!;
    this.showVenueForm = true;
    this.error = '';
  }

  saveVenue(): void {
    this.saving = true;
    this.error = '';
    this.successMsg = '';
    const obs = this.editingVenue
      ? this.venueService.update(this.editVenueId, this.venueForm)
      : this.venueService.create(this.venueForm);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showVenueForm = false;
        this.successMsg = this.editingVenue ? 'Venue updated' : 'Venue created';
        this.loadVenues();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to save venue';
      }
    });
  }

  deleteVenue(v: VenueDTO): void {
    if (!confirm('Delete venue "' + v.name + '"?')) return;
    this.venueService.delete(v.id!).subscribe({
      next: () => { this.successMsg = 'Venue deleted'; this.loadVenues(); },
      error: (err) => { this.error = err.error?.message || 'Failed to delete'; }
    });
  }

  openSeatConfig(v: VenueDTO): void {
    this.selectedVenueId = v.id!;
    this.selectedVenueName = v.name;
    this.seatForm = { startRow: '', endRow: '', seatsPerRow: 6, seatType: 'REGULAR', price: 500 };
    this.showSeatForm = true;
    this.error = '';
    this.venueService.getSeats(v.id!).subscribe({
      next: (seats) => { this.venueSeats = seats; }
    });
  }

  addSeats(): void {
    this.saving = true;
    this.error = '';
    this.venueService.configureSeats(this.selectedVenueId, this.seatForm).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Seats added';
        this.venueService.getSeats(this.selectedVenueId).subscribe({
          next: (seats) => { this.venueSeats = seats; }
        });
        this.loadVenues();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to add seats';
      }
    });
  }

  deleteAllSeats(): void {
    if (!confirm('Delete all seats for this venue?')) return;
    this.venueService.deleteAllSeats(this.selectedVenueId).subscribe({
      next: () => {
        this.venueSeats = [];
        this.successMsg = 'All seats deleted';
        this.loadVenues();
      },
      error: (err) => { this.error = err.error?.message || 'Failed to delete seats'; }
    });
  }
}
