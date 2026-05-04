# 📘 AI-Enhanced Smart Restaurant Ordering System
### Project Documentation — Learning While Building

> This document is a living reference. It will be updated as we build each part of the project.
> Every section explains **what** we are doing and **why** — so you understand the reasoning, not just the code.

---

## 📌 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Full Tech Stack](#2-full-tech-stack)
3. [Frontend Stack — Detailed Explanation](#3-frontend-stack--detailed-explanation)
4. [Backend Stack — Detailed Explanation](#4-backend-stack--detailed-explanation)
5. [System Architecture](#5-system-architecture)
6. [Project Flow](#6-project-flow)
7. [Folder Structure (Planned)](#7-folder-structure-planned)
8. [Build Progress Log](#8-build-progress-log)

---

## 1. Project Overview

**Project Name:** AI-Enhanced Smart Restaurant Ordering System  
**Purpose:** Replace traditional waiter-based ordering with a QR-code-based digital ordering system that includes AI-powered recommendations.

**Two sides of the system:**
| Side | Who Uses It | What It Does |
|------|------------|-------------|
| Customer UI | Restaurant customers | Scan QR → Browse menu → Order → Pay |
| Admin Dashboard | Restaurant owner | Manage menu, track orders, view analytics |

---

## 2. Full Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js | Builds the customer UI and admin dashboard |
| **Styling** | Tailwind CSS | Designs the layout, colors, and responsive UI |
| **Animations** | Framer Motion | Adds smooth transitions and micro-animations |
| **3D / Visual Effects** | Spline | Adds 3D interactive elements for premium feel |
| **Backend Language** | Python | Core programming language |
| **Backend Framework** | Django | Handles routing, logic, API, and admin |
| **Database** | MongoDB Atlas | Stores menu, orders, users, billing data |
| **Image Storage** | Django Media Folder | Stores dish images locally |
| **Payment** | UPI QR Code (Prototype) | Shows a QR at checkout for payment |
| **AI Module** | Python (Django backend) | Recommendations, smart search, suggestions |

---

## 3. Frontend Stack — Detailed Explanation

### 3.1 Next.js

**What is it?**  
Next.js is a React-based framework for building full web applications. It is developed by Vercel and is one of the most popular frameworks used in the industry today.

**Why are we using it?**
- It supports **file-based routing** — every file in the `pages/` or `app/` folder automatically becomes a route (URL) in the app. No need to configure routing manually.
- It supports **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)** — meaning pages load faster and are more SEO-friendly.
- It allows us to build a **professional-grade UI** with React components that are reusable, readable, and maintainable.
- It is perfect for this project because our customer UI and admin dashboard are two separate interfaces that Next.js can handle cleanly.

**What will we build with it?**
- Customer menu browsing page
- Dish detail pages
- Cart and checkout pages
- Admin dashboard pages
- Order tracking interface

---

### 3.2 Tailwind CSS

**What is it?**  
Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS files, you apply small pre-built classes directly in your HTML/JSX.

**Example:**
```html
<!-- Traditional CSS approach -->
<button class="my-button">Order Now</button>
/* then write CSS separately */

<!-- Tailwind approach -->
<button class="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600">
  Order Now
</button>
```

**Why are we using it?**
- Speeds up design — no switching between files
- Makes the UI **responsive** easily (mobile phones for customers scanning QR)
- Keeps styles consistent across all pages
- Works perfectly with Next.js out of the box
- Industry standard in modern web development

**What will we design with it?**
- Menu cards (dish image, name, price)
- Navigation bar
- Cart layout
- Billing screen
- Admin dashboard layout
- Mobile-first responsive design (critical since customers use phones)

---

### 3.3 Framer Motion

**What is it?**  
Framer Motion is an animation library for React. It lets you add smooth animations and transitions to your UI with very simple code.

**Example:**
```jsx
// A card that smoothly fades in and slides up when it appears
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  <DishCard />
</motion.div>
```

**Why are we using it?**
- Makes the app feel **alive and premium** — not boring and static
- Improves user experience significantly
- Easy to use — just wrap elements in `<motion.div>` and define animation properties
- Customers browsing the menu will feel a smooth, app-like experience

**What will we animate?**
- Dish cards sliding into view
- Cart drawer opening/closing
- Page transitions (menu → cart → billing)
- Add-to-cart button feedback
- AI recommendation cards appearing
- Popup modals for dish details

---

### 3.4 Spline

**What is it?**  
Spline is a tool for creating and embedding interactive 3D scenes in web applications. It exports a React component that you can drop into any Next.js page.

**Why are we using it?**
- Adds a **WOW factor** to the UI — makes it look premium and modern
- Can be used for a hero section (3D food scene), animated logo, or decorative background
- Very easy to embed in React — just install the package and paste the scene URL
- Makes the project stand out in a college presentation

**What will we use it for?**
- A 3D decorative element on the customer home/welcome screen
- Possibly a 3D logo or background animation
- Visual enhancement on the splash screen when the QR is first scanned

---

## 4. Backend Stack — Detailed Explanation

### 4.1 Python + Django

**What is it?**  
Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.

**Why are we using it?**
- Required by college guidelines
- Built-in admin panel (useful for restaurant management)
- Handles database connections, routing, and API creation cleanly
- Easy to connect with MongoDB using `djongo` or `pymongo`

**What will Django handle?**
- User registration and login (restaurant owners)
- Menu CRUD (Create, Read, Update, Delete)
- Order management API
- Billing logic
- QR code generation
- AI recommendation logic (Python-based)

---

### 4.2 MongoDB Atlas

**What is it?**  
A cloud-hosted NoSQL database that stores data in flexible JSON-like documents instead of rigid tables.

**Why are we using it?**
- Required by college guidelines
- Flexible schema — great for menu items (some have customizations, others don't)
- Cloud-based — accessible from anywhere
- Easy to scale if more restaurants are added

**What data will it store?**
- Restaurant profiles
- Menu categories and dishes
- Customer orders
- Billing records
- AI recommendation data (popular dishes, trending items)

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER (Phone)                      │
│  Scans QR Code → Opens Next.js Web App in Browser       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Requests (API calls)
┌──────────────────────▼──────────────────────────────────┐
│              DJANGO BACKEND (Python)                     │
│  • REST API endpoints                                    │
│  • Business logic                                        │
│  • AI recommendation module                              │
│  • QR code generation                                    │
│  • Billing calculation                                   │
└────────────┬─────────────────────┬──────────────────────┘
             │                     │
┌────────────▼──────┐   ┌──────────▼──────────────────────┐
│  MongoDB Atlas    │   │  Django Media Folder             │
│  (Cloud Database) │   │  (Dish Images stored here)       │
└───────────────────┘   └─────────────────────────────────┘
```

---

## 6. Project Flow

### Customer Flow
```
Scan QR
  → Welcome Screen (Spline 3D + Restaurant Name)
  → Browse Menu (Tailwind cards + Framer Motion animations)
  → Dish Detail Popup (image, description, customization)
  → Cart (items, quantity, total)
  → Billing Screen (itemized bill + tax)
  → Payment (UPI QR)
  → Order Confirmation (order number + estimated time)
```

### Restaurant Owner Flow
```
Register / Login
  → Admin Dashboard
  → Add/Edit/Delete Menu Items
  → Upload Dish Images
  → View Incoming Orders
  → Update Order Status
  → View Sales Analytics
```

---

## 7. Folder Structure (Planned)

```
smart-restaurant/
│
├── frontend/                  ← Next.js app
│   ├── app/                   ← Next.js App Router
│   │   ├── page.jsx           ← Home / Welcome screen
│   │   ├── menu/              ← Menu browsing page
│   │   ├── cart/              ← Cart page
│   │   ├── billing/           ← Billing + payment page
│   │   ├── confirmation/      ← Order confirmation page
│   │   └── admin/             ← Restaurant admin dashboard
│   ├── components/            ← Reusable UI components
│   │   ├── DishCard.jsx
│   │   ├── CartItem.jsx
│   │   ├── Navbar.jsx
│   │   └── AIRecommendations.jsx
│   ├── public/                ← Static assets
│   └── tailwind.config.js
│
├── backend/                   ← Django app
│   ├── manage.py
│   ├── restaurant/            ← Django app for restaurant logic
│   ├── menu/                  ← Menu models, views, APIs
│   ├── orders/                ← Order processing
│   ├── billing/               ← Billing logic
│   ├── ai_module/             ← AI recommendation logic
│   ├── media/                 ← Dish image storage
│   └── requirements.txt       ← Python dependencies
│
└── README.md
```

---

## 8. Build Progress Log

> This section tracks what has been built so far.

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 1 | Project Documentation | ✅ Done | This file |
| 2 | Frontend Setup (Next.js) | 🔜 Pending | — |
| 3 | Tailwind CSS Setup | 🔜 Pending | — |
| 4 | Customer Welcome Screen | 🔜 Pending | — |
| 5 | Menu Browsing UI | 🔜 Pending | — |
| 6 | Cart & Billing UI | 🔜 Pending | — |
| 7 | Django Backend Setup | 🔜 Pending | — |
| 8 | MongoDB Connection | 🔜 Pending | — |
| 9 | Menu API | 🔜 Pending | — |
| 10 | Order API | 🔜 Pending | — |
| 11 | AI Module | 🔜 Pending | — |
| 12 | Admin Dashboard | 🔜 Pending | — |
| 13 | QR Code Generation | 🔜 Pending | — |
| 14 | Payment (UPI QR) | 🔜 Pending | — |

---

*Last updated: 2026-05-03*
