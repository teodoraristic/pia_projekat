
import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  user: User = new User();
  password: string = '';
  confirmPassword: string = '';
  profileImage: File | null = null;
  profileImagePreview: string | ArrayBuffer | null = null;
  imageValid: boolean = true;
  imageMessage: string = '';
  message: string = '';
  isLoading: boolean = false;

  private readonly PASSWORD_REGEX = /^[a-zA-Z][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]{5,9}$/;
  private readonly CARD_REGEX = {
    diners: /^(300|301|302|303|36|38)\d+$/,
    mastercard: /^(51|52|53|54|55)\d+$/,
    visa: /^(4539|4556|4916|4532|4929|4485|4716)\d+$/
  };

  validatePassword(password: string): boolean {
    if (password.length < 6 || password.length > 10) {
      console.log('Invalid length:', password.length);
      return false;
    }

    if (!/^[a-zA-Z]/.test(password)) {
      console.log('Must start with letter');
      return false;
    }

    const hasUpper = /[A-Z]/.test(password);
    const lowerMatches = password.match(/[a-z]/g) || [];
    const hasLower = lowerMatches.length >= 3;
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    console.log('Password check:', {
      password,
      hasUpper,
      hasLower: `${lowerMatches.length} lowercase: [${lowerMatches}]`,
      hasDigit,
      hasSpecial,
      valid: hasUpper && hasLower && hasDigit && hasSpecial
    });

    return hasUpper && hasLower && hasDigit && hasSpecial;
  }

  validateCard(number: string): { valid: boolean; type: string } {
    const clean = number.replace(/\s/g, '');
    if (!/^\d+$/.test(clean)) return { valid: false, type: '' };

    if (this.CARD_REGEX.diners.test(clean) && clean.length == 15) return { valid: true, type: 'diners' };
    if (this.CARD_REGEX.mastercard.test(clean) && clean.length == 16) return { valid: true, type: 'mastercard' };
    if (this.CARD_REGEX.visa.test(clean) && clean.length == 16) return { valid: true, type: 'visa' };

    return { valid: false, type: '' };
  }

  onCardChange() {
    this.displayCardType();
  }

  displayCardType(): string {
    if (!this.user.creditCard) return '';
    const result = this.validateCard(this.user.creditCard);
    if (result.valid) {
      switch (result.type) {
        case 'diners': return '💳 Diners Club';
        case 'mastercard': return '💳 MasterCard';
        case 'visa': return '💳 Visa';
      }
    }
    return '';
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      this.profileImage = null;
      this.profileImagePreview = null;
      this.imageValid = true;
      return;
    }

    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      this.imageMessage = 'Samo JPG i PNG formati su dozvoljeni';
      this.imageValid = false;
      this.profileImage = null;
      this.profileImagePreview = null;
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.imageMessage = 'Slika je prevelika. Maksimalna veličina je 2MB.';
      this.imageValid = false;
      this.profileImage = null;
      this.profileImagePreview = null;
      event.target.value = '';
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e: any) => {
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        if (width < 100 || height < 100) {
          this.imageMessage = `Slika je premala: ${width}x${height}px.`;
          this.imageValid = false;
          this.profileImage = null;
          this.profileImagePreview = null;
          event.target.value = '';
        } else if (width > 300 || height > 300) {
          this.imageMessage = `Slika je prevelika: ${width}x${height}px.`;
          this.imageValid = false;
          this.profileImage = null;
          this.profileImagePreview = null;
          event.target.value = '';
        } else {
          this.imageMessage = `Slika je validna: ${width}x${height}px`;
          this.imageValid = true;
          this.profileImage = file;
          this.profileImagePreview = e.target.result;
        }
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  removeImage() {
    this.profileImage = null;
    this.profileImagePreview = null;
    this.imageValid = true;
    this.imageMessage = 'Koristiće se podrazumevana profilna slika';

    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  register() {
    if (!this.user.username || !this.password || !this.user.firstName || !this.user.lastName ||
        !this.user.gender || !this.user.address || !this.user.phone || !this.user.email) {
      this.message = 'Molimo popunite sva obavezna polja';
      return;
    }

    if (this.user.role == 'owner' && this.profileImage && !this.imageValid) {
      this.message = 'Profilna slika nije u validnom formatu';
      return;
    }

    if (!this.validatePassword(this.password)) {
      this.message = 'Lozinka nije u ispravnom formatu';
      return;
    }

    if (this.password != this.confirmPassword) {
      this.message = 'Lozinke se ne poklapaju';
      return;
    }

    this.user.password = this.password;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.message = 'Email nije u ispravnom formatu';
      return;
    }

    if (this.user.role == 'tourist') {
      const cardCheck = this.validateCard(this.user.creditCard || '');
      if (!cardCheck.valid) {
        this.message = 'Broj kreditne kartice nije validan';
        return;
      }
    }

    this.isLoading = true;
    this.message = '';

    this.userService.register({
      ...this.user,
      profileImage: this.profileImage,
      hasDefaultImage: !this.profileImage
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Uspešno ste poslali zahtev za registraciju!';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Došlo je do greške pri registraciji';
      }
    });
  }
}
