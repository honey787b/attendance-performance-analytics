# attendance-performance-analytics
capstone project

# PresentTrack — Attendance & Performance Analytics

**Capstone Project**

PresentTrack is a web-based attendance and academic performance analytics system designed to help students, faculty, and administrators monitor attendance, academic performance, analytics, timetables, and student progress in one place.

## 🚀 Features

### 👨‍🎓 Student

* View personal attendance
* View academic performance and marks
* View subject-wise and overall analytics
* View timetable
* View academic reports
* Access student-specific information securely

### 👩‍🏫 Faculty

* View relevant student information
* Manage attendance
* Manage academic performance data
* Monitor student progress
* Access faculty-specific features

### 🛡️ Management / Admin

* Manage students and faculty
* Monitor attendance and performance
* View analytics
* Manage attendance rules
* Manage holidays
* Generate academic reports
* Manage system settings

## 📊 Attendance & Performance

PresentTrack provides:

* Subject-wise attendance tracking
* Attendance percentage calculation
* Attendance sessions and records
* Internal marks and performance tracking
* Semester-based performance analysis
* Performance trends
* At-risk student identification
* Intervention plan generation

## 📈 Analytics

The analytics system provides insights into:

* Subject-wise performance
* Overall academic performance
* Attendance trends
* Students requiring academic attention
* Performance patterns across semesters

## 🗓️ Timetable

Users can:

* View the weekly timetable
* Navigate between weeks
* View scheduled subjects and timings
* Export timetable data

## 📄 Reports & Exports

PresentTrack supports generating and exporting academic information in multiple formats, including:

* PDF
* Excel
* CSV

## 🔐 Security & Role-Based Access

PresentTrack uses authentication and role-based access control to ensure users can access only the features and information appropriate to their role.

The system supports:

* Student accounts
* Faculty accounts
* Admin accounts
* Authenticated API requests
* Role-based page access
* Student-specific data access

## 🛠️ Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Authentication & Security

* JWT
* bcrypt

### Other Technologies

* CORS
* dotenv
* REST APIs

## 📁 Project Structure

```text
attendance-performance-analytics/
│
├── js/
│   ├── app.js
│   ├── reports.js
│   ├── settings.js
│   └── ...
│
├── pages/
│   ├── index.html
│   ├── dashboard.html
│   ├── attendance.html
│   ├── performance.html
│   ├── analytics.html
│   ├── timetable.html
│   ├── settings.html
│   └── ...
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd attendance-performance-analytics
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and configure the required database and authentication settings.

Example:

```env
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=PresenTrack
DB_PORT=3306
JWT_SECRET=your_secret_key
PORT=5050
```

### 4. Set up the database

Create the MySQL database and import the required database schema/data.

### 5. Start the application

```bash
npm start
```

The application will run on the configured port.

## 👥 Project Team

**PresentTrack — Capstone Project**

Developed by:

* Yasaswini
* Mithula
* Hema
* Syamala

## 🎯 Project Goal

The goal of PresentTrack is to provide a centralized academic monitoring platform that makes attendance and performance information easier to access, understand, and manage.

By combining attendance tracking, performance analytics, reports, and role-based access in a single application, PresentTrack aims to support better academic monitoring and early identification of students who may need additional support.

## 📌 Project Status

**Capstone Project — Completed**

PresentTrack includes the core attendance, performance, analytics, timetable, reporting, authentication, and role-based functionality required for the project.

---

**PresentTrack — Making academic progress easier to track.**
