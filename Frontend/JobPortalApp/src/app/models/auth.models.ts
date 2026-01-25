export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'job_seeker' | 'employer';
  fullName: string;
  companyName?: string; // Only for employers
}

export interface AuthResponse {
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'job_seeker' | 'employer';
}
