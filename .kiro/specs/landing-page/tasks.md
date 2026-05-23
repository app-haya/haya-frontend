# Tasks

## Task 1: Setup Landing Page Routing Structure
**Status:** completed
**Description:** Configure routing to move dashboard from `/` to `/admin` and prepare root path for landing page

### Subtasks:
- Update `app.routes.ts` to move all dashboard routes under `/admin` parent route
- Update `app.routes.ts` to add `/` route for LandingPage component
- Update wildcard route to redirect to `/` instead of empty path
- Update AuthGuard to preserve `returnUrl` query parameter when redirecting to login
- Update AuthGuard to redirect to `/admin/dashboardcount` instead of `/dashboardcount` on role denial

**Validates:** Requirements 2, 3

---

## Task 2: Create Landing Page Component Files
**Status:** completed
**Description:** Create the LandingPage component with navbar, hero section, features, and footer

### Subtasks:
- Create `landing-page.ts` component with standalone configuration
- Create `landing-page.html` template with RTL layout
- Create `landing-page.css` with responsive Bootstrap 5 styles
- Add navbar with logo and "تسجيل الدخول" button linking to `/login`
- Add hero section with app name, description (≤150 chars), and CTA button
- Add features section with at least 3 feature cards
- Add footer with copyright text and current year
- Use logo image from `/images/HayaLogo-DhdEv8BC.jpg` with alt text "شعار حياة"

**Validates:** Requirements 1, 4

---

## Task 3: Update Sidebar Navigation Paths
**Status:** completed
**Description:** Update all sidebar menu paths to include `/admin/` prefix

### Subtasks:
- Update all menu items in `sidebar.ts` to use `/admin/` prefix
- Update logout redirect from `/admin/login` to `/login`

**Validates:** Requirements 3

---

## Task 4: Update Login Component Redirect Logic
**Status:** completed
**Description:** Update login component to handle returnUrl and redirect to `/admin/dashboardcount`

### Subtasks:
- Add `ActivatedRoute` injection to Login component
- Update `onSubmit()` to check for `returnUrl` query parameter
- Update default redirect from `/dashboardcount` to `/admin/dashboardcount`
- Navigate to `returnUrl` if present, otherwise to `/admin/dashboardcount`

**Validates:** Requirements 2.3, 3.4

---

## Task 5: Write Unit Tests for Landing Page
**Status:** not_started
**Description:** Write example-based unit tests for LandingPage component rendering

### Subtasks:
- Test that logo renders with correct src and alt attributes
- Test that root element has `dir="rtl"` attribute
- Test that hero section contains "حياة" text
- Test that footer contains current year
- Test that at least 3 feature cards are rendered
- Test that all CTA buttons link to `/login`
- Test that hero description is ≤150 characters (Property 1)

**Validates:** Requirements 1, 4, Property 1

---

## Task 6: Write Unit Tests for Routing Configuration
**Status:** not_started
**Description:** Write example-based unit tests for routing setup

### Subtasks:
- Test that `/` route loads LandingPage without guard
- Test that `/admin` route loads Dashboard with AuthGuard
- Test that `/login` route loads Login component
- Test that `/**` wildcard redirects to `/`
- Test that `/admin` without child redirects to `/admin/dashboardcount`
- Test that all routes with `data.role` preserve their role values (Property 2)

**Validates:** Requirements 2, 3, Property 2

---

## Task 7: Write Unit Tests for AuthGuard
**Status:** not_started
**Description:** Write example-based and property-based tests for AuthGuard behavior

### Subtasks:
- Test that unauthenticated user redirects to `/login` with `returnUrl` (Property 3)
- Test that authenticated user without required role redirects to `/admin/dashboardcount`
- Test that super admin always passes guard
- Test that authenticated user with required role passes guard

**Validates:** Requirements 2.3, 3.4, Property 3

---

## Task 8: Write Unit Tests for Login Component
**Status:** not_started
**Description:** Write example-based unit tests for Login component redirect logic

### Subtasks:
- Test successful login without `returnUrl` navigates to `/admin/dashboardcount`
- Test successful login with `returnUrl=/admin/users` navigates to `/admin/users`
- Test failed login shows error notification

**Validates:** Requirements 2.3, 3.4
