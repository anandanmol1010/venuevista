import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingDTO } from './booking.service';

export interface DashboardDTO {
  totalEvents: number;
  totalVenues: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: BookingDTO[];
}

export interface EventSalesDTO {
  eventId: number;
  eventTitle: string;
  category: string;
  venueName: string;
  ticketsSold: number;
  revenue: number;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(`${this.apiUrl}/dashboard`);
  }

  getSalesAnalytics(): Observable<EventSalesDTO[]> {
    return this.http.get<EventSalesDTO[]>(`${this.apiUrl}/analytics/sales`);
  }

  getAllBookings(): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.apiUrl}/bookings`);
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users`);
  }
}
