# Design Document: Landing Page

## Overview

إضافة Landing Page عامة على المسار `/` تستقبل الزوار وتعرّفهم بتطبيق "حياة"، مع نقل لوحة التحكم الإدارية الحالية من المسار الجذر إلى `/admin`. يشمل التصميم:

1. **LandingPage component** جديد — صفحة تسويقية بسيطة بـ Bootstrap 5 RTL
2. **تعديل `app.routes.ts`** — نقل كل مسارات Dashboard تحت `/admin`، وإضافة `/` للـ LandingPage
3. **تعديل `AuthGuard`** — إضافة `returnUrl` عند إعادة التوجيه للـ login
4. **تعديل `Sidebar`** — تحديث مسارات القائمة لتشمل `/admin/` prefix
5. **تعديل `Login` component** — تحديث redirect بعد تسجيل الدخول إلى `/admin/dashboardcount`

---

## Architecture

### Component Tree

```
AppComponent (router-outlet)
├── LandingPageComponent          → route: /
├── LoginComponent                → route: /login
└── DashboardComponent            → route: /admin (canActivateChild: AuthGuard)
    ├── SidebarComponent
    ├── NavbarComponent
    └── router-outlet (child routes)
        ├── DashcountComponent    → /admin/dashboardcount
        ├── UsersComponent        → /admin/users
        ├── AdminsComponent       → /admin/admins
        └── ... (all other child routes)
```

### Routing Structure (بعد التعديل)

```
/                          → LandingPageComponent        (بدون guard)
/login                     → LoginComponent              (بدون guard)
/admin                     → DashboardComponent          (canActivateChild: AuthGuard)
  /admin                   → redirect → /admin/dashboardcount
  /admin/dashboardcount    → DashcountComponent
  /admin/users             → UsersComponent
  /admin/admins            → AdminsComponent
  /admin/adduser           → AddUserComponent
  /admin/edituser/:id      → EditUserComponent
  /admin/merchants         → MerchantsComponent
  /admin/addmerchant       → AddMerchantComponent
  /admin/editmerchant/:id  → EditMerchantComponent
  /admin/governments       → GovernmentsComponent
  /admin/addgovernmental   → AddGovernmentalComponent
  /admin/editgovernmental/:id → EditGovernmentalComponent
  /admin/verify_account    → PendingUsersComponent
  /admin/verify_creator    → PendingCreatorsComponent
  /admin/verification-orders → VerificationOrdersComponent
  /admin/addadmin          → AddAdminComponent
  /admin/roles             → RolesComponent
  /admin/editadmin/:id     → EditAdminComponent
  /admin/interests         → InterestsComponent
  /admin/cities            → CitiesComponent
  /admin/countries         → CountriesComponent
  /admin/deals             → DealsComponent
  /admin/bannedwords       → BannedWordsComponent
  /admin/adddeal           → AddDealComponent
  /admin/deal-details/:id  → DealDetailsComponent
  /admin/calendar          → CalendarComponent
  /admin/wallet            → WalletTransactionsComponent
  /admin/policy-settings   → SettingsComponent
  /admin/top-users-notes   → TopUsersNotesComponent
/**                        → redirect → /
```

---

## Components and Interfaces

### 1. LandingPageComponent (جديد)

**الملف:** `src/app/components/landing-page/landing-page.ts`

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPage {
  currentYear = new Date().getFullYear();

  features = [
    {
      icon: 'bi bi-people-fill',
      title: 'إدارة المستخدمين',
      description: 'تحكم كامل في حسابات المستخدمين والمبدعين مع أدوات التحقق والمراجعة'
    },
    {
      icon: 'bi bi-shop',
      title: 'إدارة التجار',
      description: 'منصة متكاملة لإدارة التجار والجهات الحكومية وعروضهم التجارية'
    },
    {
      icon: 'bi bi-bar-chart-fill',
      title: 'لوحة إحصائيات',
      description: 'تقارير وإحصائيات تفصيلية لمتابعة أداء التطبيق ونشاط المستخدمين'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'أمان وصلاحيات',
      description: 'نظام صلاحيات متقدم يضمن وصول كل مسؤول للأقسام المخصصة له فقط'
    }
  ];
}
```

**الملف:** `src/app/components/landing-page/landing-page.html`

```html
<div dir="rtl" class="landing-page">

  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg landing-navbar">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
        <img
          src="/images/HayaLogo-DhdEv8BC.jpg"
          alt="شعار حياة"
          height="40"
          class="rounded-circle"
        />
        <span class="brand-name">حياة</span>
      </a>
      <a routerLink="/login" class="btn btn-login ms-auto">
        <i class="bi bi-box-arrow-in-right me-1"></i>
        تسجيل الدخول
      </a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container text-center">
      <div class="hero-badge mb-3">
        <i class="bi bi-stars me-1"></i> منصة الإدارة المتكاملة
      </div>
      <h1 class="hero-title">حياة</h1>
      <p class="hero-description">
        منصة إدارية متكاملة تتيح إدارة المستخدمين والتجار والمحتوى بكفاءة عالية
      </p>
      <a routerLink="/login" class="btn btn-cta btn-lg">
        <i class="bi bi-rocket-takeoff me-2"></i>
        ابدأ الآن
      </a>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <div class="container">
      <h2 class="section-title text-center mb-5">مميزات المنصة</h2>
      <div class="row g-4 justify-content-center">
        <div class="col-12 col-sm-6 col-lg-3" *ngFor="let feature of features">
          <div class="feature-card h-100">
            <div class="feature-icon">
              <i [class]="feature.icon"></i>
            </div>
            <h5 class="feature-title">{{ feature.title }}</h5>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="landing-footer">
    <div class="container text-center">
      <p class="mb-0">
        &copy; {{ currentYear }} حياة — جميع الحقوق محفوظة
      </p>
    </div>
  </footer>

