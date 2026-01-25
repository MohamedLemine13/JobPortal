import { Component, signal, OnInit, inject, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Briefcase, ChevronLeft, ChevronDown, MapPin, Clock, DollarSign, Users, Calendar, Bookmark, Share2, Building2, Mail, User, Edit2, LogOut } from 'lucide-angular';

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  postedDate: string;
  salary: string;
  description: string;
  requirements: string[];
  logoColor: string;
  companyLogo: string | null;
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
  readonly Share2 = Share2;
  readonly Building2 = Building2;
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

  user = signal({
    name: 'M',
    fullName: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    role: 'Job Seeker',
    avatar: null as string | null
  });


  job = signal<JobDetails>({
    id: '1',
    title: 'Digital Marketing Specialist',
    company: 'PixelForge Studios',
    location: 'London, UK',
    type: 'Full-Time',
    category: 'Marketing',
    postedDate: '5th Jul 2025',
    salary: '55000 - 80000 per year',
    description: 'Join our marketing team to develop and implement digital strategies that drive brand awareness and lead generation. You will be responsible for managing campaigns across various channels including social media, email, and search engines.',
    requirements: [
      'Bachelor\'s in Marketing, Business, or related field',
      '2+ years experience in digital marketing',
      'SEO, SEM, Google Ads expertise',
      'Strong analytical skills and experience with Google Analytics',
      'Excellent written and verbal communication skills'
    ],
    logoColor: 'bg-purple-600',
    companyLogo: null // Using placeholder color from screenshot style
  });

  ngOnInit() {
    // In a real app, fetch job by ID here
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Job ID:', id);
  }
}
