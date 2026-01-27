import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StartConversationRequest {
  recipientId: string;
  content: string;
  applicationId?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface MessageDto {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface ConversationDto {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  job?: {
    id: string;
    title: string;
  };
  lastMessage?: {
    content: string;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface ConversationDetailResponse {
  conversation: ConversationDto;
  messages: MessageDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConversationListResponse {
  conversations: ConversationDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  // Get all conversations for current user
  getConversations(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations?page=${page}&limit=${limit}`);
  }

  // Get messages for a specific conversation
  getConversationMessages(conversationId: string, page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations/${conversationId}?page=${page}&limit=${limit}`);
  }

  // Start a new conversation
  startConversation(request: StartConversationRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/conversations`, request);
  }

  // Send a message to an existing conversation
  sendMessage(conversationId: string, request: SendMessageRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/conversations/${conversationId}`, request);
  }

  // Mark conversation as read
  markAsRead(conversationId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/conversations/${conversationId}/read`, {});
  }

  // Get total unread count
  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unread-count`);
  }
}
