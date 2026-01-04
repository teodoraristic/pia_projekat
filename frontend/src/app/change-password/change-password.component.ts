import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  username: string = ''; // ✅ ДОДАЈЕМО КОРИСНИЧКО ИМЕ
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  isLoading: boolean = false;

  validatePassword(password: string): boolean {
    if (password.length < 6 || password.length > 10) {
      return false;
    }

    if (!/^[a-zA-Z]/.test(password)) {
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const lowerCaseLetters = (password.match(/[a-z]/g) || []).length;
    const hasThreeLowerCase = lowerCaseLetters >= 3;
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasUpperCase && hasThreeLowerCase && hasDigit && hasSpecialChar;
  }

  changePassword() {
    this.message = '';

    if (!this.username || !this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.message = 'Molimo popunite sva polja';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Nova lozinka i potvrdna lozinka se ne poklapaju';
      return;
    }

    if (this.oldPassword === this.newPassword) {
      this.message = 'Nova lozinka mora biti različita od stare lozinke';
      return;
    }

    if (!this.validatePassword(this.newPassword)) {
      this.message = 'Nova lozinka nije u ispravnom formatu. Lozinka mora: \n' +
                   '- Imati 6-10 karaktera\n' +
                   '- Počinjati slovom\n' + 
                   '- Sadržati bar 1 veliko slovo\n' +
                   '- Sadržati bar 3 mala slova\n' +
                   '- Sadržati bar 1 broj\n' +
                   '- Sadržati bar 1 specijalni karakter';
      return;
    }

    this.isLoading = true;

    this.userService.changePassword(this.oldPassword, this.newPassword, this.username).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Lozinka je uspešno promenjena! Bićete preusmereni na stranicu za prijavu.';

        setTimeout(() => {
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status == 401) {
          this.message = 'Stara lozinka nije ispravna';
        } else if (error.status === 404) {
          this.message = 'Korisničko ime nije pronađeno';
        } else {
          this.message = error.error?.message || 'Došlo je do greške pri promeni lozinke';
        }
      }
    });
  }

  getPasswordStrength(): string {
    if (!this.newPassword) return '';

    const length = this.newPassword.length;
    const complexity = this.validatePassword(this.newPassword);

    if (length < 6) return 'Prekratka';
    if (length > 10) return 'Predugačka';
    if (!complexity) return 'Slaba';
    
    return 'Jaka';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'Jaka': return '#28a745';
      case 'Slaba': return '#ffc107';
      case 'Prekratka':
      case 'Predugačka': return '#dc3545';
      default: return '#6c757d';
    }
  }

  goBackToHome(): void {
    this.router.navigate(['/']);
  }
}