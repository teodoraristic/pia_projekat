import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-user-edit.component.html',
  styleUrl: './admin-user-edit.component.css'
})
export class UserEditComponent implements OnInit {

  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user: User | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.showMessage('Korisnik nije pronađen', 'error');
      return;
    }

    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.imagePreview = user.profileImage || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Greška pri učitavanju korisnika: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {

      if (!this.validateImage(file)) {
        this.showMessage('Slika mora biti u JPG ili PNG formatu', 'error');
        return;
      }

      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  validateImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png'];
    return validTypes.includes(file.type);
  }

  saveUser(): void {
    if (!this.user || !this.user._id) {
      this.showMessage('Korisnik nije validan', 'error');
      return;
    }

    if (!this.isFormValid()) {
      this.showMessage('Popunite sva obavezna polja', 'error');
      return;
    }

    this.isSaving = true;
    
    const userData = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      username: this.user.username,
      email: this.user.email,
      gender: this.user.gender,
      address: this.user.address,
      phone: this.user.phone,
      creditCard: this.user.creditCard,
      role: this.user.role,
      isActive: this.user.isActive,
      registrationStatus: this.user.registrationStatus
    };

    this.userService.updateUser(this.user._id, userData).subscribe({
      next: (response) => {
        this.showMessage('Korisnik uspešno ažuriran', 'success');
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 1500);
      },
      error: (error) => {
        this.showMessage('Greška pri ažuriranju korisnika: ' + error.message, 'error');
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  isFormValid(): boolean {
    return !!(
      this.user?.firstName &&
      this.user?.lastName &&
      this.user?.username &&
      this.user?.email &&
      this.user?.role
    );
  }

  removeProfileImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    if (this.user) {
      this.user.profileImage = "";
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}