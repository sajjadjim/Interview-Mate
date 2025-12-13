# 🚀 Interview Mate
![Project Banner](https://github.com/sajjadjim/Interview-Mate/blob/main/Banner_image.png?raw=true)

Bridging the gap between ambitious talent and innovative companies through real-time, topic-focused interviews.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/tech-Next.js-black?logo=nextdotjs)
![Language](https://img.shields.io/badge/language-JavaScript-yellow?logo=javascript)

---

## 🧭 Table of Contents

1. [About The Project](#-about-the-project)
2. [Live Preview](#-live-preview-optional)
3. [User Roles & Flows](#-user-roles--flows)
4. [Site Map (Pages Overview)](#-site-map-pages-overview)
5. [Architecture & Code Structure](#-architecture--code-structure)
6. [Data & APIs](#-data--apis)
7. [Tech Stack](#-tech-stack)
8. [Getting Started](#-getting-started)
9. [Contributing](#-contributing)
10. [License](#-license)
11. [Author](#-author)

---

## 🌟 About The Project

**Interview Mate** is a modern web platform built with **Next.js** to connect:

- 🎓 **Students / Candidates** who want:
  - Real interview experience
  - Topic-focused practice
  - A way to showcase their skills

- 🏢 **Companies / HR** who want:
  - Better pre-screened candidates
  - Topic-specific interviews (e.g. *React*, *DSA*, *Management*)
  - A single place to manage interview slots & applications

The platform supports:

- Demo interview slots
- Real company job postings
- Candidate applications
- Company dashboards to see applicants & shortlist them

---

## 🌍 Live Preview (optional)

> Add your live URL here (if deployed):

```bash
https://your-deploy-url.com
```

## 👥 User Roles & Flows

The system currently uses Firebase Auth + MongoDB and works around these roles:

## 1. Guest (Not Logged In)
```text
Can see:

Home page
Public job listings (/jobs)
Job details (/jobs/[id])
About, Contact, etc.

Cannot:

Apply for jobs
Apply for interview slots
See any dashboards or private data
```
## 2. Candidate
```text
Logs in via Firebase
Has a MongoDB user document with role: "candidate"

Can:

Maintain their candidate profile (including resumeUrl, portfolio, etc.)
Apply for interview slots via /apply
Apply for jobs via /jobs/[id] (Apply button)
View all applications in /applications:
Interview slot applications
Job applications (from users_jobs_application)
```
## 3. Company
```text
Logs in via Firebase
Has a MongoDB user document with role: "company"

Can:
Set up a company profile (name, info)
Post jobs (stored in jobs collection)
See a company dashboard (/dashboard) with:
Total jobs posted
Total applications received
Latest posted jobs
```
## View candidate applications in /candidate_applications:

Filter by job
Search applicants by email
Open candidate CV from resumeUrl
Shortlist candidates → cv_shortListed_database
Delete applications
```
-----

⚠️ There is also support for HR role in other parts of the app (e.g. /interviews & interview slots). This README focuses on the core candidate/company flows.

## 🗺 Site Map (Pages Overview)

This is the high-level map of important routes and who can access them:
```bash
/                           → Public home page
/jobs                       → Public job listings
/jobs/[id]                  → Job details + "Apply" for candidates
/apply                      → Interview slot application (for logged-in users)
/interviews                 → HR/admin view of interview slot applicants (protected)
/applications               → Candidate "My Applications" (interviews + jobs)
/candidate_applications     → Company view of all applicants for its jobs
/shortlist_candidates       → Company view of shortlisted candidates
/dashboard                  → Auth-only dashboard; company sees job stats
/profile                    → User profile (candidate/company fields)
/authentication/login       → Login
/authentication/register    → Registration

````

Access rules (simplified):
```text
Route	                 Guest	Candidate	Company	HR/Admin
/	                      ✅	   ✅	    ✅	        ✅
/jobs, /jobs/[id]	      ✅	   ✅	    ✅	        ✅
/dashboard	              ❌       ✅    	✅       	✅
/apply	                  ❌	   ✅	    ❌	        ❌
/applications	          ❌	   ✅	    ❌	        ❌
/candidate_applications	  ❌	   ❌     	✅          ❌
/shortlist_candidates	  ❌	   ❌	    ✅        	❌
/interviews	              ❌	   ❌	    ❌          ✅

```


Candidate dashboard currently shows a simpler view; company dashboard shows job stats.



## 🏗 Architecture & Code Structure
Folder Overview (simplified)
```bash

src/
  app/
    (public pages)
    page.jsx                   → Home
    jobs/
      page.jsx                 → Job listing
      [id]/page.jsx            → Single job details + candidate "Apply"
    apply/page.jsx             → Interview slot application form
    applications/page.jsx      → Candidate "My Applications"
    candidate_applications/    → Company view of all applicants
      page.jsx
    shortlist_candidates/      → Company view of shortlisted candidates
      page.jsx
    dashboard/page.jsx         → Role-aware dashboard
    authentication/
      login/page.jsx
      register/page.jsx

    api/
      users/
        me/route.js            → Get/update logged-in user doc (requires Firebase token)
      applications/route.js    → Interview slot applications (apply + list)
      users-jobs-application/route.js
                               → Job applications (apply, list, check duplicate)
      jobs/route.js            → Get/post jobs (list, create)
      jobs/[id]/route.js       → Single job fetch
      company/
        candidate-applications/route.js
                               → Company: jobs + applicants + counts
        shortlist/route.js     → Company: add candidate to shortlist
        shortlist-candidates/route.js
                               → Company: read shortlisted candidates
        candidate-applications (DELETE)
                               → Company: delete an application

  context/
    AuthContext.jsx            → Firebase auth state, user, logout, etc.

  lib/
    dbConnect.js               → MongoDB connection helper
    firebaseClient.js          → Firebase client config
    firebaseAdmin.js           → Firebase Admin (ID token verification)

```


## 🧩 Data & APIs

```text
Here are the main collections in MongoDB and how they are used.
--
1. users Collection

Stores extended profile data for authenticated users.
--
2.Key fields:

uid – Firebase UID
email

role – "candidate" or "company" (and possibly "hr", "admin" in future)
status – "active", "inactive" etc.

--
 3.candidateProfile:

firstName, lastName
phone, address
educationalQualification
currentJobPosition
resumeUrl
portfolioUrl
companyProfile:
companyName
companyAddress

```

API:
```text
1. GET /api/users/me
→ Returns the current logged-in user document. Requires:
Authorization: Bearer <Firebase ID Token>

PATCH /api/users/me
→ Updates candidate/company profile fields.
```

2. jobs Collection

Represents jobs posted by companies.

Example fields:
_id
id (optional human readable e.g. "JOB-001")
title
company
sector
type (Full-time, Part-time, etc.)
location
salary:
min
max

currency
jobVacancy
jobTime
jobAddress
postedDate
deadline
expireAt
description
requirements[]
responsibilities[]
createdByEmail (company user’s email)

 ## 1.APIs:
```text
GET /api/jobs – List jobs (for /jobs)
GET /api/jobs/[id] – Single job (for /jobs/[id])
```
3. users_jobs_application Collection
```text
Stores job applications submitted by candidates.

Example fields:
jobId – references jobs._id
jobTitle, company, sector, type, location
salary
postedDate, jobVacancy, jobTime, jobAddress, jobDeadline
candidateUid
candidateEmail, candidateName, candidatePhone, candidateAddress
resumeUrl
status – e.g. "submitted", "shortlisted", "accepted", "rejected"
appliedAt – when candidate applied
createdAt, updatedAt
```

## 2.APIs:
```text
POST /api/users-jobs-application – Candidate applies for a job:
Validates candidate role
Verifies resumeUrl exists in candidateProfile
Prevents duplicate applications (candidateUid + jobId)
GET /api/users-jobs-application?candidateUid=... – Candidate’s own applications (for /applications page)
GET /api/users-jobs-application?candidateUid=...&jobId=... – Check if already applied
```

## 3. Interview Slot Applications (applications Collection)
```text
For the /apply interview slots (time/date/topic).

Fields include:

name, email

date, timeSlot

topic

paymentStatus (default: "unpaid")

approvalStatus (default: "Not approved")

createdAt, updatedAt
```
## 4. APIs:
```text
POST /api/applications – Submit new slot request

GET /api/applications?email=... – Candidate’s own slot applications

GET /api/applications – HR/admin can see all
```

## 5. Shortlisted Candidates (cv_shortListed_database)
```text
Stores shortlists per company.

Fields (per entry) roughly:

companyEmail

jobId, jobTitle, company, sector, location, etc.

Candidate info:

candidateUid, candidateEmail, candidateName, candidatePhone, candidateAddress

resumeUrl

status (e.g. "shortlisted")

applicationId (reference to original application)

createdAt
```

APIs:
```text
POST /api/company/shortlist – Company shortlists an application
GET /api/company/shortlist-candidates?companyEmail=...
Used on /shortlist_candidates
DELETE /api/company/candidate-applications – Delete application (also updates counts)
```
## 🧪 Tech Stack
Core technologies used:

**Framework: Next.js**

**UI Library: React**

**Styling: Tailwind CSS**

**Auth: Firebase Authentication**

**Database: MongoDB**

**ORM / DB Helper: Custom dbConnect using MongoDB driver**
**Animations: Framer Motion**
**Icons: Lucide React**

In an earlier concept, NextAuth.js and Prisma were “suggested”, but the current implementation uses Firebase Auth + MongoDB instead.


```text
🚀 Getting Started
1️⃣ Prerequisites

Node.js ≥ 18

npm or yarn
```
A MongoDB connection (MongoDB Atlas or local)

A Firebase project (for Web) + Service Account (for Admin SDK)



2️⃣ Installation

Clone the repo
```bash
git clone https://github.com/sajjadjim/interview-mate.git
```
```bash
cd interview-mate
```

Install dependencies
```bash
npm install
# or
yarn install
```

Environment variables

Create .env.local in the project root:
```bash
# --- MongoDB ---
MONGODB_URI="your_mongodb_connection_string"

# --- Firebase Client (for AuthContext etc.) ---
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"

# --- Firebase Admin (for secure APIs like /api/users/me) ---
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="service-account@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"
```

Run the development server
```bash
npm run dev
# or
yarn dev
```

Open:

http://localhost:3000

## 🔐 Authentication & Security (Quick Overview)


Client-side:
```text
AuthContext uses Firebase Auth (email/password, Google, etc.)

Exposes user, loading, logout to components
```
## Server-side APIs:
```text
Sensitive routes (like /api/users/me, some company APIs) expect:

Authorization: Bearer <Firebase ID Token>

On the server, firebaseAdmin.verifyIdToken() verifies the token and gets uid.

MongoDB queries user with uid and checks role before returning data.
```
```text
#Role-based UI:
Navbar hides Jobs, Apply, Interviews, etc. depending on role and loading state.

Pages like /candidate_applications and /shortlist_candidates hard-block non-company roles by redirecting to /404.
```

## 🤝 Contributing

Contributions are welcome! 💙

Fork the repo

Create your feature branch:

git checkout -b feature/amazing-feature


Commit your changes:

git commit -m "Add amazing feature"


Push to the branch:

git push origin feature/amazing-feature


Open a Pull Request

## 📜 License

Distributed under the MIT License.
See LICENSE for more information.

## 👤 Author
```text
Sajjad Hossain Jim
GitHub: @sajjadjim
```


<br /> <p align="center"> Made with ❤️ to help candidates and companies connect better. </p> ```

If you want, I can next:
Add a sequence diagram (text/mermaid) showing how a candidate applies for a job, or
Add a separate docs/ file just for API documentation.



