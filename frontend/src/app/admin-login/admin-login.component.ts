import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  username: string = "";
  password: string = "";
  message: string = "";
  isLoading: boolean = false; 

  login() {
    if (!this.username || !this.password) {
      this.message = 'Molimo popunite sva polja';
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.userService.login(this.username, this.password, 'admin').subscribe({
      next: (user) => {
        this.isLoading = false;
        
        if (!user || user.role != 'admin') {
          this.message = 'Pogrešni administratorski podaci';
          return;
        }

        localStorage.setItem('loggedInUser', JSON.stringify(user));
        this.router.navigate(['admin']);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = 'Greška pri administratorskoj prijavi';
      }
    });
  }
}