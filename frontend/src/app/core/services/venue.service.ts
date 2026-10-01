import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VenueDTO {
  id?: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string;
  totalSeats?: number;
}

export interface SeatDTO {
  id: number;
  rowNumber: string;
  seatNumber: number;
  seatType: string;
  price: number;
  venueId: number;
  seatLabel: string;
  booked: boolean;
}

export interface SeatConfigRequest {
  startRow: string;
  endRow: string;
  seatsPerRow: number;
  seatType: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class VenueService {
  private apiUrl = 'http://localhost:8080/api/venues';

  constructor(private http: HttpClient) {}

  getAll(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<VenueDTO> {
    return this.http.get<VenueDTO>(`${this.apiUrl}/${id}`);
  }

  create(venue: VenueDTO): Observable<VenueDTO> {
    return this.http.post<VenueDTO>(this.apiUrl, venue);
  }

  update(id: number, venue: VenueDTO): Observable<VenueDTO> {
    return this.http.put<VenueDTO>(`${this.apiUrl}/${id}`, venue);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSeats(venueId: number, eventId?: number): Observable<SeatDTO[]> {
    let url = `${this.apiUrl}/${venueId}/seats`;
    if (eventId) url += `?eventId=${eventId}`;
    return this.http.get<SeatDTO[]>(url);
  }

  configureSeats(venueId: number, config: SeatConfigRequest): Observable<SeatDTO[]> {
    return this.http.post<SeatDTO[]>(`${this.apiUrl}/${venueId}/seats`, config);
  }

  deleteAllSeats(venueId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${venueId}/seats`);
  }
}
