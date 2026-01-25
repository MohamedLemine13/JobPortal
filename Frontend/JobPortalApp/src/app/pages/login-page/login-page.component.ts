import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, FormsModule],
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
    ])
  ]
})
export class LoginPageComponent {
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);

  // IMPORTANT: choose role (temporary default: jobseeker)
  role = signal<'employer' | 'job_seeker'>('job_seeker');

  constructor(private router: Router, private authService: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    this.isLoading.set(true);

    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (response) => {
        // Fetch profile to ensure we have the role
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                const target = user.role === 'employer' ? '/employer-dashbord' : '/find-jobs';
                this.router.navigateByUrl(target);
                this.isLoading.set(false);
            }
        });
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading.set(false);
        alert('Invalid credentials. Please try again.');
      }
    });
  }
}
