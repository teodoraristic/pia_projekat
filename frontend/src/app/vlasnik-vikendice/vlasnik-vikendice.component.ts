import { Component, inject, OnInit } from '@angular/core';
import { Cabin } from '../models/cabin';
import { CabinService } from '../services/cabin.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vlasnik-vikendice',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './vlasnik-vikendice.component.html',
  styleUrl: './vlasnik-vikendice.component.css'
})
export class VlasnikVikendiceComponent implements OnInit {

  private cabinService = inject(CabinService);

  cabins: Cabin[] = [];
  isLoading: boolean = false;
  message: string = '';
  
  cabinToDelete: Cabin | null = null;


  ngOnInit(): void {
    this.loadCabins();
  }

  loadCabins(): void {
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

    this.cabinService.getOwnerCabins(currentUser._id).subscribe({
      next: (cabins) => {
        this.cabins = cabins;
        this.isLoading = false;
      },
      error: (error) => {
        this.message = 'Greška pri učitavanju vikendica: ' + error.message;
        this.isLoading = false;
        console.error('Greška:', error);
      }
    });
  }

  deleteCabin(cabin: Cabin): void {
    this.cabinToDelete = cabin;
  }

  confirmDelete(): void {
    if (!this.cabinToDelete) return;

    this.isLoading = true;

    this.cabinService.deleteCabin(this.cabinToDelete._id).subscribe({
      next: (response) => {
        this.message = 'Vikendica je uspešno obrisana';
        this.cabinToDelete = null;
        this.loadCabins();
      },
      error: (error) => {
        this.message = 'Greška pri brisanju vikendice: ' + error.message;
        this.isLoading = false;
        this.cabinToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.cabinToDelete = null;
  }

  formatPrice(price: number): string {
    return price + '€';
  }

  showStars(rating: number): string {
    const fullStar = '★';
    const emptyStar = '☆';
    const maxRating = 5;
    
    let stars = '';
    for (let i = 1; i <= maxRating; i++) {
      stars += i <= rating ? fullStar : emptyStar;
    }
    return stars;
  }
}
