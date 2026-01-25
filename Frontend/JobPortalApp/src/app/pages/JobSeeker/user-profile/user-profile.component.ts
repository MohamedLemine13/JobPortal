import { Component, signal, ElementRef, ViewChild, AfterViewInit, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Briefcase, Mail, MapPin, FileText, Clock, CheckCircle, XCircle, User, Edit2, Download, Building2, ChevronDown, Bookmark, X, Upload, Eye, Trash2, Plus, Camera, LogOut, Settings } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

interface Application {
  id: string;
  role: string;
  company: string;
  location: string;
  date: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
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
      transition('hidden => visible', [animate('0.6s 0.2s ease-out')])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ])
  ]
})
export class UserProfileComponent implements AfterViewInit, OnInit {
  @ViewChild('titleSection') titleSection!: ElementRef;
  @ViewChild('profileSection') profileSection!: ElementRef;
  @ViewChild('applicationsSection') applicationsSection!: ElementRef;

  titleVisible = false;
  profileVisible = false;
  applicationsVisible = false;

  private platformId = inject(PLATFORM_ID);
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set({
          name: user.fullName.split(' ')[0], 
          fullName: user.fullName,
          email: user.email,
          phone: '', // Placeholder as basic auth model doesn't store phone
          role: user.role === 'job_seeker' ? 'Job Seeker' : 'Employer',
          location: '', // Placeholder
          bio: 'Passionate developer.', // Placeholder
          avatar: null as string | null,
          skills: [], // Placeholder
          cv: null
        });
      }
    });

    if (!this.authService.getToken()) {
        this.router.navigate(['/login']);
    } else {
        this.authService.fetchProfile().subscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    const observerOptions = { threshold: 0.1 };

    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.titleVisible = true;
          titleObserver.disconnect();
        }
      });
    }, observerOptions);

    const profileObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.profileVisible = true;
          profileObserver.disconnect();
        }
      });
    }, observerOptions);

    const appsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.applicationsVisible = true;
          appsObserver.disconnect();
        }
      });
    }, observerOptions);

    if (this.titleSection) titleObserver.observe(this.titleSection.nativeElement);
    if (this.profileSection) profileObserver.observe(this.profileSection.nativeElement);
    if (this.applicationsSection) appsObserver.observe(this.applicationsSection.nativeElement);
  }
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  // Icons
  readonly Briefcase = Briefcase;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly FileText = FileText;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly User = User;
  readonly Edit2 = Edit2;
  readonly Download = Download;
  readonly Building2 = Building2;
  readonly ChevronDown = ChevronDown;
  readonly Bookmark = Bookmark;
  readonly X = X;
  readonly Upload = Upload;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Camera = Camera;
  readonly LogOut = LogOut;
  readonly Settings = Settings;

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  // Modal states
  isEditModalOpen = signal(false);
  isCVViewerOpen = signal(false);

  // Edit form data
  editForm = signal({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    newSkill: ''
  });

  user = signal({
    name: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'Job Seeker',
    location: '',
    bio: '',
    avatar: null as string | null,
    skills: [] as string[],
    cv: null as { name: string; size: string; uploadDate: string } | null
  });

  applications = signal<Application[]>([
    {
      id: '1',
      role: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Paris',
      date: '05/01/2026',
      status: 'Pending'
    },
    {
      id: '2',
      role: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Lyon',
      date: '03/01/2026',
      status: 'Accepted'
    },
    {
      id: '3',
      role: 'React Developer',
      company: 'WebAgency',
      location: 'Marseille',
      date: '28/12/2025',
      status: 'Rejected'
    }
  ]);

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  getStatusIcon(status: string): any {
    switch (status) {
      case 'Pending': return this.Clock;
      case 'Accepted': return this.CheckCircle;
      case 'Rejected': return this.XCircle;
      default: return this.Clock;
    }
  }

  // Open edit modal
  openEditModal() {
    const currentUser = this.user();
    this.editForm.set({
      fullName: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.phone,
      location: currentUser.location,
      bio: currentUser.bio,
      skills: [...currentUser.skills],
      newSkill: ''
    });
    this.isEditModalOpen.set(true);
  }

  // Close edit modal
  closeEditModal() {
    this.isEditModalOpen.set(false);
  }

  // Save profile changes
  saveProfile() {
    const form = this.editForm();
    this.user.update(u => ({
      ...u,
      fullName: form.fullName,
      name: form.fullName.charAt(0),
      email: form.email,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
      skills: form.skills
    }));
    this.closeEditModal();
  }

  // Add skill
  addSkill() {
    const form = this.editForm();
    if (form.newSkill.trim() && !form.skills.includes(form.newSkill.trim())) {
      this.editForm.update(f => ({
        ...f,
        skills: [...f.skills, f.newSkill.trim()],
        newSkill: ''
      }));
    }
  }

  // Remove skill
  removeSkill(skill: string) {
    this.editForm.update(f => ({
      ...f,
      skills: f.skills.filter(s => s !== skill)
    }));
  }

  // Handle skill input keydown
  onSkillKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  // Trigger file input for CV
  triggerCVUpload() {
    this.fileInput.nativeElement.click();
  }

  // Handle CV file selection
  onCVSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeInKB = Math.round(file.size / 1024);
      const today = new Date();
      const uploadDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      
      this.user.update(u => ({
        ...u,
        cv: {
          name: file.name,
          size: sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`,
          uploadDate
        }
      }));
    }
  }

  // Delete CV
  deleteCV() {
    this.user.update(u => ({
      ...u,
      cv: null
    }));
  }

  // View CV
  viewCV() {
    this.isCVViewerOpen.set(true);
  }

  // Close CV viewer
  closeCVViewer() {
    this.isCVViewerOpen.set(false);
  }

  // Download CV (simulated)
  downloadCV() {
    const cv = this.user().cv;
    if (cv) {
      // In a real app, this would trigger a file download
      console.log('Downloading:', cv.name);
      alert(`Downloading ${cv.name}...`);
    }
  }

  // Trigger avatar upload
  triggerAvatarUpload() {
    this.avatarInput.nativeElement.click();
  }

  // Handle avatar selection
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.user.update(u => ({
          ...u,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  // Update form field
  updateFormField(field: string, value: string) {
    this.editForm.update(f => ({
      ...f,
      [field]: value
    }));
  }
}
