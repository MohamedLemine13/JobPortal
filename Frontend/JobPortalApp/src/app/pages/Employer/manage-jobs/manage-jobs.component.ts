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
  Search,
  Users,
  Edit,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Check,
  CircleCheck,
  CircleX,
  Menu,
  Mail,
  Edit3
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-manage-jobs',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './manage-jobs.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
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
export class ManageJobsComponent implements OnInit {
  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly Users = Users;
  readonly Edit = Edit;
  readonly X = X;
  readonly Trash2 = Trash2;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly ArrowUpDown = ArrowUpDown;
  readonly Check = Check;
  readonly CircleCheck = CircleCheck;
  readonly CircleX = CircleX;
  readonly Menu = Menu;
  readonly Mail = Mail;
  readonly Edit3 = Edit3;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private jobService: JobService
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
        this.fetchJobs();
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

  // Toast notification
  toast = signal<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

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
    { icon: Plus, label: 'Post Job', route: '/employer-dashbord/post-job', active: false },
    { icon: FileText, label: 'Manage Jobs', route: '/employer-dashbord/manage-jobs', active: true },
    { icon: Building2, label: 'Company Profile', route: '/employer-dashbord/company-profile', active: false },
    { icon: Mail, label: 'Messages', route: '/employer-dashbord/messages', active: false },
  ];

  // Search and filter
  searchQuery = signal('');
  statusFilter = signal('all');

  // Sort state
  sortColumn = signal<'title' | 'status' | 'applicants'>('title');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Jobs data
  jobs = signal<any[]>([]);

  fetchJobs() {
    console.log('Fetching employer jobs...');
    this.jobService.getEmployerJobs().subscribe({
        next: (response: any) => {
            console.log('Raw API Response:', response);
            // Handle wrapped response (ApiResponse wrapper)
            const data = response.data || response;
            console.log('Extracted data:', data);
            
            const jobsArray = data.jobs || data.content || [];
            console.log('Jobs array:', jobsArray);
            
            if (jobsArray.length > 0) {
                // Map backend DTO to frontend structure
                const mappedJobs = jobsArray.map((j: any) => ({
                    id: j.id,
                    title: j.title,
                    author: j.company?.name || 'Me',
                    status: (j.status || 'active').toLowerCase() === 'active' ? 'active' : (j.status || '').toLowerCase(),
                    applicants: j.applicantsCount || 0,
                    location: j.location,
                    views: j.viewsCount || 0
                }));
                console.log('Mapped jobs:', mappedJobs);
                this.jobs.set(mappedJobs);
            } else {
                console.log('No jobs found in response');
            }
        },
        error: (err: any) => console.error('Failed to fetch employer jobs', err)
    });
  }

  // Computed filtered and sorted jobs
  filteredJobs = computed(() => {
    let result = this.jobs();
    
    // Filter by search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.author.toLowerCase().includes(query)
      );
    }
    
    // Filter by status
    const status = this.statusFilter();
    if (status !== 'all') {
      result = result.filter(job => job.status === status);
    }
    
    // Sort
    const column = this.sortColumn();
    const direction = this.sortDirection();
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (column === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (column === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (column === 'applicants') {
        comparison = a.applicants - b.applicants;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    
    return result;
  });

  totalJobs = computed(() => this.filteredJobs().length);

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  updateStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
  }

  toggleSort(column: 'title' | 'status' | 'applicants') {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  editJob(jobId: number) {
    console.log('Edit job:', jobId);
  }

  closeJob(jobId: number) {
    const job = this.jobs().find(j => j.id === jobId);
    this.jobs.update(jobs => 
      jobs.map(j => j.id === jobId ? { ...j, status: 'closed' } : j)
    );
    this.showToast(`"${job?.title}" has been closed`, 'info');
  }

  activateJob(jobId: number) {
    const job = this.jobs().find(j => j.id === jobId);
    this.jobs.update(jobs => 
      jobs.map(j => j.id === jobId ? { ...j, status: 'active' } : j)
    );
    this.showToast(`"${job?.title}" has been activated`, 'success');
  }

  deleteJob(jobId: number) {
    const job = this.jobs().find(j => j.id === jobId);
    this.jobs.update(jobs => jobs.filter(j => j.id !== jobId));
    this.showToast(`"${job?.title}" has been removed`, 'error');
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toast.set({ message, type, visible: true });
    setTimeout(() => {
      this.toast.update(t => ({ ...t, visible: false }));
    }, 3000);
  }

  hideToast() {
    this.toast.update(t => ({ ...t, visible: false }));
  }
}
