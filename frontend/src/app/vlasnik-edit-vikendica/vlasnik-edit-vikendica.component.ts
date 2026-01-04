import { Component, inject, OnInit } from '@angular/core';
import { Cabin } from '../models/cabin';
import { CabinService } from '../services/cabin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vlasnik-edit-vikendica',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './vlasnik-edit-vikendica.component.html',
  styleUrl: './vlasnik-edit-vikendica.component.css'
})
export class VlasnikEditVikendicaComponent implements OnInit {

  private cabinService = inject(CabinService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cabin: Cabin = new Cabin();
  newService: string = '';
  isLoading: boolean = false;
  message: string = '';
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  ngOnInit(): void {
    this.loadCabin();
  }

  loadCabin(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.message = 'Vikendica nije pronađena';
      return;
    }

    this.isLoading = true;
    
    this.cabinService.getCabinById(id).subscribe({
      next: (cabin) => {
        this.cabin = cabin;

        if (!this.cabin.coordinates) {
          this.cabin.coordinates = { lat: 0, lng: 0 };
        }
        
        this.imagePreviews = [...cabin.images];
        this.isLoading = false;
      },
      error: (error) => {
        this.message = 'Greška pri učitavanju vikendice: ' + error.message;
        this.isLoading = false;
        console.error('Greška:', error);
      }
    });
  }

  addService(): void {
    if (this.newService.trim() && !this.cabin.services.includes(this.newService.trim())) {
      this.cabin.services.push(this.newService.trim());
      this.newService = '';
    }
  }

  removeService(index: number): void {
    this.cabin.services.splice(index, 1);
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
          this.message = 'Samo JPG i PNG formati su dozvoljeni';
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          this.message = 'Svaka slika mora biti manja od 5MB';
          continue;
        }

        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    
    if (index < this.cabin.images.length) {
      this.cabin.images.splice(index, 1);
    } else {

      const fileIndex = index - this.cabin.images.length;
      this.selectedFiles.splice(fileIndex, 1);
    }
  }

  saveChanges(): void {
    if (!this.cabin.name.trim()) {
      this.message = 'Naziv vikendice je obavezan';
      return;
    }

    if (!this.cabin.location.trim()) {
      this.message = 'Lokacija je obavezna';
      return;
    }

    if (this.cabin.priceSummer <= 0 || this.cabin.priceWinter <= 0) {
      this.message = 'Cene moraju biti veće od 0';
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.cabin.coordinates.lat = Number(this.cabin.coordinates.lat);
    this.cabin.coordinates.lng = Number(this.cabin.coordinates.lng);

    this.cabinService.updateCabin(this.cabin._id, this.cabin).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Vikendica je uspešno ažurirana!';
        
        setTimeout(() => {
          this.router.navigate(['/owner/cabins']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = 'Greška pri ažuriranju vikendice: ' + (error.error?.message || error.message);
        console.error('Greška:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/owner/cabins']);
  }
}
