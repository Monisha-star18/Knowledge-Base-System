# 📚 InsightHub – Knowledge Base Management System

## Abstract

**InsightHub** is a responsive web-based Knowledge Base Management System developed using **HTML5, CSS3, Bootstrap 5, JavaScript, jQuery, and JSON Server**. The application provides a centralized platform for creating, managing, reviewing, and publishing knowledge articles through a role-based access system.

The system supports three types of users—**Admin**, **Author**, and **Reader**—each with dedicated dashboards and permissions. Authors can create and manage articles, Admins review and approve submitted content, and Readers can browse and search published knowledge articles. The project demonstrates CRUD operations, client-side validation, session management, and REST API integration using JSON Server.

---

# Table of Contents

1. Project Overview
2. Types of Users
3. Dashboards
4. Features
5. Technology Stack
6. Project Structure
7. Main Logic & Workflows
8. Screenshots
9. Installation

---

# Project Overview

InsightHub is designed to simplify knowledge sharing within an organization by providing a structured workflow for article creation and publication.

The application follows a review-based publishing process:

* Authors submit articles.
* Admin reviews each submission.
* Approved articles become visible to Readers.
* Rejected articles include review remarks for correction.

---

# Types of Users

## 👤 Reader

**Purpose**

Readers are the end users of the application. They can browse, search, and read approved knowledge articles.

### Permissions

* Register account
* Login
* View published articles
* Search articles
* Read complete article

---

## ✍️ Author

**Purpose**

Authors create and manage articles for publication.

### Permissions

* Login
* Create new article
* Edit own articles
* Delete own articles
* View article status
* Track approved/rejected articles

---

## 👨‍💼 Admin

**Purpose**

The Admin manages the publishing workflow and ensures content quality.

### Permissions

* Review submitted articles
* Approve articles
* Reject articles
* Add review remarks
* View all articles
* Manage article lifecycle

---

# Dashboards

The application contains **three dashboards**, each designed for a specific user role.

---

## 1. Reader Dashboard

**Accessible By**

* Reader

### Purpose

Provides an interface for exploring published articles.

### Functions

* Browse articles
* Search articles
* View article details
* Read complete content

---

## 2. Author Dashboard

**Accessible By**

* Author

### Purpose

Allows authors to create and manage their own articles.

### Functions

* Add article
* Edit article
* Delete article
* Monitor article approval status
* View published and reapply articles

---

## 3. Admin Dashboard

**Accessible By**

* Admin

### Purpose

Responsible for reviewing and approving submitted articles.

### Functions

* Review pending articles
* Approve submissions
* Reject submissions
* Add rejection remarks
* Manage article publication

---

# Features

### Authentication

* User Registration
* Secure Login
* Logout
* Role-Based Authentication
* Session Management using Local Storage

### Article Management

* Create Articles
* Edit Articles
* Delete Articles
* View Article Status
* Publish Approved Articles

### Review System

* Pending Review
* Article Approval
* Article Rejection
* Review Remarks

### Reader Features

* Search Articles
* Filter by Category
* Read Full Article
* Responsive Reading Experience

### Validation

* Required Field Validation
* Email Validation
* Password Validation
* Unique Email Check
* Date Validation

### User Experience

* Responsive Design
* Bootstrap Components
* SweetAlert2 Notifications
* Modern UI
* Interactive Navigation

---

# Technology Stack

| Technology                  | Purpose              |
| --------------------------- | ---------------------|
| HTML5                       | Page Structure       |
| CSS3                        | Styling              |
| Bootstrap 5                 | Responsive Design    |
| JavaScript (ES6)            | Business Logic       |
| jQuery                      | DOM Manipulation     |
| JSON Server                 | Mock REST API        |
| SweetAlert2                 | Alert Messages       |
| Confetti JS                 |celebration animation |   
| Font Awesome / Tabler Icons | Icons                |
| Local Storage               | User Session         |

---

## 📁 Project Structure

```
Knowledge Base System/
│
├── assets/
│   └── images/
│       ├── png/
│       │   └── img-removebg-preview.png
│       └── svg/
│           ├── image.svg
│           ├── readme-brands-solid-full.svg
│           └── Rocket research.svg
│
├── data/
│   └── db.json
│
├── pages/
│   ├── addArticle.html
│   ├── adminDashboard.html
│   ├── authorDashboard.html
│   ├── index.html
│   ├── readmore.html
│   └── userDashboard.html
│
├── scripts/
│   ├── addArticle.js
│   ├── adminDashboard.js
│   ├── authorDashboard.js
│   ├── landing.js
│   ├── readmore.js
│   ├── shared.js
│   └── userDashboard.js
│
├── styles/
│   ├── addArticle.css
│   ├── adminDashboard.css
│   ├── authorDashboard.css
│   ├── landing.css
│   ├── readmore.css
│   ├── theme.css
│   └── userDashboard.css
│
└── readme.md
```
---

# Main Logic & Workflows

## User Authentication

```
Register
      ↓
Login
      ↓
Role Verification
      ↓
Redirect to Corresponding Dashboard
```

---

## Article Submission Workflow

```
Author Creates Article
          ↓
 Status = Pending
          ↓
Admin Reviews Article
      ↓           ↓
 Approved     Rejected
      ↓           ↓
Visible to     Author receives
Readers        Review Remarks and can reapply
```

---

## Session Management

```
User Login
      ↓
User Information Stored
in Local Storage
      ↓
Protected Pages Accessible
      ↓
Logout Clears Session
```

---


# Screenshots

Include screenshots of the following pages:

* Landing Page

* Login Page

* Registration Page

* Reader Dashboard

* Author Dashboard

* Admin Dashboard

* Add Article Page

* Read Article Page

* Profile Page

* Review Modal



---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/InsightHub.git
```

---

## 2. Open the Project

Open the project folder using **Visual Studio Code**.

---

## 3. Install JSON Server

```bash
npm install -g json-server
```

---

## 4. Start the Backend

```bash
cd data
json-server --watch data/db.json --port 3000
```

Backend URL:

```
http://localhost:3000
```

---

## 5. Launch the Application

Open **index.html** .

---


