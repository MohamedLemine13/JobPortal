import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApplicationRequest, ApplicationResponse } from '../models/application.models';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  applyForJob(request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(`${this.apiUrl}/applications`, request);
  }

  uploadCv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post(`${this.apiUrl}/profile/me/cv`, formData);
  }
}
