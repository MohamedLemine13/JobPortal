import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule, User, Mail, Lock, Eye, EyeOff, Upload, Search, Briefcase } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-page',
  imports: [RouterLink, LucideAngularModule, FormsModule],
  templateUrl: './signup-page.component.html',
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
export class SignupPageComponent {

  readonly User = User;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Upload = Upload;
  readonly Search = Search;
  readonly Briefcase = Briefcase;

  // Form signals
  fullName = signal('');
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  profilePicture = signal<string | null>(null);
  userRole = signal<'job_seeker' | 'employer'>('job_seeker');
  isLoading = signal(false);
  
  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  selectRole(role: 'job_seeker' | 'employer') {
    this.userRole.set(role);
  }

  classPropertyTest=signal('text-3xl bg-linear-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent  font-bold ');

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicture.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.isLoading.set(true);
    
    const request = {
      email: this.email(),
      password: this.password(),
      role: this.userRole(),
      fullName: this.fullName()
      // companyName: ... if employer, maybe add field or assume fullName is company name for now? 
      // The API reference implies companyName for employer. Ideally we should add a field for it.
      // For now, let's map fullName to companyName if employer, or just send fullName.
      // The backend DTO has companyName for employer.
    };

    // Quick fix: if employer, reuse fullName as companyName if not separate.
    // Or just send it as is.
    const payload = {
        ...request,
        ...(this.userRole() === 'employer' ? { companyName: this.fullName() } : {})
    };

    this.authService.register(payload).subscribe({
        next: (response) => {
            this.isLoading.set(false);
            // Navigate to login or dashboard
            this.router.navigate(['/login']);
        },
        error: (err) => {
            console.error('Registration failed', err);
            this.isLoading.set(false);
            alert('Registration failed. Please try again.');
        }
    });
  }
}
