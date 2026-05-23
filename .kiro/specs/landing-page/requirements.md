# Requirements Document

## Introduction

هذه الميزة تهدف إلى إضافة Landing Page عامة للتطبيق تظهر على المسار الرئيسي `/`، مع نقل لوحة التحكم (Dashboard) الحالية إلى المسار `/admin`. الـ Landing Page ستكون الواجهة الأولى التي يراها الزوار عند فتح التطبيق، وتحتوي على معلومات تعريفية عن تطبيق "حياة" مع روابط للتنقل إلى صفحة تسجيل الدخول أو لوحة التحكم.

## Glossary

- **Landing_Page**: الصفحة الرئيسية العامة التي تظهر على المسار `/` وتستقبل الزوار
- **Dashboard**: لوحة التحكم الإدارية الحالية التي ستنتقل إلى المسار `/admin`
- **Router**: نظام التوجيه في Angular المسؤول عن ربط المسارات بالمكونات
- **Auth_Guard**: الحارس الذي يحمي مسارات لوحة التحكم ويتحقق من تسجيل الدخول
- **Login_Page**: صفحة تسجيل الدخول الموجودة على المسار `/login`
- **Navigation_Bar**: شريط التنقل العلوي في الـ Landing Page
- **Hero_Section**: القسم الرئيسي البارز في أعلى الـ Landing Page
- **CTA_Button**: زر الدعوة للإجراء (Call To Action) الذي يوجه المستخدم للتسجيل أو الدخول

---

## Requirements

### Requirement 1: إنشاء Landing Page Component

**User Story:** As a visitor, I want to see an attractive landing page when I open the app, so that I can learn about the application before logging in.

#### Acceptance Criteria

1. THE Router SHALL render the Landing_Page component when the URL path is `/`
2. THE Landing_Page SHALL display a Navigation_Bar containing the application logo and a CTA_Button that navigates to `/login`
3. THE Landing_Page SHALL display a Hero_Section containing the application name "حياة", a description of the application of no more than 150 characters, and a CTA_Button that navigates to `/login`
4. THE Landing_Page SHALL display a features section containing at least three feature cards, where each card has a visible title and a visible description text
5. THE Landing_Page SHALL display a footer section containing the text "حياة" and the current calendar year as copyright information
6. WHEN a visitor clicks any CTA_Button on the Landing_Page, THE Router SHALL navigate to `/login`
7. WHEN a visitor navigates to `/`, THE Landing_Page SHALL render without triggering any Auth_Guard redirect

---

### Requirement 2: نقل Dashboard إلى مسار /admin

**User Story:** As a developer, I want the dashboard to be accessible at `/admin`, so that the root path is free for the landing page.

#### Acceptance Criteria

1. THE Router SHALL render the Dashboard component when the URL path is `/admin`
2. THE Router SHALL apply the Auth_Guard at the `/admin` parent route level using `canActivateChild`, protecting all child routes under `/admin`
3. WHEN an unauthenticated user navigates to `/admin` or any child route, THE Auth_Guard SHALL redirect the user to `/login` and preserve the originally requested URL as a `returnUrl` query parameter
4. WHEN a user navigates to `/admin` with no child path specified, THE Router SHALL redirect to `/admin/dashboardcount`
5. IF a user navigates to a path that does not match any defined route, THEN THE Router SHALL redirect to `/`

---

### Requirement 3: تحديث نظام التوجيه

**User Story:** As a developer, I want the routing configuration to be updated consistently, so that all internal navigation links work correctly after the path change.

#### Acceptance Criteria

1. THE Router SHALL maintain all existing child routes under `/admin`, including `/admin/users`, `/admin/admins`, `/admin/deals`, `/admin/merchants`, `/admin/governments`, `/admin/interests`, `/admin/cities`, `/admin/countries`, `/admin/bannedwords`, `/admin/calendar`, `/admin/wallet`, `/admin/policy-settings`, `/admin/top-users-notes`, `/admin/verify_account`, `/admin/verify_creator`, `/admin/verification-orders`, and `/admin/roles`
2. WHEN any user navigates to `/`, THE Router SHALL render the Landing_Page component without redirecting to any other route
3. THE Login_Page SHALL remain accessible at `/login`
4. IF the Auth_Guard detects a valid authentication token and the user navigates to `/login`, THEN THE Router SHALL redirect the user to `/admin/dashboardcount`
5. THE Router SHALL preserve the `data.role` property on all existing child routes under `/admin` so that role-based access checks continue to function

---

### Requirement 4: تصميم Landing Page متجاوب

**User Story:** As a visitor using any device, I want the landing page to display correctly on all screen sizes, so that I have a good experience regardless of my device.

#### Acceptance Criteria

1. THE Landing_Page SHALL use Bootstrap 5 responsive grid breakpoints (xs ≥ 320px, sm ≥ 576px, md ≥ 768px, lg ≥ 992px, xl ≥ 1200px, xxl ≥ 1400px) so that layout columns stack on small screens and expand on larger screens
2. THE Landing_Page SHALL set `dir="rtl"` on its root element and apply Bootstrap 5 RTL stylesheet so that all text and layout flow from right to left
3. THE Landing_Page SHALL use the existing Bootstrap 5 library already included in the project for all layout and styling, without introducing additional CSS frameworks
4. THE Landing_Page SHALL render the Haya logo using the image at `/images/HayaLogo-DhdEv8BC.jpg` with a descriptive `alt` attribute of "شعار حياة"
5. WHERE the application language is Arabic, THE Landing_Page SHALL display all text content in the Navigation_Bar, Hero_Section, features section, and footer in Arabic
