import { Component, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
export class MessagesComponent {
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

  // User info
  user = signal({
    name: 'John Davis',
    email: 'f@gmail.com',
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
    console.log('Logging out...');
  }

  // Search
  searchQuery = signal('');

  // New message input
  newMessage = signal('');

  // Conversations
  conversations = signal<Conversation[]>([
    {
      id: '1',
      companyName: 'StartupXYZ',
      jobTitle: 'Full Stack Developer',
      lastMessage: 'Nous aimerions vous rencontrer pour un entretien',
      lastMessageTime: '07/01 10:30',
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          senderId: 'employer1',
          senderName: 'Marie Dupont (StartupXYZ)',
          content: 'Bonjour, nous avons examiné votre candidature et nous sommes très intéressés par votre profil.',
          timestamp: '06/01 14:20',
          isOwn: false
        },
        {
          id: 'm2',
          senderId: 'user',
          senderName: 'f',
          content: 'Bonjour Marie, merci beaucoup ! Je suis ravi(e) de cette opportunité.',
          timestamp: '06/01 15:45',
          isOwn: true
        },
        {
          id: 'm3',
          senderId: 'employer1',
          senderName: 'Marie Dupont (StartupXYZ)',
          content: 'Nous aimerions vous rencontrer pour un entretien. Seriez-vous disponible cette semaine ?',
          timestamp: '07/01 10:30',
          isOwn: false
        }
      ]
    },
    {
      id: '2',
      companyName: 'TechCorp',
      jobTitle: 'Développeur Frontend Senior',
      lastMessage: 'Merci pour votre intérêt',
      lastMessageTime: '05/01 16:15',
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          senderId: 'employer2',
          senderName: 'Jean Martin (TechCorp)',
          content: 'Merci pour votre intérêt pour le poste de Développeur Frontend Senior.',
          timestamp: '05/01 16:15',
          isOwn: false
        }
      ]
    },
    {
      id: '3',
      companyName: 'BigTech Inc',
      jobTitle: 'Software Engineer',
      lastMessage: 'Avez-vous des questions sur le poste ?',
      lastMessageTime: '04/01 09:00',
      unreadCount: 1,
      messages: [
        {
          id: 'm5',
          senderId: 'employer3',
          senderName: 'Sarah Chen (BigTech Inc)',
          content: 'Bonjour ! Nous avons bien reçu votre candidature pour le poste de Software Engineer.',
          timestamp: '03/01 11:00',
          isOwn: false
        },
        {
          id: 'm6',
          senderId: 'employer3',
          senderName: 'Sarah Chen (BigTech Inc)',
          content: 'Avez-vous des questions sur le poste ?',
          timestamp: '04/01 09:00',
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
      timestamp: new Date().toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      }) + ' ' + new Date().toLocaleTimeString('fr-FR', { 
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
