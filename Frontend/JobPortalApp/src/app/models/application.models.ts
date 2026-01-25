export interface ApplicationRequest {
  jobId: string;
  coverLetter: string;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
}
