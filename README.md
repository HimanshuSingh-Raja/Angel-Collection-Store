# 👑 Angel Collection | House of Haute Couture

> **Enterprise Luxury Fashion E-Commerce Platform**  
> Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, PostgreSQL (Neon), Prisma ORM, and Resend API.

![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🌟 Overview

**Angel Collection** is a production-ready, haute-couture e-commerce application designed to deliver an opulent shopping experience reminiscent of **Zara**, **Louis Vuitton**, **Dior**, and **Sabyasachi**.

Engineered for performance, scalability, and security, the platform features a modern full-stack architecture with real-time order management, a custom multi-tier search engine, drag-and-drop media uploading, and transactional email notifications via Resend.

---

## 🚀 Key Features

### 🛍️ Luxury Storefront & Discovery
- **Zara/Myntra Mobile-First UX**: Native mobile application feel with an edge-to-edge full-bleed hero slider, swipe gestures, and a 2-column mobile product grid (`grid-cols-2`).
- **Apple/Zara Minimalist Search**: Full-screen mobile search modal & 48px navbar search bar powered by a **Trie Prefix Autocomplete**, **Levenshtein Fuzzy Matching**, and an **8-Tier Search Ranking Engine**.
- **Normalized Category Filtering**: Query mapping (`women`, `men`, `sarees`, `kurtis`) for exact catalogue resolution.
- **Interactive Quick View & Wishlist**: Instant modal previews and client-side persistent wishlist tracking.

### 📦 Order Management & Checkout Pipeline
- **Guest Checkout Security Interceptor**: Unauthenticated purchase attempts trigger an interactive authentication modal or auto-redirect to `/login?redirect=/checkout`.
- **Fault-Tolerant Order Pipeline**: Orders are safely saved to PostgreSQL **FIRST** before triggering transactional email notifications via Resend API.
- **Idempotent Resend Emails**: Customer confirmation emails feature responsive dark-mode styling (`#0F1117` background, `#D4AF37` gold accents) and unwrapped single-line brand header safeguards.

### 👑 Admin Management Portal
- **Real-Time Order Fulfillment**: Auto-polling dashboard (`/admin/orders`) displaying live order items, customer details, shipping address, and interactive status controls (`PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`).
- **Product Editing System**: 12-column edit panel (`/admin/products/[id]/edit`) connected directly to PostgreSQL.
- **Drag & Drop Media Uploader**: Image gallery uploader supporting JPG, PNG, WEBP, AVIF up to 10MB per file with canvas auto-compression.
- **Banner Resolution Validator**: Minimum `1920 × 700 px` HTML5 image metadata validator for hero banners (`/admin/banners`).

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS & Vanilla CSS Design Tokens |
| **Database** | PostgreSQL (Neon Cloud) |
| **ORM** | Prisma ORM 6.19 |
| **Email API** | Resend API |
| **Authentication** | Custom Session Cookies + Firebase Auth Integration |
| **State Management** | React Context API & Server Actions |
| **Deployment** | Vercel Platform |

---

## 📁 Project Structure

```bash
AngelCollection/
├── prisma/
│   └── schema.prisma              # Database Models (User, Order, Product, Category, Banner, etc.)
├── public/                        # Static Assets & Icons
├── src/
│   ├── actions/                   # Server Actions (Auth, Product, Order Admin, Banners)
│   ├── app/                       # Next.js App Router Pages & API Routes
│   │   ├── (admin)/admin/         # Admin Portal Routes (Orders, Products, Banners)
│   │   ├── (store)/               # Storefront Routes (Shop, Product, Cart, Checkout)
│   │   ├── api/                   # Server-side API Endpoints (POST /api/orders, /api/auth)
│   │   └── globals.css            # Design System & Mobile Viewport Safeguards
│   ├── components/                # Modular UI Components
│   │   ├── admin/                 # MediaUploader, OrderDetailsModal, AdminHeader
│   │   ├── auth/                  # AuthRequiredModal, LoginForm, RegisterForm
│   │   ├── navbar/                # SearchBar, ProfileDropdown, MegaMenu
│   │   ├── search/                # SearchModal (Trie & Fuzzy Search Overlay)
│   │   └── store/                 # ProductCard, HeroSlider, CartDrawer, InvoiceModal
│   ├── context/                   # Cart & Wishlist Global Context Providers
│   ├── lib/                       # Search Engine (Trie, Ranker), Database & Resend Email Service
│   ├── middleware.ts              # Route Security Guard for Protected & Admin Routes
│   └── types/                     # Shared TypeScript Interfaces
└── package.json                   # Dependencies & Deployment Scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following variables:

`DATABASE_URL=your_database_url
RESEND_API_KEY=your_resend_api_key
RESEND_SENDER_EMAIL=your_sender_email
OWNER_EMAIL=your_admin_email
OWNER_PASSWORD=your_admin_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/angel-collection.git
cd angel-collection
npm install
```

### 2. Configure Database & Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push Database Schema to PostgreSQL
npx prisma db push
```

### 3. Run Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the store.

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts the Next.js development server with hot-reloading.
- `npm run build`: Compiles production build with Prisma generation and static page optimization.
- `npm start`: Runs the compiled production server.
- `npm run lint`: Executes Next.js ESLint code verification.

---

## 🔒 Security Architecture

- **HTTP-Only Cookies**: User authentication relies on SSL-encrypted `angel_user_session` HTTP-Only cookies.
- **Middleware Guard**: `middleware.ts` intercepts unauthorized requests to `/checkout`, `/orders`, `/account`, and `/admin/*`.
- **SQL Injection Safeguard**: All queries are sanitized via Prisma ORM parameterized statements.

---

## 📱 Mobile Responsiveness & Performance

- **Zero Overflow**: `overflow-x: hidden` and `max-width: 100vw` guarantee zero horizontal scrolling across `320px` to `768px` viewports.
- **Lighthouse Optimizations**: Native image lazy-loading, code-splitting via Next.js App Router, and static asset pre-rendering (`48/48 routes`).

---

## 📸 Screenshots

| View | Preview |
| :--- | :--- |
| **Zara-Style Mobile Hero** | *Opulent edge-to-edge luxury mobile banner* |
| **Minimalist Search Bar** | *Apple-inspired 48px search pill with live thumbnail results* |
| **Search Results Page** | *4-column product grid with 8-accordion filter sidebar* |
| **Admin Orders Panel** | *Real-time status updates & interactive full order modal* |

---

## 🛣️ Roadmap

- [x] Full-stack Order Management Workflow
- [x] Drag & Drop Gallery Media Uploader
- [x] Single-line Unwrapped Resend Email Template
- [ ] Razorpay Payment Gateway Webhook Integration
- [ ] Multi-currency Currency Switcher (USD / EUR / GBP / INR)
- [ ] Customer SMS Shipping Tracking Notifications

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ✒️ Author & Acknowledgements

**Angel Collection Engineering Team**  
*Built with Next.js, React, Tailwind CSS, PostgreSQL, Prisma, and Resend.*
