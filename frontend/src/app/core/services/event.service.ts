import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventDTO {
  id?: number;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueId: number;
  venueName?: string;
  venueCity?: string;
  venueAddress?: string;
  status: string;
  imageUrl?: string;
  availableSeats?: number;
  totalSeats?: number;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EventDTO[]> {
    return this.http.get<EventDTO[]>(this.apiUrl);
  }

  search(title?: string, category?: string, city?: string): Observable<EventDTO[]> {
    let params = new HttpParams();
    if (title) params = params.set('title', title);
    if (category) params = params.set('category', category);
    if (city) params = params.set('city', city);
    return this.http.get<EventDTO[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<EventDTO> {
    return this.http.get<EventDTO>(`${this.apiUrl}/${id}`);
  }

  create(event: EventDTO): Observable<EventDTO> {
    return this.http.post<EventDTO>(this.apiUrl, event);
  }

  update(id: number, event: EventDTO): Observable<EventDTO> {
    return this.http.put<EventDTO>(`${this.apiUrl}/${id}`, event);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
