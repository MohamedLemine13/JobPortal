import { Component, signal, ElementRef, ViewChild, AfterViewInit, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Briefcase, Mail, MapPin, FileText, Clock, CheckCircle, XCircle, User, Edit2, Download, Building2, ChevronDown, Bookmark, X, Upload, Eye, Trash2, Plus, Camera, LogOut, Settings, Lock, Send } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { ApplicationService } from '../../../services/application.service';
import { MessageService } from '../../../services/message.service';

interface Application {
  id: string;
  jobId: string;
  role: string;
  company: string;
  companyId?: string;
  employerId?: string;
  location: string;
  date: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
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

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private applicationService: ApplicationService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load profile from backend
    this.loadProfile();

    // Load applications from backend
    this.loadApplications();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);
        const data = response.data || response;
        const profile = data.profile || {};
        const userInfo = data.user || {};

        // Get proper URLs for avatar and CV
        const avatarUrl = this.profileService.getFileUrl(profile.avatar);
        const cvFileUrl = profile.cv?.fileUrl || null;

        this.user.set({
          name: (profile.fullName || 'User').charAt(0),
          fullName: profile.fullName || 'User',
          email: userInfo.email || '',
          phone: profile.phone || '',
          role: userInfo.role === 'job_seeker' ? 'Job Seeker' : 'Employer',
          location: profile.location || '',
          bio: profile.bio || '',
          avatar: avatarUrl,
          skills: profile.skills || [],
          cv: profile.cv ? {
            name: profile.cv.fileName || 'Resume.pdf',
            size: this.formatFileSize(profile.cv.fileSize),
            uploadDate: profile.cv.uploadedAt ? new Date(profile.cv.uploadedAt).toLocaleDateString() : '',
            url: cvFileUrl
          } : null
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  formatFileSize(bytes: number | string | null): string {
    if (!bytes) return '';
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  loadApplications() {
    this.applicationService.getMyApplications().subscribe({
      next: (response: any) => {
        console.log('Applications response:', response);
        const data = response.data || response;
        const appList = data.applications || [];

        const mappedApps: Application[] = appList.map((app: any) => ({
          id: app.id,
          jobId: app.job?.id || app.jobId || '',
          role: app.job?.title || app.jobTitle || 'Unknown Position',
          company: app.job?.company?.name || app.companyName || 'Unknown Company',
          companyId: app.job?.company?.id,
          employerId: app.job?.employerId || app.employerId,
          location: app.job?.location || '',
          date: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
          status: this.mapStatus(app.status)
        }));

        this.applications.set(mappedApps);
      },
      error: (err) => console.error('Failed to load applications', err)
    });
  }

  mapStatus(status: string): 'Pending' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected' {
    const statusMap: Record<string, 'Pending' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected'> = {
      'pending': 'Pending',
      'reviewed': 'Reviewed',
      'shortlisted': 'Shortlisted',
      'interview': 'Interview',
      'hired': 'Accepted',
      'rejected': 'Rejected'
    };
    return statusMap[status?.toLowerCase()] || 'Pending';
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
  readonly Lock = Lock;
  readonly Send = Send;

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
    cv: null as { name: string; size: string; uploadDate: string; url?: string } | null
  });

  // Applications loaded from backend
  applications = signal<Application[]>([]);

  // Profile preview modal
  isProfilePreviewOpen = signal(false);

  openProfilePreview() {
    this.isProfilePreviewOpen.set(true);
  }

  closeProfilePreview() {
    this.isProfilePreviewOpen.set(false);
  }

  // Password change modal
  isPasswordModalOpen = signal(false);
  passwordForm = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  passwordError = signal('');
  isChangingPassword = signal(false);

  openPasswordModal() {
    this.passwordForm.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
    this.passwordError.set('');
    this.isPasswordModalOpen.set(true);
  }

  closePasswordModal() {
    this.isPasswordModalOpen.set(false);
  }

  changePassword() {
    const form = this.passwordForm();

    if (form.newPassword !== form.confirmPassword) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 6) {
      this.passwordError.set('New password must be at least 6 characters');
      return;
    }

    this.isChangingPassword.set(true);
    this.profileService.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.closePasswordModal();
        alert('Password changed successfully!');
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Current password is incorrect');
      }
    });
  }

  updatePasswordField(field: string, value: string) {
    this.passwordForm.update(f => ({ ...f, [field]: value }));
    this.passwordError.set('');
  }

  // Send message to employer
  sendMessageToEmployer(application: Application) {
    if (!application.employerId) {
      alert('Cannot send message: Employer information not available');
      return;
    }

    // Navigate to messages with the employer ID to start/open chat there
    this.router.navigate(['/find-jobs/messages'], {
      queryParams: { chatWith: application.employerId }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Reviewed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shortlisted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interview': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  getStatusIcon(status: string): any {
    switch (status) {
      case 'Pending': return this.Clock;
      case 'Reviewed': return this.Eye;
      case 'Shortlisted': return this.Bookmark;
      case 'Interview': return this.Briefcase;
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

    this.profileService.updateJobSeekerProfile({
      fullName: form.fullName,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
      skills: form.skills
    }).subscribe({
      next: () => {
        this.user.update(u => ({
          ...u,
          fullName: form.fullName,
          name: form.fullName.charAt(0),
          phone: form.phone,
          location: form.location,
          bio: form.bio,
          skills: form.skills
        }));
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        alert('Failed to save profile. Please try again.');
      }
    });
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

      this.profileService.uploadCv(file).subscribe({
        next: (response: any) => {
          console.log('CV upload response:', response);
          const data = response.data || response;
          const today = new Date();
          const uploadDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          this.user.update(u => ({
            ...u,
            cv: {
              name: data.fileName || file.name,
              size: data.fileSize || `${Math.round(file.size / 1024)} KB`,
              uploadDate,
              url: data.fileUrl || ''
            }
          }));
        },
        error: (err) => {
          console.error('Failed to upload CV', err);
          alert('Failed to upload CV. Please try again.');
        }
      });
    }
  }

  // Delete CV
  deleteCV() {
    this.profileService.deleteCv().subscribe({
      next: () => {
        this.user.update(u => ({
          ...u,
          cv: null
        }));
      },
      error: (err) => {
        console.error('Failed to delete CV', err);
        alert('Failed to delete CV. Please try again.');
      }
    });
  }

  // View CV in browser
  viewCV() {
    const cv = this.user().cv;
    if (cv && cv.url) {
      const viewUrl = this.profileService.getViewUrl(cv.url);
      if (viewUrl) {
        window.open(viewUrl, '_blank');
      }
    } else {
      alert('No CV available to view.');
    }
  }

  // Close CV viewer
  closeCVViewer() {
    this.isCVViewerOpen.set(false);
  }

  // Download CV
  downloadCV() {
    const cv = this.user().cv;
    if (cv && cv.url) {
      const downloadUrl = this.profileService.getDownloadUrl(cv.url);
      if (downloadUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = cv.name || 'resume.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      alert('No CV uploaded.');
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

      this.profileService.uploadAvatar(file).subscribe({
        next: (response: any) => {
          console.log('Avatar upload response:', response);
          const data = response.data || response;
          // Get the full URL for the avatar
          const avatarUrl = this.profileService.getFileUrl(data.avatarUrl);
          this.user.update(u => ({
            ...u,
            avatar: avatarUrl || URL.createObjectURL(file)
          }));
        },
        error: (err) => {
          console.error('Failed to upload avatar', err);
          alert('Failed to upload avatar. Please try again.');
        }
      });
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
