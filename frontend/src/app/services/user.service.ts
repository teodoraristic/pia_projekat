import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, map} from 'rxjs';

interface LoginResponse {
  token: string;
  user: User;
}

interface UpdateProfileResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(){}

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/users';

  login(username: string, password: string, role: string): Observable<User | null> {
    let data = {
      username: username,
      password: password,
      role: role
    }
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      map(response => {
        console.log('Backend response:', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('loggedInUser', JSON.stringify(response.user));
        }
        return response.user || null;
      })
    );
  }

  register(userData: any): Observable<any> {
    const formData = new FormData();
    
    const { profileImage, hasDefaultImage, ...userDataWithoutImage } = userData;
    
    formData.append('userData', JSON.stringify(userDataWithoutImage));
    
    if (profileImage && profileImage instanceof File) {
      formData.append('profileImage', profileImage);
    }
    
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  changePassword(oldPassword: string, newPassword: string, username: string): Observable<any> {

    return this.http.put(`${this.apiUrl}/change-password`, {
      username: username,
      oldPassword: oldPassword,
      newPassword: newPassword
    });
  }

  updateProfile(userData: any, profilePicture: File | null): Observable<any> {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

    const formData = new FormData();
    formData.append('userId', loggedInUser._id);
    formData.append('updateData', JSON.stringify(userData));

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    return this.http.put(`${this.apiUrl}/update-profile`, formData);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  getPendingRegistrations(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/pending`);
  }

  updateRegistrationStatus(userId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/registration-status`, {
      registrationStatus: status
    });
  }

  approveRegistration(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/registration-status`, {
      registrationStatus: 'approved'
    });
  }

  rejectRegistration(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/registration-status`, {
      registrationStatus: 'rejected'
    });
  }

  activateUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/activate`, {});
  }

  deactivateUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }
}