export class Reservation {
  _id: string = "";
  cabinId: string = "";
  cabinName: string = "";
  cabinLocation: string = "";
  startDate: Date = new Date();
  endDate: Date = new Date();
  adults: number = 0;
  children: number = 0;
  totalPrice: number = 0;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled' = "pending";
  touristId: string = "";
  touristName?: string = "";    
  ownerComment?: string = "";      
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  rating?: number;
  comment?: string = "";
  additionalRequests?: string = "";
}