import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Search, MapPin, Calendar, Bookmark, BookmarkCheck, ChevronDown, Grid3x3, List, Building2, ChevronUp, Briefcase, X, Mail, User, Edit2, LogOut } from 'lucide-angular';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
import { SavedJobService } from '../../../services/saved-job.service';
import { ApplicationService } from '../../../services/application.service';
import { ProfileService } from '../../../services/profile.service';
import { Job as ApiJob } from '../../../models/job.models';
import { User as AuthUser } from '../../../models/auth.models';
import { ChatbotComponent } from '../../../components/chatbot/chatbot.component';
import { ToastService } from '../../../services/toast.service';

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
  status: 'Apply Now' | 'Applied' | 'Accepted' | 'Rejected' | 'Interview' | 'Shortlisted';
  bookmarked: boolean;
}

@Component({
  selector: 'app-job-seeker-dashboard',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, ChatbotComponent],
  templateUrl: './job-seeker-dashboard.component.html',
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
    private savedJobService: SavedJobService,
    private applicationService: ApplicationService,
    private router: Router,
    private profileService: ProfileService,
    private toastService: ToastService
  ) { }

  // Icons
  readonly BookmarkCheck = BookmarkCheck;

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
          name: user.fullName?.split(' ')[0] || user.fullName,
          fullName: user.fullName,
          email: user.email,
          role: user.role === 'job_seeker' ? 'Job Seeker' : 'Employer'
        }));
      }
    });

    this.loadJobs();
  }

  loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const profile = data.profile || {};
        const userInfo = data.user || {};

        const avatarUrl = this.profileService.getFileUrl(profile.avatar);
        const fullName = profile.fullName || userInfo.email || 'User';

        this.user.set({
          name: fullName.split(' ')[0],
          fullName: fullName,
          email: userInfo.email || '',
          role: userInfo.role === 'job_seeker' ? 'Job Seeker' : 'Employer',
          avatar: avatarUrl
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  // Set to track saved job IDs
  savedJobIds = signal<Set<string>>(new Set());
  // Set to track applied job IDs
  appliedJobIds = signal<Set<string>>(new Set());
  // Map to track application status by job ID
  applicationStatusMap = signal<Map<string, string>>(new Map());

  loadJobs() {
    // Fetch saved jobs and applied jobs in parallel, then fetch all jobs
    this.savedJobService.getSavedJobs().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const savedJobs = data.savedJobs || [];
        const savedIds = new Set<string>(savedJobs.map((sj: any) => sj.job?.id || sj.id));
        this.savedJobIds.set(savedIds);
      },
      error: () => { }
    });

    // Fetch applied jobs with their statuses
    this.applicationService.getMyApplications().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const applications = data.applications || [];

        // Create a map of jobId -> application status
        const applicationStatusMap = new Map<string, string>();
        applications.forEach((app: any) => {
          const jobId = app.job?.id || app.jobId || '';
          applicationStatusMap.set(jobId, app.status || 'pending');
        });
        this.applicationStatusMap.set(applicationStatusMap);

        const appliedIds = new Set<string>(applications.map((app: any) => app.job?.id || app.jobId || ''));
        this.appliedJobIds.set(appliedIds);

        // Now fetch all jobs
        this.fetchAllJobs();
      },
      error: () => {
        // If fetching applications fails, still load jobs
        this.fetchAllJobs();
      }
    });
  }

  fetchAllJobs() {
    this.jobService.getJobs().subscribe({
      next: (response: any) => {
        console.log('Jobs API Response:', response);

        // Backend returns: { data: { jobs: [...], pagination: {...} } }
        const data = response.data || response;
        const jobsArray = data.jobs || data.content || (Array.isArray(data) ? data : []);
        console.log('Jobs array length:', jobsArray.length);

        const savedIds = this.savedJobIds();
        const appliedIds = this.appliedJobIds();

        const mappedJobs: Job[] = jobsArray.map((apiJob: any) => {
          // Format salary display
          let salaryDisplay = 'Competitive';
          if (apiJob.salaryMin && apiJob.salaryMax) {
            const currency = apiJob.salaryCurrency || '$';
            salaryDisplay = `${currency}${apiJob.salaryMin.toLocaleString()} - ${currency}${apiJob.salaryMax.toLocaleString()}`;
            if (apiJob.salaryPeriod) {
              salaryDisplay += ` / ${apiJob.salaryPeriod}`;
            }
          }

          const jobId = apiJob.id?.toString() || '';
          const hasApplied = appliedIds.has(jobId);
          const applicationStatusMap = this.applicationStatusMap();
          const appStatus = applicationStatusMap.get(jobId);

          // Determine display status based on application status
          let displayStatus: Job['status'] = 'Apply Now';
          if (hasApplied) {
            displayStatus = this.mapApplicationStatus(appStatus);
          }

          return {
            id: jobId,
            title: apiJob.title || 'Untitled',
            company: apiJob.company?.name || 'Unknown Company',
            companyLogo: apiJob.company?.logo || null,
            logoColor: 'bg-blue-600',
            location: apiJob.location || 'Remote',
            type: this.formatJobType(apiJob.type || 'full_time'),
            category: apiJob.category || 'General',
            postedDate: apiJob.postedAt ? new Date(apiJob.postedAt).toLocaleDateString() : 'Recently',
            salary: salaryDisplay,
            status: displayStatus,
            bookmarked: savedIds.has(jobId)
          } as Job;
        });

        console.log('Mapped jobs:', mappedJobs);
        this.jobs.set(mappedJobs);
      },
      error: (err) => console.error('Failed to load jobs', err)
    });
  }

  private mapApplicationStatus(status: string | undefined): Job['status'] {
    if (!status) return 'Applied';
    const statusMap: Record<string, Job['status']> = {
      'pending': 'Applied',
      'reviewed': 'Applied',
      'shortlisted': 'Shortlisted',
      'interview': 'Interview',
      'hired': 'Accepted',
      'rejected': 'Rejected'
    };
    return statusMap[status.toLowerCase()] || 'Applied';
  }

  private formatJobType(type: string): string {
    // Convert backend format to display format (handle both cases)
    const typeMap: Record<string, string> = {
      'full_time': 'Full-Time',
      'part_time': 'Part-Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote',
      'FULL_TIME': 'Full-Time',
      'PART_TIME': 'Part-Time',
      'CONTRACT': 'Contract',
      'INTERNSHIP': 'Internship',
      'REMOTE': 'Remote',
      'CDI': 'Full-Time',
      'CDD': 'Contract',
      'STAGE': 'Internship'
    };
    return typeMap[type] || typeMap[type?.toUpperCase()] || type || 'Full-Time';
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
      const query = this.searchQuery().toLowerCase().trim();
      result = result.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (this.locationQuery()) {
      const location = this.locationQuery().toLowerCase().trim();
      result = result.filter(job => job.location.toLowerCase().includes(location));
    }

    // Filter by job types
    if (this.selectedJobTypes().length > 0) {
      result = result.filter(job =>
        this.selectedJobTypes().some(type =>
          type.toLowerCase() === job.type.toLowerCase()
        )
      );
    }

    // Filter by categories
    if (this.selectedCategories().length > 0) {
      result = result.filter(job =>
        this.selectedCategories().some(cat =>
          cat.toLowerCase() === job.category.toLowerCase()
        )
      );
    }

    // Filter by salary range
    const minSal = parseInt(this.minSalary()) || 0;
    const maxSal = (this.maxSalary() && this.maxSalary() !== '') ? parseInt(this.maxSalary()) : Infinity;

    if (minSal > 0 || maxSal !== Infinity) {
      result = result.filter(job => {
        // Handle "Competitive" or text-only salaries
        const salaryStr = job.salary.replace(/,/g, '');
        const matches = salaryStr.match(/\d+/);

        // If no number found, only show if no strict min salary filter is set
        if (!matches) return minSal === 0;

        const salary = parseInt(matches[0]);
        return salary >= minSal && salary <= maxSal;
      });
    }

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

  toggleBookmark(jobId: string, event: Event) {
    event.stopPropagation(); // Prevent navigating to job details

    const job = this.jobs().find(j => j.id === jobId);
    if (!job) return;

    if (job.bookmarked) {
      // Unsave the job
      this.savedJobService.unsaveJob(jobId).subscribe({
        next: () => {
          this.jobs.update(jobs =>
            jobs.map(j => j.id === jobId ? { ...j, bookmarked: false } : j)
          );
          // Update savedJobIds set
          this.savedJobIds.update(ids => {
            const newIds = new Set(ids);
            newIds.delete(jobId);
            return newIds;
          });
        },
        error: (err) => console.error('Failed to unsave job', err)
      });
    } else {
      // Save the job
      this.savedJobService.saveJob(jobId).subscribe({
        next: () => {
          this.jobs.update(jobs =>
            jobs.map(j => j.id === jobId ? { ...j, bookmarked: true } : j)
          );
          // Update savedJobIds set
          this.savedJobIds.update(ids => {
            const newIds = new Set(ids);
            newIds.add(jobId);
            return newIds;
          });
        },
        error: (err) => console.error('Failed to save job', err)
      });
    }
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
    // Check if already applied
    if (this.appliedJobIds().has(jobId)) return;

    this.applicationService.applyForJob({ jobId }).subscribe({
      next: () => {
        // Update the job status in the list
        this.jobs.update(jobs =>
          jobs.map(job =>
            job.id === jobId ? { ...job, status: 'Applied' as const } : job
          )
        );
        // Update appliedJobIds set
        this.appliedJobIds.update(ids => {
          const newIds = new Set(ids);
          newIds.add(jobId);
          return newIds;
        });

        // Show success toast
        this.toastService.success('Application submitted successfully!');
      },
      error: (err) => {
        console.error('Failed to apply for job', err);
        // Show error toast
        this.toastService.error(err.error?.message || 'Failed to apply. Please try again.');
      }
    });
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

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Applied': 'bg-blue-50 text-blue-600 border-blue-100',
      'Shortlisted': 'bg-purple-50 text-purple-600 border-purple-100',
      'Interview': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'Accepted': 'bg-green-50 text-green-600 border-green-100',
      'Rejected': 'bg-red-50 text-red-600 border-red-100'
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-100';
  }
}
