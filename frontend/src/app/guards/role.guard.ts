import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const ulogovanString = localStorage.getItem('loggedInUser');
  
  if (!ulogovanString) {
    router.navigate(['/login']);
    return false;
  }
  
  const ulogovan = JSON.parse(ulogovanString);
  const expectedRole = route.data['expectedRole'];
  
  if (ulogovan.role == expectedRole) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};