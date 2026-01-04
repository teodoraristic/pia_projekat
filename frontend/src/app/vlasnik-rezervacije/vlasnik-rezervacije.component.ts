import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Reservation } from '../models/reservation';
import { ReservationService } from '../services/reservation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-vlasnik-rezervacije',
  standalone: true,
  imports: [FormsModule, CommonModule, FullCalendarModule],
  templateUrl: './vlasnik-rezervacije.component.html',
  styleUrl: './vlasnik-rezervacije.component.css'
})
export class VlasnikRezervacijeComponent implements OnInit {
  private reservationService = inject(ReservationService);

  reservations: Reservation[] = [];
  pendingReservations: Reservation[] = [];
  isLoading: boolean = false;
  message: string = '';
  modalMessage: string = '';
  
  selectedReservation: Reservation | null = null;
  ownerComment: string = '';
  showCalendar: boolean = false;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    locale: 'sr',
    buttonText: {
      today: 'Danas',
      month: 'Mesec',
      week: 'Nedelja'
    }
  };
  showEventModal: boolean = false;
  showRejectionModal: boolean = false;;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    const userData = localStorage.getItem('loggedInUser');
    const currentUser = userData ? JSON.parse(userData) : null;
  
  if (!currentUser || !currentUser._id) {
    this.message = 'Korisnik nije pronađen';
    this.isLoading = false;
    return;
  }
    
    if (!currentUser || !currentUser._id) {
      this.message = 'Korisnik nije pronađen';
      this.isLoading = false;
      return;
    }

    this.reservationService.getOwnerReservations(currentUser._id).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.pendingReservations = reservations
          .filter(res => res.status === 'pending')
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        this.updateCalendarEvents();
        this.isLoading = false;
      },
      error: (error) => {
        this.message = 'Greška pri učitavanju rezervacija: ' + error.message;
        this.isLoading = false;
        console.error('Greška:', error);
      }
    });
  }

  updateCalendarEvents(): void {
    this.calendarOptions.events = this.reservations.filter(res => res.status == 'pending' || res.status == 'confirmed')
        .map(reservation => ({
        id: reservation._id,
        title: `${this.getCabinName(reservation)} - ${this.getTouristName(reservation)}`,
        start: reservation.startDate,
        end: reservation.endDate,
        backgroundColor: this.getEventColor(reservation.status),
        borderColor: this.getEventColor(reservation.status),
        textColor: '#ffffff',
        extendedProps: {
          reservation: reservation
        }
      }));
  }

  getEventColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': '#ffc107', 
      'confirmed': '#28a745',
      'rejected': '#dc3545',
      'completed': '#17a2b8',
      'cancelled': '#6c757d'
    };
    return colorMap[status] || '#6c757d';
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const reservation = clickInfo.event.extendedProps['reservation'];
    this.selectedReservation = reservation;
    this.showEventModal = true;
    this.ownerComment = '';
}

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  confirmReservation(reservation: Reservation): void {
    this.isLoading = true;

    this.reservationService.updateReservationStatus(reservation._id, 'confirmed').subscribe({
      next: (response) => {
        this.modalMessage = 'Rezervacija je uspešno potvrđena';
        this.loadReservations();
      },
      error: (error) => {
        this.modalMessage = 'Greška pri potvrdi rezervacije: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  rejectReservation(reservation: Reservation): void {
  this.selectedReservation = reservation;
  this.ownerComment = '';

  this.showRejectionModal = true;
  }

  confirmRejection(): void {
    if (!this.selectedReservation || !this.ownerComment.trim()) {
      this.modalMessage = 'Molimo unesite razlog odbijanja';
      return;
    }

    this.isLoading = true;
    
    this.reservationService.updateReservationStatus(
      this.selectedReservation._id, 
      'rejected', 
      this.ownerComment
    ).subscribe({
      next: (response) => {
        this.message = 'Rezervacija je uspešno odbijena';
        this.selectedReservation = null;
        this.ownerComment = '';
        this.showRejectionModal = false;
        this.loadReservations();
      },
      error: (error) => {
        this.modalMessage = 'Greška pri odbijanju rezervacije: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  cancelRejection(): void {
    this.selectedReservation = null;
    this.ownerComment = '';
    this.modalMessage = '';
    this.showRejectionModal = false;
  }

  closeModal(): void {
    this.selectedReservation = null;
    this.ownerComment = '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('sr-RS');
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Na čekanju',
      'confirmed': 'Potvrđeno',
      'rejected': 'Odbijeno',
      'completed': 'Završeno',
      'cancelled': 'Otkazano'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    return this.getEventColor(status);
  }

  getTouristName(reservation: Reservation): string {
    if (reservation.touristId && typeof reservation.touristId == 'object') {
      return `${(reservation.touristId as any).firstName} ${(reservation.touristId as any).lastName}`;
    }
    return 'Nepoznat turista';
  }

  getCabinName(reservation: Reservation): string {
    if (reservation.cabinId && typeof reservation.cabinId == 'object') {
      return (reservation.cabinId as any).name;
    }
    return 'Nepoznata vikendica';
  }

  getTotalPrice(reservation: Reservation): number {
    return reservation.totalPrice || 0;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedReservation = null;
    this.ownerComment = '';
  }

  rejectFromCalendar(): void {
    if (!this.selectedReservation) return;
    
    if (!this.ownerComment.trim()) {
      this.message = 'Molimo unesite razlog odbijanja';
      return;
    }

    this.isLoading = true;
    
    this.reservationService.updateReservationStatus(
      this.selectedReservation._id, 
      'rejected', 
      this.ownerComment
    ).subscribe({
      next: (response) => {
        this.message = 'Rezervacija je uspešno odbijena';
        this.closeEventModal();
        this.loadReservations();
      },
      error: (error) => {
        this.message = 'Greška pri odbijanju rezervacije: ' + error.message;
        this.isLoading = false;
      }
    });
  }
}