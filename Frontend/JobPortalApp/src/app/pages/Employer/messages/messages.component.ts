import { Component, signal, computed, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { 
  LucideAngularModule, 
  Mail,
  Search,
  Send,
  LayoutDashboard,
  ChevronDown,
  Edit3,
  FileText,
  LogOut,
  Briefcase
} from 'lucide-angular';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

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
  participantId: string;
  participantName: string;
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
  messages: Message[];
}

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './messages.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MessagesComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  // Icons
  readonly Mail = Mail;
  readonly Search = Search;
  readonly Send = Send;
  readonly LayoutDashboard = LayoutDashboard;
  readonly ChevronDown = ChevronDown;
  readonly Edit3 = Edit3;
  readonly FileText = FileText;
  readonly LogOut = LogOut;
  readonly Briefcase = Briefcase;

  // Current user ID for determining message ownership
  currentUserId = signal<string>('');

  constructor(
    private messageService: MessageService,
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

    // Get current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId.set(user.id);
        this.user.update(u => ({
          ...u,
          name: user.fullName,
          email: user.email
        }));
      }
    });

    // Load conversations from backend
    this.loadConversations();
  }

  loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const profile = data.profile || {};
        const userInfo = data.user || {};
        
        const avatarUrl = this.profileService.getFileUrl(profile.avatar);
        
        this.user.set({
          name: profile.fullName || profile.companyName || userInfo.email || 'User',
          email: userInfo.email || '',
          role: 'Employer',
          avatar: avatarUrl
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadConversations() {
    this.messageService.getConversations().subscribe({
      next: (response: any) => {
        console.log('Conversations response:', response);
        const data = response.data || response;
        const convList = data.conversations || [];
        
        const mappedConversations: Conversation[] = convList.map((conv: any) => ({
          id: conv.id,
          participantId: conv.participant?.id || '',
          participantName: conv.participant?.name || 'Unknown',
          jobTitle: conv.job?.title || 'General',
          lastMessage: conv.lastMessage?.content || '',
          lastMessageTime: conv.lastMessage?.sentAt ? this.formatTime(conv.lastMessage.sentAt) : '',
          unreadCount: conv.unreadCount || 0,
          avatar: conv.participant?.avatar,
          messages: [] // Messages loaded separately when conversation is selected
        }));
        
        this.conversations.set(mappedConversations);
        
        // Select first conversation if available
        if (mappedConversations.length > 0 && !this.selectedConversationId()) {
          this.selectConversation(mappedConversations[0].id);
        }
      },
      error: (err) => console.error('Failed to load conversations', err)
    });
  }

  loadMessages(conversationId: string) {
    this.messageService.getConversationMessages(conversationId).subscribe({
      next: (response: any) => {
        console.log('Messages response:', response);
        const data = response.data || response;
        const messageList = data.messages || [];
        
        const mappedMessages: Message[] = messageList.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderId === this.currentUserId() ? this.user().name : this.getParticipantName(conversationId),
          content: msg.content,
          timestamp: this.formatTime(msg.sentAt),
          rawTimestamp: msg.sentAt,
          isOwn: msg.senderId === this.currentUserId()
        }));
        
        // Sort messages by timestamp - oldest first so newest appears at bottom
        mappedMessages.sort((a: any, b: any) => {
          return new Date(a.rawTimestamp).getTime() - new Date(b.rawTimestamp).getTime();
        });
        
        // Update conversation with messages
        this.conversations.update(convs =>
          convs.map(c => c.id === conversationId ? { ...c, messages: mappedMessages } : c)
        );
        
        // Scroll to bottom
        setTimeout(() => {
          if (this.chatContainer) {
            this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
          }
        }, 100);
      },
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  getParticipantName(conversationId: string): string {
    const conv = this.conversations().find(c => c.id === conversationId);
    return conv?.participantName || 'Unknown';
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // User info
  user = signal({
    name: '',
    email: '',
    role: 'Employer',
    avatar: null as string | null
  });

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

  // Search
  searchQuery = signal('');

  // New message input
  newMessage = signal('');

  // Conversations - loaded from backend
  conversations = signal<Conversation[]>([]);

  // Selected conversation
  selectedConversationId = signal<string | null>(null);

  selectedConversation = computed(() => {
    const id = this.selectedConversationId();
    return this.conversations().find(c => c.id === id) || null;
  });

  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.conversations();
    return this.conversations().filter(c => 
      c.participantName.toLowerCase().includes(query) ||
      c.jobTitle.toLowerCase().includes(query)
    );
  });

  selectConversation(id: string) {
    this.selectedConversationId.set(id);
    
    // Load messages for this conversation
    this.loadMessages(id);
    
    // Mark as read via API
    this.messageService.markAsRead(id).subscribe({
      next: () => {
        this.conversations.update(convs => 
          convs.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
        );
      },
      error: (err) => console.error('Failed to mark as read', err)
    });
  }

  sendMessage() {
    const content = this.newMessage().trim();
    const conversationId = this.selectedConversationId();
    if (!content || !conversationId) return;

    // Send message via API
    this.messageService.sendMessage(conversationId, { content }).subscribe({
      next: (response: any) => {
        console.log('Message sent:', response);
        const data = response.data || response;
        
        const newMsg: Message = {
          id: data.id || `m${Date.now()}`,
          senderId: this.currentUserId(),
          senderName: this.user().name,
          content,
          timestamp: this.formatTime(data.sentAt || new Date().toISOString()),
          isOwn: true
        };

        this.conversations.update(convs => 
          convs.map(c => c.id === conversationId 
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
      },
      error: (err) => {
        console.error('Failed to send message', err);
        alert('Failed to send message. Please try again.');
      }
    });
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

}
