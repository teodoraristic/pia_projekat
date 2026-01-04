import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {


  ngOnInit(): void {
  }

  private router = inject(Router);

  menuItems = [
    { path: 'users', label: 'Korisnici', icon: '👥' },
    { path: 'cabins', label: 'Vikendice', icon: '🏠' }
  ];

  getLoggedInUser(): any {
    const userData = localStorage.getItem('loggedInUser');
    return userData ? JSON.parse(userData) : null;
  }

  logOut() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }
}
