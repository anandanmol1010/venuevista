import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingDTO {
  id: number;
  bookingReference: string;
  eventTitle: string;
  eventId: number;
  eventDate: string;
  eventStartTime: string;
  venueName: string;
  venueAddress: string;
  seatLabels: string[];
  totalAmount: number;
  status: string;
  bookingDate: string;
  userName: string;
  userEmail: string;
}

export interface BookingRequest {
  eventId: number;
  seatIds: number[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(request: BookingRequest): Observable<BookingDTO> {
    return this.http.post<BookingDTO>(this.apiUrl, request);
  }

  getMyBookings(): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.apiUrl}/my`);
  }

  getBookingById(id: number): Observable<BookingDTO> {
    return this.http.get<BookingDTO>(`${this.apiUrl}/${id}`);
  }

  cancelBooking(id: number): Observable<BookingDTO> {
    return this.http.put<BookingDTO>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
