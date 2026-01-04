import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { RegisterComponent } from './register/register.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { HomeComponent } from './home/home.component';
import { TuristaProfilComponent } from './turista-profil/turista-profil.component';
import { TuristaHomeComponent } from './turista-home/turista-home.component';
import { TuristaVikendiceComponent } from './turista-vikendice/turista-vikendice.component';
import { TuristaVikendicaDetaljiComponent } from './turista-vikendica-detalji/turista-vikendica-detalji.component';
import { TuristaRezervacijeComponent } from './turista-rezervacije/turista-rezervacije.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { VlasnikHomeComponent } from './vlasnik-home/vlasnik-home.component';
import { VlasnikProfilComponent } from './vlasnik-profil/vlasnik-profil.component';
import { VlasnikRezervacijeComponent } from './vlasnik-rezervacije/vlasnik-rezervacije.component';
import { VlasnikVikendiceComponent } from './vlasnik-vikendice/vlasnik-vikendice.component';
import { VlasnikNovaVikendicaComponent } from './vlasnik-nova-vikendica/vlasnik-nova-vikendica.component';
import { VlasnikEditVikendicaComponent } from './vlasnik-edit-vikendica/vlasnik-edit-vikendica.component';
import { OwnerStatisticsComponent } from './owner-statistics/owner-statistics.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { UserEditComponent } from './admin-user-edit/admin-user-edit.component';
import { AdminCabinsComponent } from './admin-cabins/admin-cabins.component';


export const routes: Routes = [
    {path:"", component:HomeComponent},
    {path:"login", component:LoginComponent},
    {path: "admin/login", component: AdminLoginComponent},
    {path:"register", component:RegisterComponent},
    {path:"change-password", component:ChangePasswordComponent},
    { 
    path: 'tourist', 
    component: TuristaHomeComponent,
    canActivate: [authGuard, roleGuard],
    data: {expectedRole: 'tourist'},
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: TuristaProfilComponent },
      { path: 'cabins', component: TuristaVikendiceComponent },
      { path: 'reservations', component: TuristaRezervacijeComponent },
      { path: 'cabin/:id', component: TuristaVikendicaDetaljiComponent }
    ]
  },
  {
  path: 'owner',
  component: VlasnikHomeComponent,
  canActivate: [authGuard, roleGuard],
  data: {expectedRole: 'owner'},
  children: [
    { path: '', redirectTo: 'profile', pathMatch: 'full' },
    { path: 'profile', component: VlasnikProfilComponent },
    { path: 'reservations', component: VlasnikRezervacijeComponent },
    { path: 'cabins', component: VlasnikVikendiceComponent },
    { path: 'new-cabin', component: VlasnikNovaVikendicaComponent },
    { path: 'edit-cabin/:id', component:VlasnikEditVikendicaComponent},
    { path: 'statistics', component: OwnerStatisticsComponent }
  ]
  },
  {
    path: "admin", 
    component: AdminHomeComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'admin' },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' }, 
      { path: 'users', component: AdminUsersComponent },
      { path: 'users/edit/:id', component: UserEditComponent },
      { path: 'cabins', component: AdminCabinsComponent }
    ]
  }
];
