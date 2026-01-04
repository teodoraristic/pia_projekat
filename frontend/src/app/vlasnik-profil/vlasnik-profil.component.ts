import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vlasnik-profil',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './vlasnik-profil.component.html',
  styleUrl: './vlasnik-profil.component.css'
})
export class VlasnikProfilComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  user: User = new User();
  isEditMode: boolean = false;
  message: string = '';
  isLoading: boolean = false;
  profilePicture: File | null = null;
  profilePicturePreview: string | null = null;

  private readonly API_BASE_URL = 'http://localhost:4000';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      this.user = JSON.parse(loggedInUser);
      if (this.user.profileImage) {
        this.profilePicturePreview = this.getImageUrl(this.user.profileImage);
      } else {
        this.profilePicturePreview = null;
      }
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    
    const fullUrl = `${this.API_BASE_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
    return `${fullUrl}?t=${new Date().getTime()}`;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        this.message = 'Samo JPG i PNG formati su dozvoljeni';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.message = 'Slika je prevelika. Maksimalna veličina je 2MB.';
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const width = img.width;
          const height = img.height;

          if (width < 100 || height < 100) {
            this.message = `Slika je premala: ${width}x${height}px. Minimalne dimenzije su 100x100px.`;
            this.profilePicturePreview = null;
            this.profilePicture = null;
            return;
          }

          if (width > 300 || height > 300) {
            this.message = `Slika je prevelika: ${width}x${height}px. Maksimalne dimenzije su 300x300px.`;
            this.profilePicturePreview = null;
            this.profilePicture = null;
            return;
          }

          this.message = '';
          this.profilePicture = file;
          this.profilePicturePreview = e.target.result;
        };
      };

      reader.readAsDataURL(file);
    }
  }

  removePicture() {
    this.profilePicture = null;
    this.profilePicturePreview = null;
    this.user.profileImage = ''; 

    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.loadProfile();
    }
    this.message = '';
  }

  saveChanges() {
    if (!this.user.firstName || !this.user.lastName || !this.user.email || 
        !this.user.phone || !this.user.address) {
      this.message = 'Molimo popunite sva obavezna polja';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.message = 'Email nije u ispravnom formatu';
      return;
    }

    this.isLoading = true;

    this.userService.updateProfile(this.user, this.profilePicture).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.isEditMode = false;
        this.message = 'Profil je uspešno ažuriran!';

        if (response.user) {
          localStorage.setItem('loggedInUser', JSON.stringify(response.user));
          this.user = response.user;
          
          if (response.user.profileImage) {
            this.profilePicturePreview = this.getImageUrl(response.user.profileImage);
          }
        }
        
        this.profilePicture = null;
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Došlo je do greške pri ažuriranju profila';
      }
    });
  }

}