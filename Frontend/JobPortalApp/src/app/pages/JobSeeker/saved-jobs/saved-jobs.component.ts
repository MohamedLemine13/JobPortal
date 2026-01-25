import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  LogOut
} from 'lucide-angular';

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
export class SavedJobsComponent implements AfterViewInit {
  @ViewChild('headerSection') headerSection!: ElementRef;
  @ViewChild('cardsSection') cardsSection!: ElementRef;

  headerVisible = false;
  cardsVisible = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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

  // Saved jobs
  savedJobs = signal<SavedJob[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechNova Solutions',
      companyLogo: null,
      logoColor: 'bg-blue-500',
      location: 'San Francisco, USA',
      type: 'Full-Time',
      category: 'IT & Software',
      postedDate: '5th Jul 2025',
      salary: '$60k/m'
    },
    {
      id: '2',
      title: 'UX/UI Designer',
      company: 'BlueGrid Technologies',
      companyLogo: null,
      logoColor: 'bg-cyan-500',
      location: 'Berlin, Germany',
      type: 'Full-Time',
      category: 'Design',
      postedDate: '5th Jul 2025',
      salary: '$65k/m'
    },
    {
      id: '3',
      title: 'Digital Marketing Specialist',
      company: 'PixelForge Studios',
      companyLogo: null,
      logoColor: 'bg-gray-800',
      location: 'London, UK',
      type: 'Full-Time',
      category: 'Marketing',
      postedDate: '5th Jul 2025',
      salary: '$55k/m'
    }
  ]);

  savedJobsCount = computed(() => this.savedJobs().length);

  removeFromSaved(jobId: string) {
    this.savedJobs.update(jobs => jobs.filter(j => j.id !== jobId));
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
