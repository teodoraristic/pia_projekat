export class User {
  _id?: string = "";
  username: string= "";
  password: string= "";
  email: string= "";
  firstName: string= "";
  lastName: string= "";
  gender: 'M' | 'Ž'= "M";
  address: string= "";
  phone: string= "";
  profileImage: string= "";
  creditCard?: string= ""; 
  role: 'tourist' | 'owner' | 'admin'="tourist";
  isActive: boolean = false;
  registrationStatus: 'pending' | 'approved' | 'rejected'="pending";
  createdAt?: Date;
}