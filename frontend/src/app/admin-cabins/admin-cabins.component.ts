import { Component, inject, OnInit } from '@angular/core';
import { CabinService } from '../services/cabin.service';
import { Cabin } from '../models/cabin';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-cabins',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-cabins.component.html',
  styleUrl: './admin-cabins.component.css'
})
export class AdminCabinsComponent implements OnInit {

  private cabinService = inject(CabinService);

  cabins: Cabin[] = [];
  filteredCabins: Cabin[] = [];
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  
  searchTerm: string = '';
  cabinToBlock: Cabin | null = null;

  ngOnInit(): void {
    this.loadCabins();
  }

  loadCabins(): void {
    this.isLoading = true;
    this.cabinService.getAllCabins().subscribe({
      next: (cabins) => {
        this.cabins = cabins;
        this.filteredCabins = cabins;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Greška pri učitavanju vikendica: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  search(): void {
    this.filteredCabins = this.cabins.filter(cabin => {
      return this.searchTerm ? 
        cabin.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cabin.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (cabin.ownerId && 
         (cabin.ownerId.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          cabin.ownerId.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()))) : true;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filteredCabins = this.cabins;
  }

  shouldHighlightCabin(cabin: Cabin): boolean {
    if (!cabin.lastThreeRatings || cabin.lastThreeRatings.length < 3) {
      return false;
    }
    
    const ratings = cabin.lastThreeRatings
      .map(item => item.rating)
      .filter((r): r is number => r !== null && r !== undefined);
    
    if (ratings.length < 3) return false;
    
    const average = ratings.reduce((sum, r) => sum + r, 0) / 3;
    return average < 2;
}

  getLastThreeRatingsAverage(cabin: Cabin): number {
    if (!cabin.lastThreeRatings || cabin.lastThreeRatings.length < 3) {
      return 0;
    }

    const lastThreeRatings = cabin.lastThreeRatings.slice(-3);
    const average = lastThreeRatings.reduce((sum, rating) => sum + rating.rating, 0) / 3;

    return Number(average.toFixed(1));
  }
    
  getAverageRating(cabin: Cabin): number {
    return cabin.averageRating || 0;
  }

  getTotalReviews(cabin: Cabin): number {
    return cabin.totalReviews || 0;
  }

  blockCabin(cabin: Cabin): void {
    this.cabinToBlock = cabin;
  }

  confirmBlock(): void {
    if (!this.cabinToBlock?._id) {
      this.showMessage('Vikendica nema validan ID', 'error');
      return;
    }

    this.isLoading = true;
    this.cabinService.blockCabin(this.cabinToBlock._id).subscribe({
      next: () => {
        this.showMessage('Vikendica uspešno blokirana na 48 sati', 'success');
        this.cabinToBlock = null;
        this.loadCabins();
      },
      error: (error) => {
        this.showMessage('Greška pri blokiranju vikendice: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  cancelAction(): void {
    this.cabinToBlock = null;
  }

  isCabinBlocked(cabin: Cabin): boolean {
    if (!cabin.blockedUntil) return false;
    return new Date(cabin.blockedUntil) > new Date();
  }

  getBlockedTimeLeft(cabin: Cabin): string {
    if (!cabin.blockedUntil) return '';
    
    const now = new Date();
    const blockedUntil = new Date(cabin.blockedUntil);
    const diffMs = blockedUntil.getTime() - now.getTime();
    
    if (diffMs <= 0) return '';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  getRatingDisplay(cabin: Cabin): string {
    if (!cabin.averageRating) {
      return 'Nema ocena';
    }
    return cabin.averageRating.toFixed(1);
  }

  getLastThreeRatingsDisplay(cabin: Cabin): string {
    const average = this.getLastThreeRatingsAverage(cabin);
    if (average === 0) {
      return 'Nema 3 ocene';
    }
    return average.toString();
  }

  getLowRatedCabinsCount(): number {
    return this.filteredCabins.filter(c => this.shouldHighlightCabin(c)).length;
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}