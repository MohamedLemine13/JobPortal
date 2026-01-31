import { Component, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  LucideAngularModule,
  Briefcase,
  LayoutDashboard,
  Plus,
  FileText,
  Building2,
  LogOut,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Eye,
  ArrowLeft,
  Send,
  ChevronDown,
  Menu,
  X,
  Mail,
  Edit3,
  CircleCheck,
  CircleX
} from 'lucide-angular';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { CreateJobRequest } from '../../../models/job.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-job',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  templateUrl: './post-job.component.html',
  // ... (animations)
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('sidebarSlide', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('toastSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('successModal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class PostJobComponent implements OnInit {
  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly LogOut = LogOut;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly DollarSign = DollarSign;
  readonly Eye = Eye;
  readonly ArrowLeft = ArrowLeft;
  readonly Send = Send;
  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly X = X;
  readonly Mail = Mail;
  readonly Edit3 = Edit3;
  readonly CircleCheck = CircleCheck;
  readonly CircleX = CircleX;

  // Success modal state
  isSuccessModalOpen = signal(false);
  publishedJobTitle = signal('');
  jobId = signal<string | null>(null);

  // Toast notification
  toast = signal<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user profile with avatar
    this.loadUserProfile();

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.update(u => ({
          ...u,
          name: user.fullName,
          email: user.email
        }));
      }
    });

    // Check for edit mode
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.jobId.set(params['id']);
        this.loadJobDetails(params['id']);
      }
    });

  }

  loadJobDetails(id: string) {
    this.jobService.getJob(id).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const job = data.job || data;

        this.jobTitle.set(job.title);
        this.location.set(job.location);
        this.category.set(job.category);
        this.jobType.set(this.formatJobTypeInverse(job.type));
        this.description.set(job.description);
        this.requirements.set(job.requirements ? job.requirements.join('\n') : '');
        this.salaryMin.set(job.salaryMin);
        this.salaryMax.set(job.salaryMax);
      },
      error: (err) => {
        console.error('Failed to load job details', err);
        this.showToast('Failed to load job details', 'error');
      }
    });
  }

  formatJobTypeInverse(type: string): string {
    // Convert "FULL_TIME" back to "Full-Time" for matching select options
    if (!type) return '';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('-');
  }

  loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const profile = data.profile || {};
        const userInfo = data.user || {};

        const avatarUrl = this.profileService.getFileUrl(profile.avatar);

        this.user.set({
          name: profile.fullName || profile.companyName || userInfo.email || 'User',
          email: userInfo.email || '',
          role: 'Employer',
          avatar: avatarUrl
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Mobile menu state
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  // User info
  user = signal({
    name: '',
    email: '',
    role: 'Employer',
    avatar: null as string | null
  });

  // Navigation items
  readonly navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/employer-dashbord', active: false },
    { icon: Plus, label: 'Post Job', route: '/employer-dashbord/post-job', active: true },
    { icon: FileText, label: 'Manage Jobs', route: '/employer-dashbord/manage-jobs', active: false },
    { icon: Building2, label: 'Company Profile', route: '/employer-dashbord/company-profile', active: false },
    { icon: Mail, label: 'Messages', route: '/employer-dashbord/messages', active: false },
  ];

  // Form fields
  jobTitle = signal('');
  location = signal('');
  category = signal('');
  jobType = signal('');
  description = signal('');
  requirements = signal('');
  salaryMin = signal('');
  salaryMax = signal('');

  // Preview mode
  isPreviewMode = signal(false);

  // Dropdown options
  readonly categories = [
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'Finance',
    'Human Resources',
    'Operations',
    'Customer Service'
  ];

  readonly jobTypes = [
    'Full-Time',
    'Part-Time',
    'Contract',
    'Internship',
    'Remote'
  ];

  // Computed values
  salaryRange = computed(() => {
    const min = this.salaryMin();
    const max = this.salaryMax();
    if (min && max) {
      return `${min} - ${max} per year`;
    }
    return 'Not specified';
  });

  togglePreview() {
    this.isPreviewMode.update(v => !v);
  }

  updateField(field: string, event: Event) {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    switch (field) {
      case 'jobTitle': this.jobTitle.set(value); break;
      case 'location': this.location.set(value); break;
      case 'category': this.category.set(value); break;
      case 'jobType': this.jobType.set(value); break;
      case 'description': this.description.set(value); break;
      case 'requirements': this.requirements.set(value); break;
      case 'salaryMin': this.salaryMin.set(value); break;
      case 'salaryMax': this.salaryMax.set(value); break;
    }
  }

  publishJob() {
    // Validate required fields
    if (!this.jobTitle()) {
      this.showToast('Please enter a job title', 'error');
      return;
    }
    if (!this.location()) {
      this.showToast('Please enter a location', 'error');
      return;
    }
    if (!this.category()) {
      this.showToast('Please select a category', 'error');
      return;
    }
    if (!this.jobType()) {
      this.showToast('Please select a job type', 'error');
      return;
    }
    if (!this.description()) {
      this.showToast('Please enter a job description', 'error');
      return;
    }
    if (!this.salaryMin() || !this.salaryMax()) {
      this.showToast('Please enter a valid salary range', 'error');
      return;
    }

    // Numeric validation for salary
    const minSal = parseInt(this.salaryMin());
    const maxSal = parseInt(this.salaryMax());

    if (isNaN(minSal) || isNaN(maxSal)) {
      this.showToast('Salary must be a number', 'error');
      return;
    }

    if (minSal >= maxSal) {
      this.showToast('Minimum salary must be smaller than maximum salary', 'error');
      return;
    }

    const request: CreateJobRequest = {
      title: this.jobTitle(),
      location: this.location(),
      type: this.jobType().toUpperCase().replace('-', '_'), // Convert "Full-Time" to "FULL_TIME"
      description: this.description(),
      requirements: this.requirements().split('\n').filter(r => r.trim().length > 0),
      skills: [], // Add skills field to form or defaults
      salaryMin: minSal,
      salaryMax: maxSal,
      salaryCurrency: 'USD',
      category: this.category()
    };

    console.log(this.jobId() ? 'Updating job:' : 'Publishing job:', request);

    if (this.jobId()) {
      this.jobService.updateJob(this.jobId()!, request).subscribe({
        next: (job) => {
          this.publishedJobTitle.set(this.jobTitle());
          this.showToast('Job updated successfully', 'success');
          setTimeout(() => {
            this.router.navigate(['/employer-dashbord/manage-jobs']);
          }, 1500);
        },
        error: (err) => {
          console.error('Failed to update job', err);
          this.showToast('Failed to update job. Please check your inputs and try again.', 'error');
        }
      });
    } else {
      this.jobService.createJob(request).subscribe({
        next: (job) => {
          this.publishedJobTitle.set(this.jobTitle());
          this.isSuccessModalOpen.set(true);
          // Auto-redirect after 3 seconds
          setTimeout(() => {
            this.closeSuccessAndNavigate();
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to publish job', err);
          this.showToast('Failed to publish job. Please check your inputs and try again.', 'error');
        }
      });
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toast.set({ message, type, visible: true });
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.toast.update(t => ({ ...t, visible: false }));
  }

  closeSuccessAndNavigate() {
    this.isSuccessModalOpen.set(false);
    this.router.navigate(['/employer-dashbord/manage-jobs']);
  }
}
