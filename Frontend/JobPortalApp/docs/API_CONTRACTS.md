# Job Portal API Contracts & Data Models

## Table of Contents
1. [Data Models](#data-models)
2. [Authentication API](#authentication-api)
3. [User Profile API](#user-profile-api)
4. [Jobs API](#jobs-api)
5. [Applications API](#applications-api)
6. [Messages API](#messages-api)
7. [File Upload API](#file-upload-api)

---

## Data Models

### User
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique, required
  password: string;              // Hashed, required
  role: 'job_seeker' | 'employer';
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  lastLoginAt?: Date;
}
```

### JobSeekerProfile
```typescript
interface JobSeekerProfile {
  id: string;
  userId: string;                // FK to User
  fullName: string;
  avatar?: string;               // URL to image
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];              // Array of skill names
  experience?: string;           // e.g., "3+ years"
  cv?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;            // in bytes
    uploadedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### EmployerProfile
```typescript
interface EmployerProfile {
  id: string;
  userId: string;                // FK to User
  fullName: string;              // Contact person name
  avatar?: string;
  companyName: string;
  companyLogo?: string;          // URL to image
  companyType: string;           // e.g., "Startup", "Enterprise"
  industry: string;              // e.g., "Technology", "Healthcare"
  companySize: string;           // e.g., "1-10", "11-50", "51-200"
  website?: string;
  location: string;
  description?: string;
  foundedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Job
```typescript
interface Job {
  id: string;
  employerId: string;            // FK to User (employer)
  title: string;
  description: string;
  requirements: string[];        // Array of requirements
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  category: string;              // e.g., "IT & Software", "Marketing"
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;        // e.g., "USD", "EUR"
  salaryPeriod: 'hourly' | 'monthly' | 'yearly';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  skills: string[];              // Required skills
  benefits?: string[];
  status: 'draft' | 'active' | 'paused' | 'closed';
  applicantsCount: number;       // Computed/cached
  viewsCount: number;
  postedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Application
```typescript
interface Application {
  id: string;
  jobId: string;                 // FK to Job
  applicantId: string;           // FK to User (job_seeker)
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  coverLetter?: string;
  cvUrl: string;                 // URL to CV at time of application
  appliedAt: Date;
  reviewedAt?: Date;
  notes?: string;                // Employer's internal notes
  createdAt: Date;
  updatedAt: Date;
}
```

### SavedJob
```typescript
interface SavedJob {
  id: string;
  userId: string;                // FK to User (job_seeker)
  jobId: string;                 // FK to Job
  savedAt: Date;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  participants: string[];        // Array of User IDs (2 participants)
  jobId?: string;                // Optional: related job
  applicationId?: string;        // Optional: related application
  lastMessageAt: Date;
  createdAt: Date;
}
```

### Message
```typescript
interface Message {
  id: string;
  conversationId: string;        // FK to Conversation
  senderId: string;              // FK to User
  content: string;
  isRead: boolean;
  sentAt: Date;
}
```

---

## Authentication API

### Base URL: `/api/auth`

#### POST `/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "job_seeker",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "job_seeker"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Errors:**
- `400` - Validation error (invalid email, weak password)
- `409` - Email already exists

---

#### POST `/login`
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "job_seeker",
      "profile": { /* JobSeekerProfile or EmployerProfile */ }
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Account not verified

---

#### POST `/refresh`
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

---

#### POST `/logout`
Invalidate refresh token.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST `/forgot-password`
Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

#### POST `/reset-password`
Reset password with token.

**Request:**
```json
{
  "token": "reset_token",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Profile API

### Base URL: `/api/profile`

**Headers (all endpoints):** `Authorization: Bearer <accessToken>`

---

#### GET `/me`
Get current user's profile.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "job_seeker"
    },
    "profile": {
      "id": "uuid",
      "fullName": "John Doe",
      "avatar": "https://...",
      "phone": "+1234567890",
      "location": "San Francisco, CA",
      "bio": "Experienced developer...",
      "skills": ["JavaScript", "Angular", "Node.js"],
      "cv": {
        "fileName": "resume.pdf",
        "fileUrl": "https://...",
        "fileSize": 245000,
        "uploadedAt": "2025-01-20T10:00:00Z"
      }
    }
  }
}
```

---

#### PUT `/me`
Update current user's profile.

**Request (Job Seeker):**
```json
{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "bio": "Experienced developer...",
  "skills": ["JavaScript", "Angular", "Node.js"]
}
```

**Request (Employer):**
```json
{
  "fullName": "Jane Smith",
  "companyName": "TechCorp Inc.",
  "companyType": "Enterprise",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://techcorp.com",
  "location": "New York, NY",
  "description": "Leading tech company..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": { /* Updated profile */ }
  }
}
```

---

#### POST `/me/avatar`
Upload avatar image.

**Request:** `multipart/form-data`
- `avatar`: Image file (max 5MB, jpg/png/webp)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://..."
  }
}
```

---

#### POST `/me/cv`
Upload CV (Job Seeker only).

**Request:** `multipart/form-data`
- `cv`: PDF file (max 10MB)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cv": {
      "fileName": "resume.pdf",
      "fileUrl": "https://...",
      "fileSize": 245000,
      "uploadedAt": "2025-01-20T10:00:00Z"
    }
  }
}
```

---

#### DELETE `/me/cv`
Delete CV (Job Seeker only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

---

## Jobs API

### Base URL: `/api/jobs`

---

#### GET `/`
List jobs with filters (public).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `search` | string | Search in title, description |
| `location` | string | Filter by location |
| `type` | string | Filter by job type |
| `category` | string | Filter by category |
| `salaryMin` | number | Minimum salary |
| `salaryMax` | number | Maximum salary |
| `experienceLevel` | string | Filter by experience level |
| `sortBy` | string | Sort field (postedAt, salary, title) |
| `sortOrder` | string | asc or desc |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "company": {
          "id": "uuid",
          "name": "TechCorp Inc.",
          "logo": "https://..."
        },
        "location": "San Francisco, CA",
        "type": "full-time",
        "category": "IT & Software",
        "salaryMin": 120000,
        "salaryMax": 180000,
        "salaryCurrency": "USD",
        "salaryPeriod": "yearly",
        "postedAt": "2025-01-15T10:00:00Z",
        "applicantsCount": 45
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

#### GET `/:id`
Get job details (public).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "description": "We are looking for...",
      "requirements": [
        "5+ years of experience",
        "Strong JavaScript skills"
      ],
      "company": {
        "id": "uuid",
        "name": "TechCorp Inc.",
        "logo": "https://...",
        "description": "Leading tech company...",
        "size": "51-200",
        "industry": "Technology"
      },
      "location": "San Francisco, CA",
      "type": "full-time",
      "category": "IT & Software",
      "salaryMin": 120000,
      "salaryMax": 180000,
      "salaryCurrency": "USD",
      "salaryPeriod": "yearly",
      "experienceLevel": "senior",
      "skills": ["JavaScript", "Angular", "Node.js"],
      "benefits": ["Health insurance", "401k", "Remote work"],
      "status": "active",
      "applicantsCount": 45,
      "postedAt": "2025-01-15T10:00:00Z",
      "expiresAt": "2025-02-15T10:00:00Z"
    },
    "hasApplied": false,
    "isSaved": true
  }
}
```

---

#### POST `/`
Create a new job (Employer only).

**Headers:** `Authorization: Bearer <accessToken>`

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "requirements": ["5+ years of experience", "Strong JavaScript skills"],
  "location": "San Francisco, CA",
  "type": "full-time",
  "category": "IT & Software",
  "salaryMin": 120000,
  "salaryMax": 180000,
  "salaryCurrency": "USD",
  "salaryPeriod": "yearly",
  "experienceLevel": "senior",
  "skills": ["JavaScript", "Angular", "Node.js"],
  "benefits": ["Health insurance", "401k"],
  "status": "active",
  "expiresAt": "2025-02-15T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "job": { /* Created job */ }
  }
}
```

---

#### PUT `/:id`
Update a job (Employer only, own jobs).

**Headers:** `Authorization: Bearer <accessToken>`

**Request:** Same as POST (partial updates allowed)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job": { /* Updated job */ }
  }
}
```

---

#### DELETE `/:id`
Delete a job (Employer only, own jobs).

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

#### GET `/employer/my-jobs`
Get employer's own jobs.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:** Same as GET `/` plus `status` filter

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobs": [ /* Jobs with applicant details */ ],
    "stats": {
      "totalJobs": 5,
      "activeJobs": 3,
      "totalApplicants": 120,
      "hiredCount": 8
    },
    "pagination": { /* ... */ }
  }
}
```

---

## Applications API

### Base URL: `/api/applications`

**Headers (all endpoints):** `Authorization: Bearer <accessToken>`

---

#### POST `/`
Apply to a job (Job Seeker only).

**Request:**
```json
{
  "jobId": "uuid",
  "coverLetter": "I am excited to apply..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "uuid",
      "jobId": "uuid",
      "status": "pending",
      "appliedAt": "2025-01-20T10:00:00Z"
    }
  }
}
```

**Errors:**
- `400` - Already applied
- `404` - Job not found
- `403` - Job is closed

---

#### GET `/my-applications`
Get job seeker's applications.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "uuid",
        "job": {
          "id": "uuid",
          "title": "Senior Software Engineer",
          "company": {
            "name": "TechCorp Inc.",
            "logo": "https://..."
          },
          "location": "San Francisco, CA"
        },
        "status": "reviewed",
        "appliedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

#### GET `/job/:jobId`
Get applications for a job (Employer only, own jobs).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "uuid",
        "applicant": {
          "id": "uuid",
          "fullName": "John Doe",
          "avatar": "https://...",
          "location": "San Francisco, CA",
          "skills": ["JavaScript", "Angular"]
        },
        "status": "pending",
        "coverLetter": "I am excited...",
        "cvUrl": "https://...",
        "appliedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

#### PUT `/:id/status`
Update application status (Employer only).

**Request:**
```json
{
  "status": "shortlisted",
  "notes": "Strong candidate, schedule interview"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "application": { /* Updated application */ }
  }
}
```

---

## Saved Jobs API

### Base URL: `/api/saved-jobs`

**Headers (all endpoints):** `Authorization: Bearer <accessToken>`

---

#### GET `/`
Get saved jobs (Job Seeker only).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "savedJobs": [
      {
        "id": "uuid",
        "job": {
          "id": "uuid",
          "title": "Senior Software Engineer",
          "company": { /* ... */ },
          "location": "San Francisco, CA",
          "type": "full-time",
          "salaryMin": 120000,
          "salaryMax": 180000
        },
        "savedAt": "2025-01-18T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST `/:jobId`
Save a job.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Job saved successfully"
}
```

---

#### DELETE `/:jobId`
Unsave a job.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job removed from saved"
}
```

---

## Messages API

### Base URL: `/api/messages`

**Headers (all endpoints):** `Authorization: Bearer <accessToken>`

---

#### GET `/conversations`
Get user's conversations.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "participant": {
          "id": "uuid",
          "name": "TechCorp Inc.",
          "avatar": "https://..."
        },
        "job": {
          "id": "uuid",
          "title": "Senior Software Engineer"
        },
        "lastMessage": {
          "content": "We'd like to schedule an interview",
          "sentAt": "2025-01-20T10:00:00Z",
          "isRead": false
        },
        "unreadCount": 2
      }
    ]
  }
}
```

---

#### GET `/conversations/:id`
Get conversation messages.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Messages per page (default: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid",
      "participant": { /* ... */ },
      "job": { /* ... */ }
    },
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": "Hello, I reviewed your application...",
        "isRead": true,
        "sentAt": "2025-01-20T09:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

#### POST `/conversations/:id`
Send a message.

**Request:**
```json
{
  "content": "Thank you for your response..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "content": "Thank you for your response...",
      "sentAt": "2025-01-20T10:30:00Z"
    }
  }
}
```

---

#### POST `/conversations`
Start a new conversation (Employer initiating contact with applicant).

**Request:**
```json
{
  "recipientId": "uuid",
  "applicationId": "uuid",
  "content": "Hello, we'd like to discuss your application..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "conversation": { /* New conversation */ },
    "message": { /* First message */ }
  }
}
```

---

#### PUT `/conversations/:id/read`
Mark conversation as read.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes:
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Authentication endpoints:** 5 requests/minute
- **General API:** 100 requests/minute
- **File uploads:** 10 requests/hour

---

## Pagination Format

All paginated responses include:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```
