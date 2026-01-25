import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Search, MapPin, Calendar, Bookmark, ChevronDown, Grid3x3, List, Building2, ChevronUp, Briefcase, X, Mail, User, Edit2, LogOut } from 'lucide-angular';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
import { Job as ApiJob } from '../../../models/job.models';
import { User as AuthUser } from '../../../models/auth.models';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  logoColor: string;
  location: string;
  type: string;
  category: string;
  postedDate: string;
  salary: string;
  status: 'Apply Now' | 'Applied' | 'Accepted';
  bookmarked: boolean;
}

@Component({
  selector: 'app-job-seeker-dashboard',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './job-seeker-dashboard.component.html',
  // ... (keep animations as is)
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({ opacity: 0, transform: 'translateY(30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [animate('0.6s ease-out')])
    ]),
    trigger('fadeInLeft', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', [animate('0.6s ease-out')])
    ]),
    trigger('fadeInRight', [
      state('hidden', style({ opacity: 0, transform: 'translateX(30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', [animate('0.6s ease-out')])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class JobSeekerDashboardComponent implements AfterViewInit, OnInit {
  // ... (keep ViewChilds and cleanup)
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('filtersSection') filtersSection!: ElementRef;
  @ViewChild('jobsSection') jobsSection!: ElementRef;

  heroVisible = false;
  filtersVisible = false;
  jobsVisible = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set({
          name: user.fullName.split(' ')[0], // First name or full name
          fullName: user.fullName,
          email: user.email,
          role: user.role === 'job_seeker' ? 'Job Seeker' : 'Employer',
          avatar: null
        });
      }
    });

    // If no user in state (page refresh), try to fetch it
    if (!this.authService.getToken()) {
        this.router.navigate(['/login']);
    } else {
         this.authService.fetchProfile().subscribe();
    }
  }

  // ... (keep loadJobs and setupIntersectionObserver)

  loadJobs() {
    this.jobService.getJobs().subscribe({
      next: (response: any) => {
        console.log('Jobs API Response:', response);
        
        // Handle both array response (backend) and wrapped response (expected)
        const jobsArray = Array.isArray(response) ? response : (response.content || response.data || []);
        console.log('Jobs array length:', jobsArray.length);
        
        const mappedJobs: Job[] = jobsArray.map((apiJob: any) => {
          console.log('Mapping job:', apiJob);
          return {
            id: apiJob.id?.toString() || '',
            title: apiJob.title || 'Untitled',
            // Backend: employer is a relation object, try to get company name
            company: apiJob.employer?.companyName || apiJob.employer?.user?.fullName || apiJob.companyName || 'Unknown Company',
            companyLogo: null,
            logoColor: 'bg-blue-600',
            location: apiJob.location || 'Remote',
            // Backend uses typeContrat field
            type: this.formatJobType(apiJob.typeContrat || apiJob.type || 'FULL_TIME'),
            // Backend: category is a relation object
            category: apiJob.category?.name || 'General',
            postedDate: apiJob.createdAt ? new Date(apiJob.createdAt).toLocaleDateString() : 
                        apiJob.postedAt ? new Date(apiJob.postedAt).toLocaleDateString() : 'Recently',
            // Backend uses salaryRange as a string
            salary: apiJob.salaryRange || 'Competitive',
            status: 'Apply Now',
            bookmarked: false
          };
        });
        
        console.log('Mapped jobs:', mappedJobs);
        this.jobs.set(mappedJobs);
      },
      error: (err) => console.error('Failed to load jobs', err)
    });
  }

  private formatJobType(type: string): string {
    // Convert backend format to display format
    const typeMap: Record<string, string> = {
      'FULL_TIME': 'Full-Time',
      'PART_TIME': 'Part-Time',
      'CONTRACT': 'Contract',
      'INTERNSHIP': 'Internship',
      'REMOTE': 'Remote',
      'CDI': 'Full-Time',
      'CDD': 'Contract',
      'STAGE': 'Internship'
    };
    return typeMap[type?.toUpperCase()] || type || 'Full-Time';
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    const observerOptions = { threshold: 0.1 };

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.heroVisible = true;
          heroObserver.disconnect();
        }
      });
    }, observerOptions);

    const filtersObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.filtersVisible = true;
          filtersObserver.disconnect();
        }
      });
    }, observerOptions);

    const jobsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.jobsVisible = true;
          jobsObserver.disconnect();
        }
      });
    }, observerOptions);

    if (this.heroSection) heroObserver.observe(this.heroSection.nativeElement);
    if (this.filtersSection) filtersObserver.observe(this.filtersSection.nativeElement);
    if (this.jobsSection) jobsObserver.observe(this.jobsSection.nativeElement);
  }

  // Icons
  readonly Search = Search;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly Bookmark = Bookmark;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Grid3x3 = Grid3x3;
  readonly List = List;
  readonly Building2 = Building2;
  readonly X = X;
  readonly Briefcase = Briefcase;
  readonly Mail = Mail;
  readonly User = User;
  readonly Edit2 = Edit2;
  readonly LogOut = LogOut;

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

  // User info
  user = signal({
    name: '',
    fullName: '',
    email: '',
    role: '',
    avatar: null as string | null
  });

  // Search state
  searchQuery = signal('');
  locationQuery = signal('');

  // View mode
  viewMode = signal<'grid' | 'list'>('grid');

  // Filter panel states
  jobTypeExpanded = signal(true);
  salaryRangeExpanded = signal(true);
  categoryExpanded = signal(true);

  // Filter values
  selectedJobTypes = signal<string[]>([]);
  minSalary = signal('0');
  maxSalary = signal('');
  selectedCategories = signal<string[]>([]);

  // Filter options
  readonly jobTypes = ['Remote', 'Full-Time', 'Part-Time', 'Contract', 'Internship'];
  readonly categories = [
    'Engineering', 'Design', 'Marketing', 'Sales', 'IT & Software',
    'Customer-service', 'Product', 'Operations', 'Finance', 'HR', 'Other'
  ];

  // Sample jobs data
  jobs = signal<Job[]>([]);

  // Filtered jobs
  filteredJobs = computed(() => {
    let result = this.jobs();

    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (this.locationQuery()) {
      const location = this.locationQuery().toLowerCase();
      result = result.filter(job => job.location.toLowerCase().includes(location));
    }

    // Filter by job types
    if (this.selectedJobTypes().length > 0) {
      result = result.filter(job => this.selectedJobTypes().includes(job.type));
    }

    // Filter by categories
    if (this.selectedCategories().length > 0) {
      result = result.filter(job => this.selectedCategories().includes(job.category));
    }

    // Filter by salary range
    const minSal = parseInt(this.minSalary()) || 0;
    const maxSal = parseInt(this.maxSalary()) || Infinity;
    result = result.filter(job => {
      const salary = parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
      return salary >= minSal && salary <= maxSal;
    });

    return result;
  });

  // Toggle functions
  toggleJobType(type: string) {
    this.selectedJobTypes.update(types =>
      types.includes(type)
        ? types.filter(t => t !== type)
        : [...types, type]
    );
  }

  toggleCategory(category: string) {
    this.selectedCategories.update(cats =>
      cats.includes(category)
        ? cats.filter(c => c !== category)
        : [...cats, category]
    );
  }

  toggleBookmark(jobId: string) {
    this.jobs.update(jobs =>
      jobs.map(job =>
        job.id === jobId ? { ...job, bookmarked: !job.bookmarked } : job
      )
    );
  }

  clearAllFilters() {
    this.selectedJobTypes.set([]);
    this.selectedCategories.set([]);
    this.minSalary.set('0');
    this.maxSalary.set('');
    this.searchQuery.set('');
    this.locationQuery.set('');
  }

  applyForJob(jobId: string) {
    this.jobs.update(jobs =>
      jobs.map(job =>
        job.id === jobId ? { ...job, status: 'Applied' as const } : job
      )
    );
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Remote': 'bg-green-100 text-green-700',
      'Full-Time': 'bg-blue-100 text-blue-700',
      'Part-Time': 'bg-purple-100 text-purple-700',
      'Contract': 'bg-orange-100 text-orange-700',
      'Internship': 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }
}
