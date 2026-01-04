import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { Reservation } from '../models/reservation';



@Component({
  selector: 'app-turista-rezervacije',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turista-rezervacije.component.html',
  styleUrl: './turista-rezervacije.component.css'
})
export class TuristaRezervacijeComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  allReservations: Reservation[] = [];
  currentReservations: Reservation[] = [];
  previousReservations: Reservation[] = [];

  showRatingModal: boolean = false;
  selectedReservation: Reservation | null = null;
  ratingData = {
    rating: 0,
    comment: ''
  };

  isLoading: boolean = true;
  message: string = '';

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.isLoading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.allReservations = reservations;
        this.sortReservations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Greška pri učitavanju rezervacija:', error);
        this.message = 'Došlo je do greške pri učitavanju rezervacija';
        this.isLoading = false;
      }
    });
  }

  sortReservations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.currentReservations = this.allReservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      return (reservation.status == 'confirmed' || reservation.status == 'pending') && startDate >= today;
    });

    this.previousReservations = this.allReservations.filter(reservation => {
      const endDate = new Date(reservation.endDate);
      return (reservation.status == 'completed' || reservation.status == 'cancelled' || reservation.status == 'rejected') || endDate < today;
    }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }

  canCancelReservation(reservation: Reservation): boolean {
    const startDate = new Date(reservation.startDate);
    const today = new Date();
    const timeDiff = startDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return dayDiff >= 1 && (reservation.status == 'confirmed' || reservation.status == 'pending');
  }

  cancelReservation(reservation: Reservation) {
    if (!this.canCancelReservation(reservation)) {
      this.message = 'Ne možete otkazati rezervaciju manje od 1 dan pre početka';
      return;
    }

    if (!confirm('Da li ste sigurni da želite da otkažete ovu rezervaciju?')) {
      return;
    }

    this.reservationService.cancelReservation(reservation._id).subscribe({
      next: () => {
        this.message = 'Rezervacija je uspešno otkazana';
        this.loadReservations();
      },
      error: (error) => {
        this.message = 'Došlo je do greške pri otkazivanju rezervacije';
        console.error('Greška pri otkazivanju:', error);
      }
    });
  }

  openRatingForm(reservation: Reservation) {
    if (!this.canRate(reservation)) {
      this.message = 'Možete ostaviti komentar i ocenu samo za ostvarene rezervacije';
      return;
    }

    this.selectedReservation = reservation;
    this.ratingData = {
      rating: reservation.rating || 0,
      comment: reservation.comment || ''
    };
    this.showRatingModal = true;
    this.message = '';
  }

  canRate(reservation: Reservation): boolean {
    const endDate = new Date(reservation.endDate);
    const today = new Date();
    return endDate < today && reservation.status == 'completed' && !reservation.rating;
  }

  putRating(star: number) {
    this.ratingData.rating = star;
  }

  confirmCommentAndRating() {
    if (!this.selectedReservation || this.ratingData.rating == 0) {
      this.message = 'Molimo izaberite ocenu (1-5 zvezdica)';
      return;
    }

    this.reservationService.addRatingAndComment(
      this.selectedReservation._id,
      this.ratingData.rating,
      this.ratingData.comment
    ).subscribe({
      next: () => {
        this.message = 'Komentar i ocena su uspešno sačuvani';
        this.closeRatingForm();
        this.loadReservations();
      },
      error: (error) => {
        this.message = 'Došlo je do greške pri čuvanju komentara i ocene';
        console.error('Greška pri čuvanju komentara:', error);
      }
    });
  }

  closeRatingForm() {
    this.showRatingModal = false;
    this.selectedReservation = null;
    this.ratingData = { rating: 0, comment: '' };
  }

  formDate(date: Date): string {
    return new Date(date).toLocaleDateString('sr-RS');
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': '🟡 Na čekanju',
      'confirmed': '🟢 Potvrđena',
      'rejected': '🔴 Odbijena',
      'completed': '✅ Ostvarena',
      'cancelled': '❌ Otkazana'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': '#ffc107',
      'confirmed': '#28a745',
      'rejected': '#dc3545',
      'completed': '#17a2b8',
      'cancelled': '#6c757d'
    };
    return colorMap[status] || '#6c757d';
  }

  showStars(rating: number = 0): string {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return fullStars + emptyStars;
  }

}