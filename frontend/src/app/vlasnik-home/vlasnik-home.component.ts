import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'app-vlasnik-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './vlasnik-home.component.html',
  styleUrl: './vlasnik-home.component.css'
})
export class VlasnikHomeComponent implements OnInit {
  user: User | null = null;

  private router = inject(Router);

  menuItems = [
    { path: 'profile', label: 'Profil', icon: '👤' },
    { path: 'reservations', label: 'Rezervacije', icon: '📅' },
    { path: 'cabins', label: 'Moje Vikendice', icon: '🏠' },
    { path: 'statistics', label: 'Statistika', icon: '📊' }
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
