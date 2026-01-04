
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CabinService } from '../services/cabin.service';
import { Statistic } from '../models/statistic';
import { Cabin } from '../models/cabin';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private cabinService = inject(CabinService);
  router = inject(Router);

  statistics: Statistic = new Statistic();

  ngOnInit() {
    this.loadStatistics();
    this.loadCabins();
  }

  cabins: Cabin[] = [];
  filteredCabins: Cabin[] = [];

  nameFilter: string = '';
  locationFilter: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isLoading: boolean = true;

  loadStatistics() {
    this.cabinService.getStatistics().subscribe({
      next: (statistics) => {
        this.statistics = statistics;
      },
      error: (error) => {
        console.error('Greška pri učitavanju statistike:', error);
      }
    });
  }

  loadCabins() {
    this.cabinService.getAllCabins().subscribe({
      next: (cabins) => {
        this.cabins = cabins;
        this.filteredCabins = [...cabins];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Greška pri učitavanju vikendica:', error);
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredCabins = this.cabins.filter(cabin => {
      const matchesName = this.nameFilter ? 
        cabin.name.toLowerCase().includes(this.nameFilter.toLowerCase()) : true;
      
      const matchesLocation = this.locationFilter ? 
        cabin.location.toLowerCase().includes(this.locationFilter.toLowerCase()) : true;

      return matchesName && matchesLocation;
    });

    if (this.sortColumn) {
      this.sort(this.sortColumn, this.sortDirection);
    }
  }

  sort(column: string, direction: 'asc' | 'desc' = 'asc') {
    this.sortColumn = column;
    this.sortDirection = direction;

    this.filteredCabins.sort((a, b) => {
      let valueA, valueB;

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
        default:
          return 0;
      }

      if (valueA < valueB) {
        return direction == 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction == 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  toggleSort(column: string) {
    if (this.sortColumn == column) {
      this.sortDirection = this.sortDirection == 'asc' ? 'desc' : 'asc';
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

  resetFilters() {
    this.nameFilter = '';
    this.locationFilter = '';
    this.filteredCabins = [...this.cabins];
    this.sortColumn = '';
    this.sortDirection = 'asc';
  }
}
