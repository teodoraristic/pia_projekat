import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'app-turista-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './turista-home.component.html',
  styleUrl: './turista-home.component.css'
})
export class TuristaHomeComponent implements OnInit {

  private router = inject(Router);

  user: User | null = null;
  menuItems = [
    { path: 'profile', label: 'Profil', icon: '👤' },
    { path: 'cabins', label: 'Vikendice', icon: '🏠' },
    { path: 'reservations', label: 'Rezervacije', icon: '📅' }
  ];

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    const userData = localStorage.getItem('loggedInUser');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  logOut() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

}
