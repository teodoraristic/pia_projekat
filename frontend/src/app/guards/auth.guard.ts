import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    console.log('Auth guard - token:', token);
    console.log('Auth guard - loggedInUser:', loggedInUser);
    
    if (!token || !loggedInUser) {
      console.log('Nije ulogovan, redirekt na login');
      this.router.navigate(['/admin/login']);
      return false;
    }
    
    return true;
  }
}