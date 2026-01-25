import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import {
  LucideAngularModule,
  Mail,
  Search,
  Send,
  Briefcase,
  ChevronDown,
  Bookmark,
  Building2,
  User,
  Edit2,
  LogOut
} from 'lucide-angular';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  companyName: string;
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
  messages: Message[];
}

@Component({
  selector: 'app-jobseeker-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './messages.component.html',
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
    trigger('scaleIn', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [animate('0.5s 0.1s ease-out')])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class JobSeekerMessagesComponent implements AfterViewInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('titleSection') titleSection!: ElementRef;
  @ViewChild('chatSection') chatSection!: ElementRef;

  titleVisible = false;
  chatVisible = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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

    const chatObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.chatVisible = true;
          chatObserver.disconnect();
        }
      });
    }, observerOptions);

    if (this.titleSection) titleObserver.observe(this.titleSection.nativeElement);
    if (this.chatSection) chatObserver.observe(this.chatSection.nativeElement);
  }

  // Icons
  readonly Mail = Mail;
  readonly Search = Search;
  readonly Send = Send;
  readonly Briefcase = Briefcase;
  readonly ChevronDown = ChevronDown;
  readonly Bookmark = Bookmark;
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

  // Search
  searchQuery = signal('');

  // New message input
  newMessage = signal('');

  // Conversations
  conversations = signal<Conversation[]>([
    {
      id: '1',
      companyName: 'TechNova Solutions',
      jobTitle: 'Senior Software Engineer',
      lastMessage: 'We would like to schedule an interview with you',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          senderId: 'employer1',
          senderName: 'HR Team (TechNova Solutions)',
          content: 'Hello! Thank you for applying to the Senior Software Engineer position. We were impressed by your profile.',
          timestamp: 'Yesterday 2:30 PM',
          isOwn: false
        },
        {
          id: 'm2',
          senderId: 'user',
          senderName: 'Mary Johnson',
          content: 'Thank you for reaching out! I am very interested in this opportunity.',
          timestamp: 'Yesterday 3:45 PM',
          isOwn: true
        },
        {
          id: 'm3',
          senderId: 'employer1',
          senderName: 'HR Team (TechNova Solutions)',
          content: 'We would like to schedule an interview with you. Are you available this week?',
          timestamp: '10:30 AM',
          isOwn: false
        }
      ]
    },
    {
      id: '2',
      companyName: 'BlueGrid Technologies',
      jobTitle: 'UX/UI Designer',
      lastMessage: 'Thank you for your interest in our company',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          senderId: 'employer2',
          senderName: 'Sarah Chen (BlueGrid Technologies)',
          content: 'Thank you for your interest in our company. We have reviewed your portfolio.',
          timestamp: 'Yesterday 4:15 PM',
          isOwn: false
        }
      ]
    },
    {
      id: '3',
      companyName: 'PixelForge Studios',
      jobTitle: 'Digital Marketing Specialist',
      lastMessage: 'Your application has been received',
      lastMessageTime: 'Jan 20',
      unreadCount: 1,
      messages: [
        {
          id: 'm5',
          senderId: 'employer3',
          senderName: 'Recruitment (PixelForge Studios)',
          content: 'Your application has been received. Our team will review it shortly.',
          timestamp: 'Jan 20 9:00 AM',
          isOwn: false
        }
      ]
    }
  ]);

  // Selected conversation
  selectedConversationId = signal<string | null>('1');

  selectedConversation = computed(() => {
    const id = this.selectedConversationId();
    return this.conversations().find(c => c.id === id) || null;
  });

  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.conversations();
    return this.conversations().filter(c =>
      c.companyName.toLowerCase().includes(query) ||
      c.jobTitle.toLowerCase().includes(query)
    );
  });

  totalUnread = computed(() => {
    return this.conversations().reduce((sum, c) => sum + c.unreadCount, 0);
  });

  selectConversation(id: string) {
    this.selectedConversationId.set(id);
    // Mark as read
    this.conversations.update(convs =>
      convs.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
    );
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content || !this.selectedConversationId()) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: 'user',
      senderName: this.user().name,
      content,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOwn: true
    };

    this.conversations.update(convs =>
      convs.map(c => c.id === this.selectedConversationId()
        ? {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: content,
          lastMessageTime: newMsg.timestamp
        }
        : c
      )
    );

    this.newMessage.set('');

    // Scroll to bottom
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
