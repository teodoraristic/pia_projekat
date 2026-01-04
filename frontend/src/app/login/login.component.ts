import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  username: string = "";
  password: string = "";
  role: string = "";
  message: string = "";
  isLoading: boolean = false;

 login() {
  if (!this.username || !this.password || !this.role) {
    this.message = 'Molimo popunite sva polja';
    return;
  }

  this.isLoading = true;
  this.message = '';

  this.userService.login(this.username, this.password, this.role).subscribe({
    next: (user: User | null) => {
      this.isLoading = false;
      
      if (!user) {
        this.message = 'Pogrešno korisničko ime ili lozinka';
        return;
      }

      console.log('Uspešna prijava:', user);


      localStorage.setItem('loggedInUser', JSON.stringify(user));
      
      setTimeout(() => {
        if (user.role === 'tourist') {
          this.router.navigate(['/tourist']);
        } else if (user.role === 'owner') {
          this.router.navigate(['/owner']);
        }
      }, 100); 
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Login error:', error);
      
      this.message = error.error?.message || 'Došlo je do greške pri prijavi. Pokušajte ponovo.';
      }
    });
  }

  goBackToHome(): void {
    this.router.navigate(['/']);
  }
}