# 📍 Job Radar – Smart Job Discovery Platform

Job Radar is a full-stack job portal that connects employers and job seekers using real-time location services and AI-powered resume matching.

Employers can post IT and non-IT jobs with automatic skill extraction from job descriptions, while job seekers can discover nearby jobs on an interactive map and apply with intelligent match scoring.

---

## 🚀 Features

### 👨‍💼 Employer
- Create company/shop profile
- Post job vacancies with location detection
- Automatic skill & experience extraction from job description
- View job applicants with resume details

### 👩‍🎓 Job Seeker
- Location-based job discovery on live map
- Click job location to view company details
- AI resume matching with match percentage
- One-click job application

### 🤖 AI Intelligence
- Skill extraction from job description
- Resume-to-job similarity matching
- Smart recommendations

### 📍 Location Services
- Nearby job search using GPS
- Map markers for all jobs
- Radius-based filtering

---

## 🧰 Tech Stack

**Frontend:** React, Map APIs  
**Backend:** FastAPI (Python)  
**Database:** MySQL  
**AI/NLP:** Skill extraction & resume matching  
**Authentication:** JWT  

---

## 📂 Core Modules

- Role-based authentication (Employer, Job Seeker, Admin)
- Job posting & management
- AI extraction engine
- Location-based search engine
- Application tracking system

---

## ⚙️ Installation

```bash
git clone https://github.com/yogaraaj25/Job-Radar.git
cd Job-Radar
pip install -r requirements.txt
uvicorn main:app --reload
