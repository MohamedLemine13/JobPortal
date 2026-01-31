import { Component, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, AlertCircle, XCircle } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, FormsModule, CommonModule],
  templateUrl: './login-page.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ]),
    trigger('errorSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }))
      ])
    ]),
    trigger('shake', [
      transition('* => shake', [
        animate('0.5s', style({ transform: 'translateX(0)' })),
        animate('0.1s', style({ transform: 'translateX(-10px)' })),
        animate('0.1s', style({ transform: 'translateX(10px)' })),
        animate('0.1s', style({ transform: 'translateX(-10px)' })),
        animate('0.1s', style({ transform: 'translateX(10px)' })),
        animate('0.1s', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class LoginPageComponent {
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly AlertCircle = AlertCircle;
  readonly XCircle = XCircle;

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showError = signal(false);
  shakeState = signal('');

  // Computed property to check if it's a lockout error
  isLockoutError = computed(() => {
    const msg = this.errorMessage();
    return msg ? msg.toLowerCase().includes('locked') : false;
  });

  // Computed property to check if it's an attempts warning
  isAttemptsWarning = computed(() => {
    const msg = this.errorMessage();
    return msg ? msg.toLowerCase().includes('attempt') : false;
  });

  // IMPORTANT: choose role (temporary default: jobseeker)
  role = signal<'employer' | 'job_seeker'>('job_seeker');

  constructor(private router: Router, private authService: AuthService) { }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  clearError() {
    this.showError.set(false);
    this.errorMessage.set(null);
  }

  onSubmit() {
    // Clear previous error
    this.clearError();
    this.isLoading.set(true);

    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (response) => {
        // Wait for user profile to be loaded, then redirect ONCE
        this.authService.currentUser$.pipe(
          filter(user => user !== null),
          take(1) // Only take the first emission to prevent repeated redirects
        ).subscribe(user => {
          if (user) {
            let target = '/find-jobs';
            const role = user.role?.toUpperCase();
            if (role === 'ADMIN') {
              target = '/admin-dashboard';
            } else if (role === 'EMPLOYER') {
              target = '/employer-dashbord';
            }
            this.isLoading.set(false);
            this.router.navigateByUrl(target);
          }
        });
      },
      error: (err) => {
        console.error('Login failed - Full error:', err);
        console.error('Error body:', err.error);
        console.error('Error status:', err.status);
        this.isLoading.set(false);

        // Extract error message from response
        // API returns: { success: false, error: { code: "...", message: "..." } }
        let message = 'An error occurred. Please try again.';

        if (err.error) {
          console.log('Parsing error response:', JSON.stringify(err.error));
          if (err.error.error?.message) {
            message = err.error.error.message;
          } else if (err.error.message) {
            message = err.error.message;
          } else if (typeof err.error === 'string') {
            message = err.error;
          }
        }

        console.log('Final error message:', message);
        this.errorMessage.set(message);
        this.showError.set(true);
        // Trigger shake animation
        this.shakeState.set('shake');
        setTimeout(() => this.shakeState.set(''), 600);
      }
    });
  }
}
