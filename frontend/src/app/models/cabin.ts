export class Cabin {
  _id: string = "";
  name: string = "";
  location: string = "";
  description: string = "";
  services: string[] = [];
  priceSummer: number = 0;
  priceWinter: number = 0;
  phone: string = "";
  coordinates: {
    lat: number;
    lng: number;
  } = { lat: 0, lng: 0 };
  images: string[] = [];
  ownerId: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    _id?: string;
  } = {
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  };
  isActive: boolean = false;
  isBlocked?: boolean;
  blockedUntil?: Date;
  averageRating?: number;
  totalReviews?: number;
  
  lastThreeRatings?: {
    rating: number;
    reservationId: string;
    date: Date;
  }[] = [];
  
  createdAt?: Date;
}