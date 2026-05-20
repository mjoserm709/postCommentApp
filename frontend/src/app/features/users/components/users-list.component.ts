import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { UsersService } from '../services/users.service';
import { User } from '../data/user.interfaces';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col-md-6">
          <h2>Gestión de Usuarios</h2>
        </div>
        <div class="col-md-6">
          <input
            type="text"
            class="form-control"
            placeholder="Buscar por usuario, nombre o email..."
            [(ngModel)]="searchInput"
            (ngModelChange)="onSearchChange($event)"
          />
        </div>
      </div>

      @if (isLoading()) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      }

      @if (!isLoading()) {
        <div class="row">
          @for (user of filteredUsers(); track user._id) {
            <div class="col-md-4 mb-4">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">{{ user.firstName }} {{ user.lastName }}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">&#64;{{ user.username }}</h6>
                  <p class="card-text">
                    <strong>Email:</strong> {{ user.email }}<br/>
                    <strong>Roles:</strong>
                    @for (role of user.roles; track role) {
                      <span class="badge bg-primary me-1">{{ role }}</span>
                    }
                  </p>
                </div>
                <div class="card-footer bg-transparent">
                  <small class="text-muted">Status:
                    <span [class.text-success]="user.isActive" [class.text-danger]="!user.isActive">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </small>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center text-muted py-5">
              <p>No se encontraron usuarios.</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  users = signal<User[]>([]);
  search = signal<string>('');
  isLoading = signal<boolean>(false);

  // Computed Signal: filtrado reactivo en tiempo real
  filteredUsers = computed(() =>
    this.users().filter(u =>
      u.username.toLowerCase().includes(this.search().toLowerCase()) ||
      u.email.toLowerCase().includes(this.search().toLowerCase()) ||
      u.firstName.toLowerCase().includes(this.search().toLowerCase())
    )
  );

  // RxJS: debounce del campo de búsqueda
  private searchSubject = new Subject<string>();
  searchInput = '';

  ngOnInit() {
    if (!this.authService.hasPermission('users.read')) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(300),
      tap(searchTerm => this.search.set(searchTerm))
    ).subscribe();
  }

  loadUsers() {
    this.isLoading.set(true);

    this.usersService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar la lista de usuarios. Por favor, inténtelo de nuevo.');
      }
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }
}
