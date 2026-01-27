import { Component, signal, OnInit, inject, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Briefcase, ChevronLeft, ChevronDown, MapPin, Clock, DollarSign, Users, Calendar, Bookmark, Share2, Building2, Mail, User, Edit2, LogOut, BookmarkCheck } from 'lucide-angular';
import { JobService } from '../../../services/job.service';
import { SavedJobService } from '../../../services/saved-job.service';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';

interface JobDetails {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  type: string;
  category: string;
  postedDate: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  experienceLevel: string;
  logoColor: string;
  companyLogo: string | null;
  hasApplied: boolean;
  isSaved: boolean;
}

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './job-details.component.html',
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({ opacity: 0, transform: 'translateY(30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [animate('0.6s ease-out')])
    ]),
    trigger('fadeInLeft', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', [animate('0.5s 0.2s ease-out')])
    ]),
    trigger('fadeInRight', [
      state('hidden', style({ opacity: 0, transform: 'translateX(30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', [animate('0.5s 0.3s ease-out')])
    ]),
    trigger('scaleIn', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [animate('0.5s 0.1s ease-out')])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ])
  ]
})
export class JobDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('mainContent') mainContent!: ElementRef;
  @ViewChild('descriptionSection') descriptionSection!: ElementRef;

  mainVisible = false;
  descriptionVisible = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private jobService: JobService,
    private savedJobService: SavedJobService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    const observerOptions = { threshold: 0.1 };

    const mainObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.mainVisible = true;
          mainObserver.disconnect();
        }
      });
    }, observerOptions);

    const descObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.descriptionVisible = true;
          descObserver.disconnect();
        }
      });
    }, observerOptions);

    if (this.mainContent) mainObserver.observe(this.mainContent.nativeElement);
    if (this.descriptionSection) descObserver.observe(this.descriptionSection.nativeElement);
  }
  private route = inject(ActivatedRoute);

  // Icons
  readonly Briefcase = Briefcase;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronDown = ChevronDown;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly Bookmark = Bookmark;
  readonly BookmarkCheck = BookmarkCheck;
  readonly Share2 = Share2;
  readonly Building2 = Building2;
  readonly Mail = Mail;
  readonly User = User;
  readonly Edit2 = Edit2;
  readonly LogOut = LogOut;

  // Loading states
  isLoading = signal(false);
  isApplying = signal(false);
  isSaving = signal(false);

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  user = signal({
    name: 'M',
    fullName: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    role: 'Job Seeker',
    avatar: null as string | null
  });


  job = signal<JobDetails | null>(null);

  ngOnInit() {
    // Check authentication
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user info
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set({
          name: user.fullName?.charAt(0) || 'U',
          fullName: user.fullName,
          email: user.email,
          role: 'Job Seeker',
          avatar: null
        });
      }
    });

    // Fetch job details
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadJobDetails(id);
    }
  }

  loadJobDetails(jobId: string) {
    this.isLoading.set(true);
    this.jobService.getJob(jobId).subscribe({
      next: (response: any) => {
        console.log('Job details response:', response);
        const data = response.data || response;
        const jobData = data.job || data;
        
        // Format salary
        let salaryDisplay = 'Competitive';
        if (jobData.salaryMin && jobData.salaryMax) {
          const currency = jobData.salaryCurrency || '$';
          salaryDisplay = `${currency}${jobData.salaryMin.toLocaleString()} - ${currency}${jobData.salaryMax.toLocaleString()}`;
          if (jobData.salaryPeriod) {
            salaryDisplay += ` / ${jobData.salaryPeriod}`;
          }
        }

        this.job.set({
          id: jobData.id,
          title: jobData.title || 'Untitled',
          company: jobData.company?.name || 'Unknown Company',
          companyId: jobData.company?.id,
          location: jobData.location || 'Remote',
          type: this.formatJobType(jobData.type || 'full_time'),
          category: jobData.category || 'General',
          postedDate: jobData.postedAt ? new Date(jobData.postedAt).toLocaleDateString() : 'Recently',
          salary: salaryDisplay,
          description: jobData.description || '',
          requirements: jobData.requirements || [],
          skills: jobData.skills || [],
          benefits: jobData.benefits || [],
          experienceLevel: jobData.experienceLevel || 'Not specified',
          logoColor: 'bg-blue-600',
          companyLogo: jobData.company?.logo || null,
          hasApplied: data.hasApplied || false,
          isSaved: data.isSaved || false
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load job details', err);
        this.isLoading.set(false);
      }
    });
  }

  private formatJobType(type: string): string {
    const typeMap: Record<string, string> = {
      'full_time': 'Full-Time',
      'part_time': 'Part-Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote'
    };
    return typeMap[type] || typeMap[type?.toLowerCase()] || type || 'Full-Time';
  }

  // Save/Unsave job
  toggleSaveJob() {
    const currentJob = this.job();
    if (!currentJob) return;

    this.isSaving.set(true);
    
    if (currentJob.isSaved) {
      this.savedJobService.unsaveJob(currentJob.id).subscribe({
        next: () => {
          this.job.update(j => j ? { ...j, isSaved: false } : j);
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Failed to unsave job', err);
          this.isSaving.set(false);
        }
      });
    } else {
      this.savedJobService.saveJob(currentJob.id).subscribe({
        next: () => {
          this.job.update(j => j ? { ...j, isSaved: true } : j);
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Failed to save job', err);
          this.isSaving.set(false);
        }
      });
    }
  }

  // Apply for job
  applyForJob() {
    const currentJob = this.job();
    if (!currentJob || currentJob.hasApplied) return;

    this.isApplying.set(true);
    
    this.applicationService.applyForJob({ jobId: currentJob.id }).subscribe({
      next: () => {
        this.job.update(j => j ? { ...j, hasApplied: true } : j);
        this.isApplying.set(false);
        alert('Application submitted successfully!');
      },
      error: (err) => {
        console.error('Failed to apply for job', err);
        this.isApplying.set(false);
        alert('Failed to submit application. Please try again.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
