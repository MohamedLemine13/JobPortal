import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from './chatbot.service';
import { ChatMessage, ChatResponse, Source } from './chat.models';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html'
})
export class ChatbotComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  isOpen = false;
  ragAvailable = false;

  // For request management
  private currentRequest?: Subscription;
  lastQuestion = '';
  loadingTime = 0;
  private loadingTimer?: any;

  // Voice recognition properties
  isListening = false;
  speechRecognition: any;
  speechSupported = false;
  voiceError = '';

  // Role-based suggestions
  quickSuggestions: string[] = [];

  private jobSeekerSuggestions = [
    'What jobs are available?',
    'Show my applications',
    'What jobs match my skills?',
    'How do I apply for a job?'
  ];

  private employerSuggestions = [
    'How many applications did I receive?',
    'Show my posted jobs',
    'Who applied recently?',
    'How do I post a new job?'
  ];

  private defaultSuggestions = [
    'How do I apply for a job?',
    'How can I update my profile?',
    'Tell me about the platform',
    'What are the latest job openings?'
  ];

  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService
  ) {
    this.initSpeechRecognition();
  }

  ngOnInit(): void {
    // Check if RAG service is available
    this.chatbotService.isAvailable().subscribe(available => {
      this.ragAvailable = available;
    });

    // Set role-based suggestions
    this.setRoleBasedSuggestions();

    // Welcome message
    const voiceSupport = this.speechSupported ? '\n\n🎤 You can also use voice commands!' : '';
    const roleMessage = this.getRoleWelcomeMessage();
    this.addBotMessage(roleMessage + voiceSupport + '\n\nHow can I help you today?');
  }

  private setRoleBasedSuggestions(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        if (user.role === 'employer') {
          this.quickSuggestions = this.employerSuggestions;
        } else if (user.role === 'job_seeker') {
          this.quickSuggestions = this.jobSeekerSuggestions;
        } else {
          this.quickSuggestions = this.defaultSuggestions;
        }
      } else {
        this.quickSuggestions = this.defaultSuggestions;
      }
    });
  }

  private getRoleWelcomeMessage(): string {
    const user = this.authService.currentUser$;
    // Default welcome
    return 'Hello! I am your JobPortal AI Assistant. I have access to your jobs, applications, and profile data. Ask me anything about the platform!';
  }


  toggleChat(): void {
    console.log('Toggle chat called, current state:', this.isOpen);
    this.isOpen = !this.isOpen;
    console.log('New state:', this.isOpen);
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    // Warn if RAG service is unavailable
    if (!this.ragAvailable) {
      this.addBotMessage('⚠️ AI service seems unavailable. Your question will be sent but might fail.', undefined, true);
    }

    const userMessage = this.currentMessage.trim();
    this.lastQuestion = userMessage;
    this.addUserMessage(userMessage);
    this.currentMessage = '';
    this.isLoading = true;
    this.loadingTime = 0;

    // Start loading timer
    this.startLoadingTimer();

    // Cancel any previous request
    this.currentRequest?.unsubscribe();

    this.currentRequest = this.chatbotService.askQuestion(userMessage).subscribe({
      next: (response: ChatResponse) => {
        this.stopLoadingTimer();
        this.isLoading = false;
        this.handleBotResponse(response);
      },
      error: (error: any) => {
        console.error('Chatbot error:', error);
        console.error('Error details - status:', error.status, 'name:', error.name, 'message:', error.message);
        this.stopLoadingTimer();
        this.isLoading = false;

        // More specific error messages
        if (error.name === 'TimeoutError') {
          this.addBotMessage('Request timed out. Please try with a simpler question.', undefined, true);
        } else if (error.status === 0) {
          this.addBotMessage('Cannot reach server. Please check your connection.', undefined, true);
        } else if (error.status === 504) {
          this.addBotMessage('The server took too long to respond.', undefined, true);
        } else if (error.status === 500) {
          const msg = error.error?.error_message || error.error?.message || 'Server Error';
          this.addBotMessage(`Server Error: ${msg}`, undefined, true);
        } else {
          this.addBotMessage(`An error occurred: ${error.message || 'Please try again'}`, undefined, true);
        }
      }
    });
  }

  retryLastQuestion(): void {
    if (this.lastQuestion) {
      this.currentMessage = this.lastQuestion;
      this.sendMessage();
    }
  }

  cancelRequest(): void {
    this.currentRequest?.unsubscribe();
    this.stopLoadingTimer();
    this.isLoading = false;
    this.addBotMessage('Question cancelled. How else can I help you?');
  }

  private startLoadingTimer(): void {
    this.loadingTime = 0;
    this.loadingTimer = setInterval(() => {
      this.loadingTime++;
    }, 1000);
  }

  private stopLoadingTimer(): void {
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
      this.loadingTimer = undefined;
    }
  }

  private handleBotResponse(response: ChatResponse): void {
    if (response.error) {
      this.addBotMessage(response.error_message || 'An error occurred.', undefined, true);
      return;
    }

    // Add bot message with sources
    this.addBotMessage(response.answer, response.sources);
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      type: 'user',
      content,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(content: string, sources?: Source[], isError = false): void {
    this.messages.push({
      type: 'bot',
      content,
      sources,
      timestamp: new Date(),
      isError
    });
    this.scrollToBottom();
  }

  formatMessage(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  useSuggestion(suggestion: string): void {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  // ========== VOICE RECOGNITION ==========

  private initSpeechRecognition(): void {
    // Check if API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.speechSupported = true;
      this.speechRecognition = new SpeechRecognition();

      // Configuration
      this.speechRecognition.lang = 'en-US'; // English
      this.speechRecognition.continuous = false; // Stop after one phrase
      this.speechRecognition.interimResults = true; // Interim results
      this.speechRecognition.maxAlternatives = 1;

      // Event: recognition result
      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const isFinal = event.results[0].isFinal;

        this.currentMessage = transcript;

        // If final result, send automatically
        if (isFinal) {
          this.isListening = false;
          // Small delay so user sees text
          setTimeout(() => {
            if (this.currentMessage.trim()) {
              this.sendMessage();
            }
          }, 500);
        }
      };

      // Event: start listening
      this.speechRecognition.onstart = () => {
        this.isListening = true;
        this.voiceError = '';
        console.log('🎤 Listening started...');
      };

      // Event: end listening
      this.speechRecognition.onend = () => {
        this.isListening = false;
        console.log('🎤 Listening ended');
      };

      // Event: error
      this.speechRecognition.onerror = (event: any) => {
        this.isListening = false;
        console.error('Speech recognition error:', event.error);

        switch (event.error) {
          case 'no-speech':
            this.voiceError = 'No voice detected. Please try again.';
            break;
          case 'audio-capture':
            this.voiceError = 'Microphone unavailable.';
            break;
          case 'not-allowed':
            this.voiceError = 'Microphone access denied.';
            break;
          case 'network':
            this.voiceError = 'Network error.';
            break;
          default:
            this.voiceError = 'Speech recognition error.';
        }

        // Clear error after 3 seconds
        setTimeout(() => {
          this.voiceError = '';
        }, 3000);
      };
    } else {
      this.speechSupported = false;
      console.warn('Speech recognition not supported in this browser.');
    }
  }

  // Start/Stop voice listening
  toggleVoiceInput(): void {
    if (!this.speechSupported) {
      this.voiceError = 'Voice recognition not supported.';
      setTimeout(() => this.voiceError = '', 3000);
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening(): void {
    if (this.speechRecognition && !this.isListening) {
      try {
        this.speechRecognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }

  stopListening(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
    }
  }

  ngOnDestroy(): void {
    // Cancel pending request
    this.currentRequest?.unsubscribe();

    // Stop loading timer
    this.stopLoadingTimer();

    // Arrêter la reconnaissance vocale si active
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
    }
  }
}
