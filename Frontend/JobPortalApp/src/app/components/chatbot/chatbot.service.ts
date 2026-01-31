import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, catchError, of, timeout } from "rxjs";
import { ChatRequest, ChatResponse } from "./chat.models";

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    private readonly baseUrl = `${environment.apiUrl}/api/chatbot`;
    private readonly requestTimeout = 300000; // 5 minutes timeout for RAG requests

    constructor(private http: HttpClient) {}

    ask(request: ChatRequest): Observable<ChatResponse> {
        return this.http.post<ChatResponse>(`${this.baseUrl}/ask`, request).pipe(
            timeout(this.requestTimeout)
        );
    }

    askQuestion(question: string): Observable<ChatResponse> {
        return this.ask({ question });
    }

    checkHealth(): Observable<string> {
        return this.http.get(`${this.baseUrl}/health`, { responseType: 'text' }).pipe(
            timeout(10000)
        );
    }

    isAvailable(): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/available`).pipe(
            timeout(10000),
            catchError(() => of(false))
        );
    }
}
