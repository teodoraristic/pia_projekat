import { Component, inject, OnInit } from '@angular/core';
import { Cabin } from '../models/cabin';
import { CabinService } from '../services/cabin.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vlasnik-nova-vikendica',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './vlasnik-nova-vikendica.component.html',
  styleUrl: './vlasnik-nova-vikendica.component.css'
})
export class VlasnikNovaVikendicaComponent implements OnInit {
  cabinData: Cabin = new Cabin();
  newService: string = '';
  isLoading: boolean = false;
  message: string = '';
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  selectedJsonFile: File | null = null;
  jsonImportError: string = '';

  jsonExample: string = `{
  "name": "Vikendica na Zlatiboru",
  "location": "Zlatibor",
  "services": ["WiFi", "Kuhinja", "Parking"],
  "priceSummer": 80,
  "priceWinter": 60,
  "phone": "+381641234567",
  "coordinates": {
    "lat": 43.723,
    "lng": 19.689
  }
}`;

  private cabinService = inject(CabinService);
  private router = inject(Router);

  ngOnInit(): void {
    this.cabinData.coordinates = { lat: 0, lng: 0 };
  }

  addService(): void {
    if (this.newService.trim() && !this.cabinData.services.includes(this.newService.trim())) {
      this.cabinData.services.push(this.newService.trim());
      this.newService = '';
    }
  }

  removeService(index: number): void {
    this.cabinData.services.splice(index, 1);
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
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  createCabin(): void {
    if (!this.cabinData.name.trim()) {
      this.message = 'Naziv vikendice je obavezan';
      return;
    }

    if (!this.cabinData.location.trim()) {
      this.message = 'Lokacija je obavezna';
      return;
    }

    if (this.cabinData.priceSummer <= 0 || this.cabinData.priceWinter <= 0) {
      this.message = 'Cene moraju biti veće od 0';
      return;
    }

    const userData = localStorage.getItem('loggedInUser');
    const currentUser = userData ? JSON.parse(userData) : null;

    if (!currentUser || !currentUser._id) {
      this.message = 'Korisnik nije pronađen';
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.cabinData.coordinates.lat = Number(this.cabinData.coordinates.lat);
    this.cabinData.coordinates.lng = Number(this.cabinData.coordinates.lng);

    this.cabinService.createCabin(this.cabinData, this.selectedFiles).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Vikendica je uspešno kreirana!';
        
        setTimeout(() => {
          this.router.navigate(['/owner/cabins']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = 'Greška pri kreiranju vikendice: ' + (error.error?.message || error.message);
        console.error('Greška:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/owner/cabins']);
  }

  onJsonFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.jsonImportError = 'Molimo odaberite JSON fajl';
      return;
    }

    this.selectedJsonFile = file;
    this.jsonImportError = '';
    this.message = ''; 

    this.readJsonFile(file);
  }

  private readJsonFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const jsonContent = e.target.result;
        this.parseJsonData(jsonContent);
      } catch (error) {
        this.jsonImportError = 'Greška pri čitanju JSON fajla';
        console.error('JSON read error:', error);
      }
    };

    reader.onerror = () => {
      this.jsonImportError = 'Greška pri učitavanju fajla';
    };

    reader.readAsText(file);
  }

  private parseJsonData(jsonContent: string): void {
    try {
      const jsonData = JSON.parse(jsonContent);
      this.fillFormFromJson(jsonData);
    } catch (error) {
      this.jsonImportError = 'Nevalidan JSON format';
      console.error('JSON parse error:', error);
    }
  }

  private fillFormFromJson(jsonData: any): void {
    this.cabinData.name = jsonData.name || '';
    this.cabinData.location = jsonData.location || '';
    this.cabinData.description = jsonData.description || '';
    
    if (Array.isArray(jsonData.services)) {
      this.cabinData.services = jsonData.services;
    } else if (typeof jsonData.services === 'string') {
      this.cabinData.services = [jsonData.services];
    } else {
      this.cabinData.services = [];
    }
    
    this.cabinData.priceSummer = jsonData.priceSummer || 0;
    this.cabinData.priceWinter = jsonData.priceWinter || 0;
    this.cabinData.phone = jsonData.phone || '';
    
    if (jsonData.coordinates) {
      this.cabinData.coordinates.lat = jsonData.coordinates.lat || 0;
      this.cabinData.coordinates.lng = jsonData.coordinates.lng || 0;
    }

    this.message = 'Podaci su uspešno uvezeni iz JSON fajla! Sada možete dodati slike i kreirati vikendicu.';
  }

  clearJsonImport(): void {
    this.selectedJsonFile = null;
    this.jsonImportError = '';
    
    const fileInput = document.getElementById('jsonFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
