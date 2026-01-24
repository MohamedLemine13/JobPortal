# 📚 Job Portal API Reference

This guide provides example JSON payloads for testing the API endpoints.

## 🔐 Authentication

### 1. Register a Job Seeker
**POST** `/api/auth/register`
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "job_seeker",
  "fullName": "John Doe"
}
```

### 2. Register an Employer
**POST** `/api/auth/register`
```json
{
  "email": "hr@techcorp.com",
  "password": "password123",
  "role": "employer",
  "fullName": "Sarah Smith",
  "companyName": "TechCorp Inc."
}
```

### 3. Login
**POST** `/api/auth/login`
```json
{
  "email": "hr@techcorp.com",
  "password": "password123"
}
```
> **Response**: You will receive an `accessToken`. Use this token in the header for subsequent requests:  
> `Authorization: Bearer <your_access_token>`

---

## 💼 Jobs

### 1. Create a Job (Employer Only)
**POST** `/api/jobs`  
*Requires Authorization Header*

```json
{
  "title": "Senior Java Developer",
  "description": "We are looking for an experienced Java developer to join our team.",
  "location": "New York, NY (Remote)",
  "type": "FULL_TIME",
  "category": "Software Engineering",
  "salaryMin": 120000,
  "salaryMax": 150000,
  "salaryCurrency": "USD",
  "salaryPeriod": "YEARLY",
  "experienceLevel": "SENIOR",
  "requirements": [
    "5+ years of Java experience",
    "Spring Boot expertise",
    "PostgreSQL knowledge"
  ],
  "skills": ["Java", "Spring Boot", "SQL"],
  "benefits": ["Health Insurance", "401k", "Remote Work"],
  "expiresAt": "2026-12-31T23:59:59"
}
```

### 2. Get All Jobs (Public)
**GET** `/api/jobs?page=1&limit=20`

### 3. Get Job Details
**GET** `/api/jobs/{jobId}`

---

## 📝 Applications

### 1. Apply for a Job (Job Seeker Only)
**POST** `/api/applications`  
*Requires Authorization Header*

```json
{
  "jobId": "replace-with-uuid-of-job",
  "coverLetter": "I am excited to apply for this position. I have the required skills..."
}
```
*Note: You must upload a CV to your profile before applying.*

### 2. Upload CV (Job Seeker)
**POST** `/api/profile/me/cv`  
*Content-Type: multipart/form-data*
- **cv**: [Select a PDF file]

---

## 💬 Messages

### 1. Start Conversation
**POST** `/api/messages/conversations`
```json
{
  "recipientId": "replace-with-user-uuid",
  "content": "Hello, I have a question about the job posting."
}
```
