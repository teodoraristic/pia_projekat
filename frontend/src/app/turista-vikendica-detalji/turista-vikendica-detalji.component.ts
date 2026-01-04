import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabinService } from '../services/cabin.service';
import * as L from 'leaflet';
import { Cabin } from '../models/cabin';
import { ReservationService } from '../services/reservation.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

interface CabinComment {
  _id?: string;
  touristName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

@Component({
  selector: 'app-turista-vikendica-detalji',
  standalone: true,
  imports: [CommonModule, FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  templateUrl: './turista-vikendica-detalji.component.html',
  styleUrl: './turista-vikendica-detalji.component.css'
})
export class TuristaVikendicaDetaljiComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cabinService = inject(CabinService);
  private reservationService = inject(ReservationService);

  private readonly API_BASE_URL = 'http://localhost:4000';

  cabin: Cabin | null = null;
  comments: CabinComment[] = [];
  isLoading: boolean = true;
  message: string = '';
  reservationMessage: string = '';
  map: L.Map | null = null;

  showReservationForm: boolean = false;
  currentStep: number = 1;
  totalSteps: number = 2;

  reservationData = {
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0,
    creditCard: '',
    additionalRequests: '',
    totalPrice: 0,
    numberOfNights: 0
  };

  loggedInUser: any = null;

  ngOnInit() {
    this.loadLoggedInUser();
    this.route.params.subscribe(params => {
      const cabinId = params['id'];
      this.loadCabin(cabinId);
    });
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadLoggedInUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      this.loggedInUser = JSON.parse(loggedInUser);
      this.reservationData.creditCard = this.loggedInUser.creditCard || '';
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.API_BASE_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  }

  loadCabin(id: string) {
    this.isLoading = true;
    this.cabinService.getCabinById(id).subscribe({
      next: (cabin) => {
        this.cabin = cabin;
        
        if (this.cabin.images) {
          this.cabin.images = this.cabin.images.map(img => this.getImageUrl(img));
        }
        
        this.loadCommentsFromAllReservations(id);
        
        this.isLoading = false;
        setTimeout(() => {
          if (this.cabin?.coordinates) {
            this.initMap(this.cabin.coordinates.lat, this.cabin.coordinates.lng);
          }
        }, 200);
      },
      error: (error) => {
        console.error('Greška pri učitavanju vikendice:', error);
        this.message = 'Došlo je do greške pri učitavanju vikendice';
        this.isLoading = false;
      }
    });
  }

  loadCommentsFromAllReservations(cabinId: string): void {
    this.reservationService.getReservationsByCabin(cabinId).subscribe({
      next: (reservations) => {
        console.log('Sve rezervacije za vikendicu:', reservations);
        
  
        const cabinReservations = reservations.filter(
          reservation => reservation.comment && 
                        reservation.comment.trim() !== '' && 
                        reservation.rating && 
                        reservation.rating >= 1
        );
        
        console.log('Rezervacije sa komentarima i ocenama:', cabinReservations);
        
        this.comments = cabinReservations.map(reservation => {
          return {
            _id: reservation._id,
            touristName: reservation.touristName || 'Anoniman korisnik',
            rating: reservation.rating || 0,
            comment: reservation.comment || '',
            createdAt: reservation.createdAt || new Date()
          };
        });
        
        console.log('Komentari za prikaz:', this.comments);
      },
      error: (err) => {
        console.error('Greška pri učitavanju komentara:', err);
        this.comments = [];
      }
    });
  }

  initMap(lat: number, lng: number): void {
    if (this.map) {
      this.map.remove(); 
    }

    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    this.map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map)
      .bindPopup('Lokacija vikendice')
      .openPopup();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  startReservation() {
    this.showReservationForm = true;
    this.currentStep = 1;
    this.resetReservation();
    this.message = ''
    this.reservationMessage = '';
  }

  nextStep() {
    if (!this.validateStep1()) {
      return;
    }
    const startDate = new Date(this.reservationData.startDate);
    const endDate = new Date(this.reservationData.endDate);

    this.checkAvailability(startDate, endDate);
  }

  previousStep() {
    this.currentStep = 1;
    this.reservationMessage = '';
  }

  validateStep1(): boolean {
    if (!this.reservationData.startDate || !this.reservationData.endDate) {
      this.reservationMessage = 'Molimo unesite datume početka i kraja rezervacije';
      return false;
    }

    const startDate = new Date(this.reservationData.startDate);
    const endDate = new Date(this.reservationData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      this.reservationMessage = 'Datum početka ne može biti u prošlosti';
      return false;
    }

    if (endDate <= startDate) {
      this.reservationMessage = 'Datum kraja mora biti posle datuma početka';
      return false;
    }

    if (this.reservationData.adults < 1) {
      this.reservationMessage = 'Broj odraslih mora biti najmanje 1';
      return false;
    }

    if (this.reservationData.children < 0) {
      this.reservationMessage = 'Broj dece ne može biti negativan';
      return false;
    }

    const totalPeople = this.reservationData.adults + this.reservationData.children;
    if (totalPeople > 10) {
      this.reservationMessage = 'Maksimalan broj osoba je 10';
      return false;
    }

    this.reservationMessage = '';
    return true;
  }

  checkAvailability(startDate: Date, endDate: Date): void {
    if (!this.cabin) return;

    this.isLoading = true;

    this.cabinService.checkAvailability(
      this.cabin._id,
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.available) {
          this.currentStep = 2;
          this.calculatePrice();
          this.reservationMessage = '';
        } else {
          this.reservationMessage = `Vikendica nije dostupna u tom periodu. Broj konflikata: ${response.conflictingReservations}`;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.reservationMessage = error.error?.message || 'Greška pri proveri dostupnosti';
      }
    });
  }

  calculatePrice() {
    const startDate = new Date(this.reservationData.startDate);
    const endDate = new Date(this.reservationData.endDate);
    
    const razlikaMs = endDate.getTime() - startDate.getTime();
    this.reservationData.numberOfNights = Math.ceil(razlikaMs / (1000 * 60 * 60 * 24));

    const mesec = startDate.getMonth() + 1;
    const cenaPoNoci = (mesec >= 5 && mesec <= 8) ? 
      this.cabin!.priceSummer : this.cabin!.priceWinter;

    this.reservationData.totalPrice = this.reservationData.numberOfNights * cenaPoNoci;
  }

  validateCard(cardNumber: string): boolean {
    const cardNumberWithoutSpaces = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cardNumberWithoutSpaces);
  }

  confirmReservation() {
    if (!this.validateStep2()) {
      return;
    }

    if (!this.cabin || !this.loggedInUser) {
      this.reservationMessage = 'Došlo je do greške. Pokušajte ponovo.';
      return;
    }

    this.isLoading = true;
    
    const reservation = {
      cabinId: this.cabin._id,
      touristId: this.loggedInUser._id,
      startDate: this.reservationData.startDate,
      endDate: this.reservationData.endDate,
      adults: this.reservationData.adults,
      children: this.reservationData.children,
      totalPrice: this.reservationData.totalPrice,
      creditCardUsed: this.reservationData.creditCard,
      additionalRequests: this.reservationData.additionalRequests
    };

    this.reservationService.createReservation(reservation).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        this.showReservationForm = false;
        this.resetReservation();
        
        this.message = response.message || 'Rezervacija je uspešno kreirana! Očekujte potvrdu od vlasnika.';
        
        setTimeout(() => {
          this.message = '';
        }, 5000);
      },
      error: (error) => {
        this.isLoading = false;
        this.reservationMessage = error.error?.message || 'Došlo je do greške pri kreiranju rezervacije';
      }
    });
  }

  validateStep2(): boolean {
    if (!this.validateCard(this.reservationData.creditCard)) {
      this.message = 'Broj kreditne kartice nije validan (16 cifara)';
      return false;
    }

    if (this.reservationData.additionalRequests.length > 500) {
      this.message = 'Dodatni zahtevi ne smeju biti duži od 500 karaktera';
      return false;
    }

    this.message = '';
    return true;
  }

  cancelReservation() {
    this.showReservationForm = false;
    this.currentStep = 1;
    this.resetReservation();
    this.message = '';
  }

  resetReservation() {
    this.reservationData = {
      startDate: '',
      endDate: '',
      adults: 1,
      children: 0,
      creditCard: this.loggedInUser?.creditCard || '',
      additionalRequests: '',
      totalPrice: 0,
      numberOfNights: 0
    };
    this.message = '';
  }

  formatCreditCard(broj: string): string {
    if (!broj) return '';
    return broj.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  onCreditCardInput(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    this.reservationData.creditCard = value;
  }

  showStars(rating: number): string {
    const filledStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return filledStars + emptyStars;
  }

  averageRating(): number {
    if (this.comments.length == 0) return 0;
    const sum = this.comments.reduce((acc, comment) => acc + comment.rating, 0);
    return sum / this.comments.length;
  }

  backToList() {
    this.router.navigate(['/tourist/cabins']);
  }
}