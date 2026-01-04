import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cabin } from '../models/cabin';
import { Statistic } from '../models/statistic';

@Injectable({
  providedIn: 'root'
})
export class CabinService {

  constructor(){}
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/cabins';

  getStatistics(): Observable<Statistic> {
    return this.http.get<Statistic>(`${this.apiUrl}/statistics`);
  }

  getAllCabins(): Observable<Cabin[]> {
    return this.http.get<Cabin[]>(`${this.apiUrl}`);
  }

  getCabinById(id: string): Observable<Cabin> {
    return this.http.get<Cabin>(`${this.apiUrl}/${id}`);
  }

  getOwnerCabins(ownerId: string): Observable<Cabin[]> {
    return this.http.get<Cabin[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  createCabin(cabinData: any, images: File[]): Observable<any> {
    const formData = new FormData();
    
    const userData = localStorage.getItem('loggedInUser');
    const currentUser = userData ? JSON.parse(userData) : null;
    
    if (!currentUser?._id) {
      throw new Error('Korisnik nije pronađen');
    }

    const cabinDataToSend = { ...cabinData,
      ownerId: currentUser._id,
      isActive: true 
     };

    delete cabinDataToSend._id;
    delete cabinDataToSend.id;
  
    
    formData.append('cabinData', JSON.stringify(cabinDataToSend));
    
    images.forEach((image, index) => {
      formData.append('cabinImages', image, `image_${index}.jpg`);
    });
    
    return this.http.post(`${this.apiUrl}`, formData);
  }

  updateCabin(cabinId: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cabinId}`, updateData);
  }

  deleteCabin(cabinId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cabinId}`);
  }

  checkAvailability(cabinId: string, startDate: string, endDate: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-availability`, {
      cabinId,
      startDate,
      endDate
    });
  }

  blockCabin(cabinId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cabinId}/block`, {});
  }

  getLastThreeRatings(cabinId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${cabinId}/last-three-ratings`);
  }

}
