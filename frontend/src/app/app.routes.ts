import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'events', loadComponent: () => import('./events/event-list/event-list.component').then(m => m.EventListComponent) },
  { path: 'events/:id', loadComponent: () => import('./events/event-details/event-details.component').then(m => m.EventDetailsComponent) },
  { path: 'events/:id/book', loadComponent: () => import('./events/event-booking/event-booking.component').then(m => m.EventBookingComponent), canActivate: [authGuard] },
  { path: 'my-bookings', loadComponent: () => import('./bookings/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent), canActivate: [authGuard] },
  { path: 'bookings/:id', loadComponent: () => import('./bookings/booking-details/booking-details.component').then(m => m.BookingDetailsComponent), canActivate: [authGuard] },
  { path: 'admin/dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [adminGuard] },
  { path: 'admin/events', loadComponent: () => import('./admin/admin-events/admin-events.component').then(m => m.AdminEventsComponent), canActivate: [adminGuard] },
  { path: 'admin/venues', loadComponent: () => import('./admin/admin-venues/admin-venues.component').then(m => m.AdminVenuesComponent), canActivate: [adminGuard] },
  { path: 'admin/bookings', loadComponent: () => import('./admin/admin-bookings/admin-bookings.component').then(m => m.AdminBookingsComponent), canActivate: [adminGuard] },
  { path: 'admin/analytics', loadComponent: () => import('./admin/analytics/analytics.component').then(m => m.AnalyticsComponent), canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
