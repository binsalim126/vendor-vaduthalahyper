# 🛒 Vendor Control — Vaduthala Hyper Shopee

A modern, responsive web application for supplier registration, dynamic form building, and vendor lifecycle management built for **Vaduthala Hyper Shopee**.

---

## 🌟 Key Features

### 1. 🛍️ Vendor Portal (Public)
- **Branded Splash Intro**: Smooth fade-in & scale logo animation (1–1.5s), auto-transitioning and skippable.
- **Mobile-First Responsive Form**:
  - **Venture Name** (Required)
  - **Company Name** (Required)
  - **Phone Number** (Required, formatted with quick contact links)
  - **Products Offered** (Interactive multi-chip tag selector with quick suggestions)
  - **Dynamic Custom Questions** (Rendered in real-time based on Admin configuration)
- **Post-Submission Confirmation**:
  - Festive celebration animation
  - Unique Reference ID (e.g. `VHS-20260917-8492`)
  - Timestamped summary card with 1-click ID copy
  - Printable confirmation slip

### 2. 🔐 Admin Management Dashboard
- **Secure Login**:
  - Email/Password authentication
  - One-click demo credentials (`admin@vaduthala.com` / `admin123`)
  - Supabase Auth integration
- **Executive Overview**:
  - Total submissions counter & today's inflow tracker
  - Supplier pipeline status distribution (New, In Review, Contacted, Approved, Rejected)
  - Top product categories chart
- **Day-by-Day Submissions Management**:
  - Grouped by date (Today, Yesterday, earlier days) with counts
  - Expandable accordion cards with full custom answers
  - Quick WhatsApp & Direct Call buttons
  - Real-time status update & procurement internal notes
- **Dynamic Form Builder**:
  - Add custom questions: Single-line Text, Multi-line Textarea, Numbers, Dropdown Select, Multiple Choice (Checkboxes), Yes/No Switch
  - Protected default fields
  - Live Mobile Form Preview drawer
- **Export & Print**:
  - **Export to Excel (.xlsx)** with dynamic columns parsed from custom fields
  - **Clean Print Layout** (`@media print` optimized) for full dockets or single vendor slips
- **Database & Supabase Settings**:
  - Connect live Supabase backend
  - 1-click Copy SQL Schema with Row Level Security (RLS) policies
  - Reset sample data tool

---

## 🚀 Quick Start

### 1. Install & Run Locally
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Admin Login
- Open `http://localhost:5173/#admin` or click **"Admin Login"** in the top navigation.
- **Demo Email**: `admin@vaduthala.com`
- **Demo Password**: `admin123`

---

## 🗄️ Supabase Setup & SQL Schema

If you wish to connect your own Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor > New Query** in your Supabase dashboard and execute the script provided in `Admin Dashboard > Settings & DB` (or copy from `src/lib/supabase.ts`).
3. Set your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` or directly in the Admin Settings tab.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Spreadsheets**: SheetJS (`xlsx`)
- **Effects**: Canvas Confetti
- **Backend & Auth**: Supabase JS Client with local storage fallback
