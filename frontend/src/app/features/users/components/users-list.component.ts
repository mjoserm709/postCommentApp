import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UsersService } from '../services/users.service';
import { User } from '../data/user.interfaces';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            placeholder="Buscar por usuario o email..." 
            [(ngModel)]="searchInput"
            (ngModelChange)="onSearchChange($event)"
          />
        </div>
      </div>

      <div *ngIf="isLoading()" class="alert alert-info">Cargando usuarios...</div>
      <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

      <div class="row" *ngIf="!isLoading()">
        <div class="col-md-4 mb-4" *ngFor="let user of filteredUsers()">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ user.firstName }} {{ user.lastName }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">&#64;{{ user.username }}</h6>
              <p class="card-text">
                <strong>Email:</strong> {{ user.email }}<br/>
                <strong>Roles:</strong> <span class="badge bg-primary me-1" *ngFor="let role of user.roles">{{ role }}</span>
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
        
        <div class="col-12 text-center text-muted" *ngIf="filteredUsers().length === 0 && !error()">
          <p>No se encontraron usuarios.</p>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);

  // Signals
  users = signal<User[]>([]);
  search = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed Signal for real-time filtering
  filteredUsers = computed(() => 
    this.users().filter(u => 
      u.username.toLowerCase().includes(this.search().toLowerCase()) ||
      u.email.toLowerCase().includes(this.search().toLowerCase()) ||
      u.firstName.toLowerCase().includes(this.search().toLowerCase())
    )
  );

  // RxJS Subject for input debouncing
  private searchSubject = new Subject<string>();
  searchInput = '';

  ngOnInit() {
    this.loadUsers();

    // RxJS: switchMap y delay (debounceTime)
    this.searchSubject.pipe(
      debounceTime(300),
      tap(searchTerm => this.search.set(searchTerm))
    ).subscribe();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.usersService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la lista de usuarios. Por favor, inténtelo de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }
}
