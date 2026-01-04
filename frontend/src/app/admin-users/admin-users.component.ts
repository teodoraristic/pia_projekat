import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {

  private userService = inject(UserService);
  private router = inject(Router);

  users: User[] = [];
  pendingUsers: User[] = [];
  filteredUsers: User[] = [];
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  
  filterRole: string = '';
  filterStatus: string = '';
  searchTerm: string = '';

  userToDeactivate: User | null = null;
  userToActivate: User | null = null;

  activeTab: 'all' | 'pending' = 'all';

  ngOnInit(): void {
    this.loadUsers();
    this.loadPendingRegistrations();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Greška pri učitavanju korisnika: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  loadPendingRegistrations(): void {
    this.userService.getPendingRegistrations().subscribe({
      next: (users) => {
        this.pendingUsers = users;
      },
      error: (error) => {
        this.showMessage('Greška pri učitavanju zahteva za registraciju: ' + error.message, 'error');
      }
    });
  }

  search(): void {
    const usersToFilter = this.activeTab == 'all' ? this.users : this.pendingUsers;
    
    this.filteredUsers = usersToFilter.filter(user => {
      const matchesSearch = this.searchTerm ? 
        user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;

      const matchesRole = this.filterRole ? user.role == this.filterRole : true;
      
      let matchesStatus = true;
      if (this.filterStatus) {
        if (this.filterStatus == 'active') {
          matchesStatus = user.isActive;
        } else if (this.filterStatus == 'inactive') {
          matchesStatus = !user.isActive;
        } else if (this.filterStatus == 'pending') {
          matchesStatus = user.registrationStatus == 'pending';
        }
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  resetFilters(): void {
    this.filterRole = '';
    this.filterStatus = '';
    this.searchTerm = '';
    this.filteredUsers = this.activeTab == 'all' ? this.users : this.pendingUsers;
  }

  switchTab(tab: 'all' | 'pending'): void {
    this.activeTab = tab;
    this.resetFilters();
  }

  // Navigacija ka edit stranici
  editUser(user: User): void {
    if (!user._id) {
      this.showMessage('Korisnik nema validan ID', 'error');
      return;
    }
    this.router.navigate(['/admin/users/edit', user._id]);
  }

  approveRegistration(user: User): void {
    if (!user._id) {
      this.showMessage('Korisnik nema validan ID', 'error');
      return;
    }

    this.isLoading = true;
    this.userService.approveRegistration(user._id).subscribe({
      next: () => {
        this.showMessage('Registracija uspešno odobrena', 'success');
        this.loadPendingRegistrations();
        this.loadUsers();
      },
      error: (error) => {
        this.showMessage('Greška pri odobravanju registracije: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  rejectRegistration(user: User): void {
    if (!user._id) {
      this.showMessage('Korisnik nema validan ID', 'error');
      return;
    }

    this.isLoading = true;
    this.userService.rejectRegistration(user._id).subscribe({
      next: () => {
        this.showMessage('Registracija uspešno odbijena', 'success');
        this.loadPendingRegistrations();
      },
      error: (error) => {
        this.showMessage('Greška pri odbijanju registracije: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  deactivateUser(user: User): void {
    this.userToDeactivate = user;
  }

  confirmDeactivation(): void {
    if (!this.userToDeactivate?._id) {
      this.showMessage('Korisnik nema validan ID', 'error');
      return;
    }

    this.isLoading = true;
    this.userService.deactivateUser(this.userToDeactivate._id).subscribe({
      next: () => {
        this.showMessage('Korisnik uspešno deaktiviran', 'success');
        this.userToDeactivate = null;
        this.loadUsers();
      },
      error: (error) => {
        this.showMessage('Greška pri deaktivaciji korisnika: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  activateUser(user: User): void {
    this.userToActivate = user;
  }

  confirmActivation(): void {
    if (!this.userToActivate?._id) {
      this.showMessage('Korisnik nema validan ID', 'error');
      return;
    }

    this.isLoading = true;
    this.userService.activateUser(this.userToActivate._id).subscribe({
      next: () => {
        this.showMessage('Korisnik uspešno aktiviran', 'success');
        this.userToActivate = null;
        this.loadUsers();
      },
      error: (error) => {
        this.showMessage('Greška pri aktivaciji korisnika: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }


  cancelAction(): void {
    this.userToDeactivate = null;
    this.userToActivate = null;
  }

  getRoleText(role: string | undefined): string {
    if (!role) return 'Nepoznato';
    
    const roles: { [key: string]: string } = {
      'tourist': 'Turista',
      'owner': 'Vlasnik',
      'admin': 'Administrator'
    };
    return roles[role] || role;
  }

  getStatusText(user: User): string {
    if (user.registrationStatus == 'pending') return 'Na čekanju';
    return user.isActive ? 'Aktivan' : 'Deaktiviran';
  }

  getStatusColor(user: User): string {
    if (user.registrationStatus == 'pending') return '#ffc107';
    return user.isActive ? '#28a745' : '#dc3545';
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}