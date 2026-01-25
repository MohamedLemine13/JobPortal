import { Component, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  Edit3
} from 'lucide-angular';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
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

  constructor(
    private jobService: JobService, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.update(u => ({
          ...u,
          name: user.fullName || u.name,
          email: user.email || u.email,
          role: user.role === 'employer' ? 'Employer' : 'Job Seeker'
        }));
      }
    });

    if (!this.authService.getToken()) {
        this.router.navigate(['/login']);
    } else {
        this.authService.fetchProfile().subscribe();
    }
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
    name: 'John Davis',
    email: 'f@gmail.com',
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
        alert('Please enter a job title');
        return;
    }
    if (!this.location()) {
        alert('Please enter a location');
        return;
    }
    if (!this.category()) {
        alert('Please select a category');
        return;
    }
    if (!this.jobType()) {
        alert('Please select a job type');
        return;
    }
    if (!this.description()) {
        alert('Please description the job');
        return;
    }
    if (!this.salaryMin() || !this.salaryMax()) {
        alert('Please enter a valid salary range');
        return;
    }

    const request: CreateJobRequest = {
      title: this.jobTitle(),
      location: this.location(),
      type: this.jobType().toUpperCase().replace('-', '_'), // Convert "Full-Time" to "FULL_TIME"
      description: this.description(),
      requirements: this.requirements().split('\n').filter(r => r.trim().length > 0),
      skills: [], // Add skills field to form or defaults
      salaryMin: parseInt(this.salaryMin()) || 0,
      salaryMax: parseInt(this.salaryMax()) || 0,
      salaryCurrency: 'USD',
      category: this.category()
    };

    console.log('Publishing job:', request);

    this.jobService.createJob(request).subscribe({
      next: (job) => {
        alert('Job published successfully!');
        this.router.navigate(['/employer-dashbord']);
      },
      error: (err) => {
        console.error('Failed to publish job', err);
        alert('Failed to publish job. Please check your inputs and try again.');
      }
    });
  }
}
