import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CabinService } from '../services/cabin.service';
import { Cabin } from "../models/cabin";

@Component({
  selector: 'app-turista-vikendice',
  standalone: true,
  imports: [FormsModule, ],
  templateUrl: './turista-vikendice.component.html',
  styleUrl: './turista-vikendice.component.css'
})
export class TuristaVikendiceComponent implements OnInit {
  private cabinService = inject(CabinService);
  private router = inject(Router);

  cabins: Cabin[] = [];
  filteredCabins: Cabin[] = [];
  
  filterName: string = '';
  filterPlace: string = '';
  
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  isLoading: boolean = true;
  message: string = '';

  ngOnInit() {
    this.loadCabins();
  }

  loadCabins() {
    this.isLoading = true;
    this.cabinService.getAllCabins().subscribe({
      next: (cabins) => {
        this.cabins = cabins;
        this.filteredCabins = [...cabins];
        this.sort('name', 'asc');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Greška pri učitavanju vikendica:', error);
        this.message = 'Došlo je do greške pri učitavanju vikendica';
        this.isLoading = false;
        }
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredCabins = this.cabins.filter(cabin => {
      const matchesName = this.filterName ? 
        cabin.name.toLowerCase().includes(this.filterName.toLowerCase()) : true;

      const matchesLocation = this.filterPlace ? 
        cabin.location.toLowerCase().includes(this.filterPlace.toLowerCase()) : true;

      return matchesName && matchesLocation;
    });

    if (this.sortColumn) {
      this.sort(this.sortColumn, this.sortDirection);
    }
  }

  search() {
    this.filteredCabins = this.cabins.filter(cabin => {
      const matchesName = this.filterName ? 
        cabin.name.toLowerCase().includes(this.filterName.toLowerCase()) : true;

      const matchesPlace = this.filterPlace ? 
        cabin.location.toLowerCase().includes(this.filterPlace.toLowerCase()) : true;

      return matchesName && matchesPlace;
    });

    if (this.sortColumn) {
      this.sort(this.sortColumn, this.sortDirection);
    }
  }

  sort(column: string, direction: 'asc' | 'desc' = 'asc') {
    this.sortColumn = column;
    this.sortDirection = direction;

    this.filteredCabins.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (column) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'location':
          valueA = a.location.toLowerCase();
          valueB = b.location.toLowerCase();
          break;
        case 'priceSummer':
          valueA = a.priceSummer;
          valueB = b.priceSummer;
          break;
        case 'priceWinter':
          valueA = a.priceWinter;
          valueB = b.priceWinter;
          break;
        case 'rating':
          valueA = a.averageRating || 0;
          valueB = b.averageRating || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.sort(column, this.sortDirection);
  }

  getSortIndicator(column: string): string {
    if (this.sortColumn == column) {
      return this.sortDirection == 'asc' ? '▲' : '▼';
    }
    return '';
  }

  showStarRating(rating: number = 0): string {
    const filledStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return filledStars + emptyStars;
  }

  goToDetails(cabinId: string) {
    this.router.navigate(['/tourist/cabin', cabinId]);
  }

  resetFilters() {
    this.filterName = '';
    this.filterPlace = '';
    this.filteredCabins = [...this.cabins];
    this.sortColumn = 'name';
    this.sortDirection = 'asc';
    this.sort('name', 'asc');
  }

}