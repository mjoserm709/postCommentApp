import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('postCommentApp');
  protected readonly isMobileMenuOpen = signal(false);

  constructor(protected authService: AuthService) {}

  protected toggleMobileMenu() {
    this.isMobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
