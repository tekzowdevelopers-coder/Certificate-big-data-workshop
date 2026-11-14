# RRCE Workshop Feedback & Certificate Generation Portal
## Next Gen Big Data & Hadoop Workshop (30th & 31st Oct 2026)

**Institution:** RajaRajeswari College of Engineering (RRCE), Bengaluru  
**Department:** Information Science and Engineering & CSI Chapter of RRCE & "VO'ISE"  
**Workshop Presenter:** Mr. Sankar K, CEO – Tekzow & Tekzow Academy  

---

## 🌟 Overview

A lightweight, production-grade MERN web application that automates the collection of student feedback and dynamically generates verified participation certificates using the official RRCE PowerPoint template (`Certificate RRCE (1).pptx`).

Students access the portal without needing an account, provide their academic details and structured feedback, and instantly receive and download their personalized PDF certificate. An administrative dashboard offers real-time submission tracking, feedback analytics, and CSV exports.

---

## 🚀 Key Features

### 🎓 Student Portal
- **Clean Landing Page:** Workshop title, presenter info, dates, syllabus highlights, and direct CTAs.
- **Student Information Form:** Name, USN (uppercase auto-formatting), department dropdown, college name, email, and mobile number.
- **Comprehensive Feedback Form:**
  - **Section A (Workshop Experience):** Overall rating, trainer knowledge, Big Data concept explanation, Hadoop practical demo, and academic relevance.
  - **Section B (Learning Outcomes):** Knowledge gain, peer recommendation, and workshop highlights.
  - **Section C (Suggestions):** Free-form comment box with character counter (max 500 chars).
- **Pre-submission Verification Modal:** Ensures student name and USN are accurate before final submission.
- **Duplicate USN Prevention:** Compound database constraint preventing duplicate submissions per workshop.
- **Returning Student Lookup:** Students who already submitted can retrieve and re-download their certificate instantly using their USN.
- **Dynamic Certificate Generation:**
  - Preserves 100% of the original RRCE template design, institution crests, CSI logo, Tekzow logo, Apache Hadoop mascot, and all 5 official signatures.
  - Generates standard A4 Landscape PDF (`RRCE_Workshop_Certificate_<USN>.pdf`).
  - Also generates dynamically populated original PowerPoint (`.pptx`) files.
  - Interactive on-screen certificate preview with celebratory confetti.

### 🛡️ Admin Dashboard
- **JWT-Protected Login:** Secure credential verification with bcrypt password hashing.
- **Summary Metrics Cards:**
  - Total Registered Students
  - Total Feedback Submissions
  - Total Certificates Generated
  - Average Workshop Rating (out of 5.0)
- **Student Records Table:**
  - Live search by student name, USN, or email.
  - Filter by engineering department.
  - Individual feedback modal inspection.
  - Certificate preview and direct PDF download.
  - Full CSV export of all student submissions and responses.
- **Feedback Analytics:**
  - Rating distribution breakdowns across all categories.
  - Learning outcome & recommendation percentages.
  - Student suggestion feed with submission timestamps.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast, responsive Single Page Application |
| **Styling** | Tailwind CSS v4 | Clean UI with RRCE institutional palette |
| **Icons** | Lucide React | Modern, clean vector iconography |
| **Backend** | Node.js + Express 5 | RESTful API server with error handling |
| **Database** | MongoDB / Mongoose | Relational document store with auto-resilient local fallback |
| **PDF Generation** | `pdf-lib` | Pure JavaScript, vector-crisp A4 Landscape PDF engine |
| **PPTX Generation**| `jszip` | Direct XML slide modification of the official PowerPoint template |
| **Auth** | JWT + bcryptjs | Protected administrative sessions |

---

## 📁 Project Structure

```
rrce-feedback-certificate-portal/
├── client/                     # Frontend React (Vite + Tailwind CSS)
│   ├── public/                 # Static assets (RRCE, Tekzow, CSI logos, signatures)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CertificatePreview.jsx  # High-fidelity certificate preview
│   │   │   ├── StudentPortal.jsx       # Student landing, form, and download view
│   │   │   └── AdminPortal.jsx         # Admin dashboard, table, & analytics
│   │   ├── App.jsx             # Main application orchestrator
│   │   └── index.css           # Tailwind CSS directives
│   ├── package.json
│   └── vite.config.js          # Vite config with API reverse proxy
│
├── server/                     # Backend API & Certificate Engine
│   ├── data/
│   │   └── store.json          # Persistent JSON store / fallback
│   ├── certGenerator.js        # Dual PDF & PPTX certificate rendering engine
│   ├── db.js                   # Unified database layer (MongoDB + fallback)
│   ├── index.js                # Express 5 REST API routes & static server
│   ├── test_cert.js            # Certificate generator test suite
│   └── verify_all.js           # Full SRS end-to-end integration test
│
├── templates/
│   ├── Certificate RRCE (1).pptx  # Original master PowerPoint certificate
│   └── assets/                 # Extracted logos and dignitary signatures
│
├── package.json                # Project root runner
└── README.md
```

---

## ⚡ Quick Start & Running

### 1. Start the Full-Stack Application
From the project directory:
```bash
npm start
```
The server will start on **`http://localhost:5000`** and serve both the frontend and backend APIs.

### 2. Run in Development Mode (with Vite HMR)
In separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Frontend Vite Dev Server (Port 5173)
npm run client
```

### 3. Run Automated SRS Compliance Verification
```bash
node server/verify_all.js
```

---

## 🔑 Default Administrator Credentials

| Role | Email | Password |
|---|---|---|
| **RRCE Admin** | `admin@rrce.org` | `admin123` |
| **Tekzow Admin** | `admin@tekzow.com` | `tekzow2026` |

---

## 📜 Official Certificate Signatories Included

The certificate dynamically populates the student name and USN while preserving:
1. **Mr. Dineshkumar M** – Staff Coordinator
2. **Dr. D. Sivakumar** – Staff Coordinator
3. **Dr. Sreenivasa Murthy V** – HOD - ISE
4. **Dr. R Balakrishna** – Principal
5. **Mr. Sankar K** – CEO @ Tekzow

Generated PDFs follow the required naming specification:
`RRCE_Workshop_Certificate_<USN>.pdf` (e.g., `RRCE_Workshop_Certificate_1RR23IS001.pdf`).