</div>
```

**الملف:** `src/app/components/landing-page/landing-page.css`

```css
/* ===== Landing Page Global ===== */
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: "Plus Jakarta Sans", "Helvetica Neue", sans-serif;
  background-color: #f8f5ff;
  color: #212529;
}

/* ===== Navbar ===== */
.landing-navbar {
  background-color: #7a3ca0;
  padding: 0.75rem 0;
  box-shadow: 0 2px 8px rgba(122, 60, 160, 0.25);
}

.landing-navbar .brand-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}

.btn-login {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.4rem 1.1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-login:hover {
  background-color: rgba(255, 255, 255, 0.28);
  color: #fff;
}

/* ===== Hero Section ===== */
.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 5rem 0 4rem;
  background: linear-gradient(135deg, #7a3ca0 0%, #5b2d7a 60%, #3d1f55 100%);
  color: #fff;
}

.hero-badge {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.35rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 800;
  margin: 0.5rem 0 1rem;
  letter-spacing: -1px;
}

.hero-description {
  font-size: 1.15rem;
  max-width: 520px;
  margin: 0 auto 2rem;
  opacity: 0.9;
  line-height: 1.7;
}

.btn-cta {
  background-color: #fff;
  color: #7a3ca0;
  border: none;
  border-radius: 50px;
  padding: 0.75rem 2.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  color: #5b2d7a;
}

/* ===== Features Section ===== */
.features-section {
  padding: 5rem 0;
  background-color: #f8f5ff;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #3d1f55;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(122, 60, 160, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(122, 60, 160, 0.15);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #7a3ca0, #5b2d7a);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 1.6rem;
  color: #fff;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3d1f55;
  margin-bottom: 0.6rem;
}

.feature-description {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

/* ===== Footer ===== */
.landing-footer {
  background-color: #3d1f55;
  color: rgba(255, 255, 255, 0.75);
  padding: 1.5rem 0;
  font-size: 0.9rem;
}

/* ===== Responsive ===== */
@media (max-width: 575.98px) {
  .hero-section {
    padding: 3.5rem 0 3rem;
  }
  .hero-description {
    font-size: 1rem;
  }
  .features-section {
    padding: 3rem 0;
  }
}
```

---

### 2. تعديلات `app.routes.ts`

التغييرات المطلوبة:
- إضافة مسار `/` يشير إلى `LandingPage`
- تغيير مسار `Dashboard` من `''` إلى `'admin'`
- تحديث `redirectTo` الداخلي من `'dashboardcount'` إلى `'dashboardcount'` (يبقى كما هو لأنه relative)
- تحديث `redirectTo` في wildcard من `''` إلى `'/'`
- تحديث redirect داخل `AuthGuard` عند رفض الوصول من `/dashboardcount` إلى `/admin/dashboardcount`

```typescript
import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { LandingPage } from './components/landing-page/landing-page';
// ... (باقي الـ imports كما هي)

export const routes: Routes = [
  { path: '', component: LandingPage },           // ← جديد
  { path: 'login', component: Login },
  {
    path: 'admin',                                 // ← تغيير من '' إلى 'admin'
    component: Dashboard,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboardcount', pathMatch: 'full' },
      { path: 'dashboardcount', component: Dashcount },
      // ... (باقي الـ children كما هي بدون تغيير في مساراتها النسبية)
    ],
  },
  { path: '**', redirectTo: '/' },               // ← تغيير من '' إلى '/'
];
```

---

### 3. تعديلات `AuthGuard`

**المشكلة الحالية:** عند رفض الوصول، يُعيد التوجيه إلى `/login` بدون `returnUrl`، وعند رفض الصلاحية يُعيد إلى `/dashboardcount` (مسار قديم).

**التعديلات المطلوبة:**

```typescript
import { Injectable } from '@angular/core';
import { CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivateChild {
  constructor(private router: Router, private notification: NotificationService) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      // ← إضافة returnUrl
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRole = route.data['role'];
    if (user.is_super_admin === 1) {
      return true;
    }

    if (requiredRole && !user.roles?.some((r: any) => r.name === requiredRole)) {
      this.notification.error('Access denied');
      this.router.navigate(['/admin/dashboardcount']); // ← تحديث المسار
      return false;
    }

    return true;
  }
}
```

**التغييرات:**
1. إضافة `RouterStateSnapshot` كمعامل ثانٍ لـ `canActivateChild`
2. تمرير `{ queryParams: { returnUrl: state.url } }` عند redirect للـ login
3. تحديث redirect عند رفض الصلاحية من `/dashboardcount` إلى `/admin/dashboardcount`

---

### 4. تعديلات `Sidebar` (مسارات القائمة)

**المشكلة:** مسارات القائمة الحالية تستخدم مسارات مطلقة بدون `/admin/` prefix (مثل `/dashboardcount`، `/users`).

**التعديل:** تحديث جميع مسارات `menu` لتشمل `/admin/` prefix:

```typescript
menu = [
  { name: 'Dashboard',        icon: 'bi bi-house-door',   path: '/admin/dashboardcount' },
  { name: 'Admins',           icon: 'bi bi-person-gear',  path: '/admin/admins' },
  { name: 'Users',            icon: 'bi bi-people',       path: '/admin/users' },
  { name: 'Top Users Notes',  icon: 'bi bi-trophy',       path: '/admin/top-users-notes' },
  { name: 'Merchants',        icon: 'bi bi-shop',         path: '/admin/merchants' },
  { name: 'Governments',      icon: 'bi bi-bank',         path: '/admin/governments' },
  {
    name: 'Verifycation',
    icon: 'bi bi-bag-check',
    path: '/admin/verifycation',
    expanded: true,
    children: [
      { name: 'Verify Account',          path: '/admin/verify_account',       icon: 'bi bi-hourglass-split' },
      { name: 'Verify Creator',          path: '/admin/verify_creator',       icon: 'bi bi-hourglass-split' },
      { name: 'طلبات التوثيق المدفوعة', path: '/admin/verification-orders',  icon: 'bi bi-credit-card-2-front' },
    ],
  },
  { name: 'Interests',    icon: 'bi bi-star',          path: '/admin/interests' },
  { name: 'Cities',       icon: 'bi bi-geo-alt',       path: '/admin/cities' },
  { name: 'Countries',    icon: 'bi bi-globe',         path: '/admin/countries' },
  { name: 'Deals',        icon: 'bi bi-bag-check',     path: '/admin/deals' },
  { name: 'Banned Words', icon: 'bi bi-slash-circle',  path: '/admin/bannedwords' },
  { name: 'Wallet',       icon: 'bi bi-wallet2',       path: '/admin/wallet' },
  { name: 'Calendar',     icon: 'bi bi-calendar-event',path: '/admin/calendar' },
  { name: 'SETTINGS',     icon: 'bi bi-gear',          path: '/admin/policy-settings' },
];
```

**تحديث `logout()`:** تغيير `/admin/login` إلى `/login`:

```typescript
logout() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    this.router.navigate(['/login']); // ← تصحيح المسار
    return;
  }
  this.authService.logout(token).subscribe({
    next: () => {
      localStorage.removeItem('admin_token');
      this.router.navigateByUrl('/login').then(() => { // ← تصحيح المسار
        window.location.reload();
      });
    },
    error: () => {
      localStorage.removeItem('admin_token');
      this.router.navigateByUrl('/login').then(() => { // ← تصحيح المسار
        window.location.reload();
      });
    },
  });
}
```

---

### 5. تعديلات `Login` component

**المشكلة:** بعد تسجيل الدخول الناجح، يُعيد التوجيه إلى `/dashboardcount` (مسار قديم).

**التعديل في `onSubmit()`:**

```typescript
onSubmit() {
  this.authService.login(this.form.email, this.form.password).subscribe({
    next: (res: any) => {
      if (res.data?.token) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        this.notificationService.success('Login successful!');

        // ← التحقق من returnUrl أولاً، ثم الانتقال للـ dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboardcount';
        this.router.navigateByUrl(returnUrl);
      }
    },
    error: (err: any) => {
      if (err.error?.message) {
        this.notificationService.error(err.error.message);
      } else {
        this.notificationService.error('Login failed!');
      }
    }
  });
}
```

**الـ imports المطلوبة في `login.ts`:**

```typescript
import { ActivatedRoute, Router } from '@angular/router';
// ...
constructor(
  private authService: AuthService,
  private router: Router,
  private route: ActivatedRoute,           // ← إضافة
  private notificationService: NotificationService
) {}
```

---

## Data Models

لا توجد نماذج بيانات جديدة. الـ LandingPage تستخدم بيانات ثابتة (static) محددة في الـ component مباشرة:

```typescript
interface FeatureCard {
  icon: string;       // Bootstrap Icons class
  title: string;      // عنوان الميزة
  description: string; // وصف الميزة
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

بناءً على تحليل معايير القبول، معظم المتطلبات هي فحوصات تهيئة (routing config) أو عناصر DOM محددة، وهي مناسبة للاختبارات المثالية (example-based). يوجد خاصيتان قابلتان للاختبار كـ properties:

### Property 1: وصف الـ Hero لا يتجاوز 150 حرفاً

*For any* نص وصف يُعرض في الـ Hero Section، يجب أن يكون طوله أقل من أو يساوي 150 حرفاً.

**Validates: Requirements 1.3**

### Property 2: جميع مسارات `/admin` تحتفظ بـ `data.role`

*For any* مسار فرعي تحت `/admin` كان يحمل خاصية `data.role` قبل التعديل، يجب أن يحتفظ بنفس قيمة `data.role` بعد نقله تحت `/admin`.

**Validates: Requirements 3.5**

### Property 3: إعادة التوجيه عند عدم المصادقة تحفظ الـ URL المطلوب

*For any* مسار فرعي تحت `/admin`، عندما يحاول مستخدم غير مصادق الوصول إليه، يجب أن يحتوي الـ redirect على `returnUrl` يساوي المسار المطلوب أصلاً.

**Validates: Requirements 2.3**

---

## Error Handling

| الحالة | السلوك المتوقع |
|--------|----------------|
| مستخدم غير مصادق يصل لأي مسار `/admin/*` | إعادة توجيه لـ `/login?returnUrl=/admin/...` |
| مستخدم مصادق بدون صلاحية الـ role المطلوب | إعادة توجيه لـ `/admin/dashboardcount` + رسالة خطأ |
| مسار غير موجود (`/**`) | إعادة توجيه لـ `/` (Landing Page) |
| مستخدم مصادق يزور `/login` | إعادة توجيه لـ `/admin/dashboardcount` (يُعالج في Login component) |
| فشل تحميل صورة الـ logo | يظهر الـ `alt` text "شعار حياة" |

---

## Testing Strategy

### Unit Tests (Example-Based)

اختبارات محددة للحالات الملموسة:

1. **LandingPage rendering:**
   - يُعرض الـ logo بـ `alt="شعار حياة"` وـ `src="/images/HayaLogo-DhdEv8BC.jpg"`
   - يحتوي على عنصر `dir="rtl"`
   - يحتوي على نص "حياة" في الـ Hero
   - يحتوي على السنة الحالية في الـ footer
   - يحتوي على 4 feature cards على الأقل (≥ 3 كما تشترط المتطلبات)
   - جميع روابط CTA تشير إلى `/login`

2. **Routing configuration:**
   - المسار `/` يُحمّل `LandingPage` بدون guard
   - المسار `/admin` يُحمّل `Dashboard` مع `canActivateChild: AuthGuard`
   - المسار `/login` يُحمّل `Login`
   - المسار `/**` يُعيد التوجيه لـ `/`
   - المسار `/admin` بدون child يُعيد التوجيه لـ `/admin/dashboardcount`

3. **AuthGuard:**
   - مستخدم بدون token → redirect لـ `/login` مع `returnUrl`
   - مستخدم بـ token وبدون الـ role المطلوب → redirect لـ `/admin/dashboardcount`
   - super admin → يمر دائماً

4. **Login component:**
   - بعد login ناجح بدون `returnUrl` → navigate لـ `/admin/dashboardcount`
   - بعد login ناجح مع `returnUrl=/admin/users` → navigate لـ `/admin/users`

### Property Tests

بناءً على الـ properties المحددة أعلاه:

1. **Property 1** — اختبار أن `hero-description` في الـ template لا يتجاوز 150 حرفاً (يمكن التحقق منه في unit test بسيط)
2. **Property 2** — اختبار أن جميع routes التي كانت تحمل `data.role` لا تزال تحمله بعد التعديل (يمكن التحقق منه بفحص مصفوفة الـ routes)
3. **Property 3** — اختبار `AuthGuard` مع مسارات مختلفة والتحقق من `returnUrl`

### Testing Framework

المشروع يستخدم **Karma + Jasmine** (موجود في `package.json`). جميع الاختبارات تُكتب بـ Jasmine spec files (`.spec.ts`).

```
src/app/components/landing-page/landing-page.spec.ts
src/app/guards/auth.guard.spec.ts
src/app/app.routes.spec.ts
```
