import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import {
  LucideAngularModule,
  Briefcase,
  Mail,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  Grid3x3,
  List,
  MapPin,
  Calendar,
  Building2,
  User,
  Edit2,
  LogOut,
  Trash2
} from 'lucide-angular';
import { SavedJobService } from '../../../services/saved-job.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

interface SavedJob {
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
}

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './saved-jobs.component.html',
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({ opacity: 0, transform: 'translateY(30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [animate('0.6s ease-out')])
    ]),
    trigger('fadeInCards', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [animate('0.6s 0.2s ease-out')])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ]),
    trigger('cardRemove', [
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class SavedJobsComponent implements AfterViewInit, OnInit {
  @ViewChild('headerSection') headerSection!: ElementRef;
  @ViewChild('cardsSection') cardsSection!: ElementRef;

  headerVisible = false;
  cardsVisible = false;
  isLoading = signal(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private savedJobService: SavedJobService,
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

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
          name: user.fullName?.charAt(0) || 'U',
          fullName: user.fullName,
          email: user.email
        }));
      }
    });
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
          name: fullName.charAt(0),
          fullName: fullName,
          email: userInfo.email || '',
          role: 'Job Seeker',
          avatar: avatarUrl
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });

    // Load saved jobs
    this.loadSavedJobs();
  }

  loadSavedJobs() {
    this.isLoading.set(true);
    this.savedJobService.getSavedJobs().subscribe({
      next: (response: any) => {
        console.log('Saved jobs response:', response);
        const data = response.data || response;
        const jobsArray = data.savedJobs || data.jobs || [];
        
        const mappedJobs: SavedJob[] = jobsArray.map((item: any) => {
          const job = item.job || item;
          
          // Format salary
          let salaryDisplay = 'Competitive';
          if (job.salaryMin && job.salaryMax) {
            const currency = job.salaryCurrency || '$';
            salaryDisplay = `${currency}${job.salaryMin / 1000}k/${job.salaryPeriod || 'yr'}`;
          }
          
          return {
            id: job.id,
            title: job.title || 'Untitled',
            company: job.company?.name || 'Unknown Company',
            companyLogo: job.company?.logo || null,
            logoColor: 'bg-blue-500',
            location: job.location || 'Remote',
            type: this.formatJobType(job.type || 'full_time'),
            category: job.category || 'General',
            postedDate: job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently',
            salary: salaryDisplay
          };
        });
        
        this.savedJobs.set(mappedJobs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load saved jobs', err);
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

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    const observerOptions = { threshold: 0.1 };

    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.headerVisible = true;
          headerObserver.disconnect();
        }
      });
    }, observerOptions);

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.cardsVisible = true;
          cardsObserver.disconnect();
        }
      });
    }, observerOptions);

    if (this.headerSection) headerObserver.observe(this.headerSection.nativeElement);
    if (this.cardsSection) cardsObserver.observe(this.cardsSection.nativeElement);
  }
  // Icons
  readonly Briefcase = Briefcase;
  readonly Mail = Mail;
  readonly Bookmark = Bookmark;
  readonly ChevronDown = ChevronDown;
  readonly ChevronLeft = ChevronLeft;
  readonly Grid3x3 = Grid3x3;
  readonly List = List;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly Building2 = Building2;
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

  // User info
  user = signal({
    name: 'M',
    fullName: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    role: 'Job Seeker',
    avatar: null as string | null
  });

  // View mode
  viewMode = signal<'grid' | 'list'>('grid');

  // Saved jobs - loaded from backend
  savedJobs = signal<SavedJob[]>([]);

  savedJobsCount = computed(() => this.savedJobs().length);

  // Trash icon
  readonly Trash2 = Trash2;

  removeFromSaved(jobId: string) {
    this.savedJobService.unsaveJob(jobId).subscribe({
      next: () => {
        this.savedJobs.update(jobs => jobs.filter(j => j.id !== jobId));
      },
      error: (err) => {
        console.error('Failed to remove saved job', err);
        alert('Failed to remove job from saved list.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Full-Time': return 'bg-blue-500 text-white';
      case 'Part-Time': return 'bg-purple-100 text-purple-600';
      case 'Remote': return 'bg-green-100 text-green-600';
      case 'Contract': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
