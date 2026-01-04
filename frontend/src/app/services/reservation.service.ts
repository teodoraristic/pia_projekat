import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(){}
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/reservations';

  getMyReservations(): Observable<Reservation[]> {
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${currentUser._id}`);
  }

  getOwnerReservations(ownerId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  createReservation(reservationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, reservationData);
  }

  cancelReservation(reservationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/cancel`, {});
  }

  addRatingAndComment(reservationId: string, rating: number, comment: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/rating`, {
      rating,
      comment
    });
  }

  updateReservationStatus(reservationId: string, status: string, ownerComment?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/status`, {
      status,
      ownerComment
    });
  }

  getReservationsByCabin(cabinId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/cabin/${cabinId}`);
  }
}