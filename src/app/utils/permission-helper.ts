export function isSuperAdmin(user: any): boolean {
  if (!user) return false;
  return (
    user.is_super_admin === true ||
    user.is_super_admin === 1 ||
    user.is_super_admin === '1' ||
    user.type === 1 ||
    user.type === true ||
    user.type === '1'
  );
}

function normalizePerm(str: string): string {
  if (!str) return '';
  let s = str.toString().trim().toLowerCase();
  s = s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');
  return s;
}

const nameToKeyMap: { [key: string]: string } = {
  'لوحه التحكم': 'dashboard',
  'اللوحه': 'dashboard',
  'dashboard': 'dashboard',

  'المديرين': 'admins',
  'مديرين': 'admins',
  'المديرين والصلاحيات': 'admins',
  'admins': 'admins',

  'المستخدمين': 'users',
  'مستخدمين': 'users',
  'users': 'users',

  'التجار': 'merchants',
  'تجار': 'merchants',
  'merchants': 'merchants',

  'الجهات الحكوميه': 'governments',
  'جهات حكوميه': 'governments',
  'governments': 'governments',

  'التوثيق': 'verification',
  'توثيق': 'verification',
  'التوثيق والاسعار': 'verification',
  'verifycation': 'verification',
  'verification': 'verification',

  'توب 30': 'top30',
  'توب30': 'top30',
  'ادارة توب 30': 'top30',
  'نوب 30': 'top30',
  'ادارة نوب 30': 'top30',
  'top30': 'top30',

  'الولاء': 'loyalty',
  'ولاء': 'loyalty',
  'ادارة الولاء والعملات': 'loyalty',
  'loyalty': 'loyalty',

  'الصفقات': 'deals',
  'صفقات': 'deals',
  'الصفقات وطلبات الشراء': 'deals',
  'deals': 'deals',

  'الاهتمامات': 'interests',
  'اهتمامات': 'interests',
  'interests': 'interests',

  'المدن': 'cities',
  'مدن': 'cities',
  'cities': 'cities',

  'الدول': 'countries',
  'دول': 'countries',
  'countries': 'countries',

  'الكلمات المحظوره': 'banned_words',
  'كلمات محظوره': 'banned_words',
  'banned_words': 'banned_words',
  'bannedwords': 'banned_words',

  'المحفظه': 'wallet',
  'محفظه': 'wallet',
  'المحفظه الماليه': 'wallet',
  'wallet': 'wallet',

  'التقويم': 'calendar',
  'تقويم': 'calendar',
  'التقويم والفعاليات': 'calendar',
  'calendar': 'calendar',

  'ارسال الاشعارات': 'notifications',
  'اشعارات': 'notifications',
  'ارسال الاشعارات والرسائل': 'notifications',
  'notifications': 'notifications',
  'messages': 'notifications',

  'الاعدادات': 'settings',
  'اعدادات': 'settings',
  'الاعدادات والسياسات': 'settings',
  'settings': 'settings',

  'بلاغات التعليقات': 'comment_reports',
  'comment_reports': 'comment_reports',
  'reports_comments': 'comment_reports',
  'بلاغات المنشورات': 'post_reports',
  'post_reports': 'post_reports',
  'reports_posts': 'post_reports',
  'بلاغات': 'reports',
  'البلاغات': 'reports',
  'reports': 'reports',

  'الدعم': 'support',
  'الدعم الفني': 'support',
  'اقسام الدعم': 'support',
  'محادثات الدعم': 'support',
  'نظام الدعم الفني': 'support',
  'support': 'support',
  'support_departments': 'support',
  'support_chats': 'support',
};

export function getUserPermissions(user: any): Set<string> {
  const allowedPerms = new Set<string>();
  if (!user) return allowedPerms;

  const rolesList = Array.isArray(user.roles) ? user.roles : [];

  rolesList.forEach((role: any) => {
    if (role) {
      const roleStr = typeof role === 'object' ? (role.name || '') : role.toString();
      const normRole = normalizePerm(roleStr);
      if (normRole) {
        allowedPerms.add(normRole);
        if (nameToKeyMap[normRole]) {
          allowedPerms.add(nameToKeyMap[normRole]);
        }
      }

      let permsArray: any[] = [];
      if (typeof role === 'object' && role.permissions) {
        if (Array.isArray(role.permissions)) {
          permsArray = role.permissions;
        } else if (typeof role.permissions === 'string') {
          try {
            permsArray = JSON.parse(role.permissions);
          } catch (e) {
            permsArray = [role.permissions];
          }
        }
      }

      permsArray.forEach((p: any) => {
        if (p) {
          const pNorm = normalizePerm(p.toString());
          allowedPerms.add(pNorm);
          if (nameToKeyMap[pNorm]) {
            allowedPerms.add(nameToKeyMap[pNorm]);
          }
        }
      });
    }
  });

  return allowedPerms;
}

export function getFirstPermittedRoute(user: any): string {
  if (!user || isSuperAdmin(user)) {
    return '/admin/dashboardcount';
  }

  const perms = getUserPermissions(user);

  const routeMap: { [key: string]: string } = {
    'dashboard': '/admin/dashboardcount',
    'admins': '/admin/admins',
    'users': '/admin/users',
    'merchants': '/admin/merchants',
    'governments': '/admin/governments',
    'verification': '/admin/verify_creator',
    'verifycation': '/admin/verify_creator',
    'top30': '/admin/top-users-notes',
    'loyalty': '/admin/loyalty',
    'deals': '/admin/deals',
    'interests': '/admin/interests',
    'cities': '/admin/cities',
    'countries': '/admin/countries',
    'banned_words': '/admin/bannedwords',
    'comment_reports': '/admin/comment-reports',
    'post_reports': '/admin/post-reports',
    'reports': '/admin/comment-reports',
    'support': '/admin/support-departments',
    'wallet': '/admin/wallet',
    'calendar': '/admin/calendar',
    'notifications': '/admin/send-notifications',
    'settings': '/admin/policy-settings',
  };

  if (perms.has('dashboard')) {
    return '/admin/dashboardcount';
  }

  for (const [key, route] of Object.entries(routeMap)) {
    if (perms.has(key)) {
      return route;
    }
  }

  for (const perm of perms) {
    if (routeMap[perm]) {
      return routeMap[perm];
    }
  }

  return '/admin/policy-settings';
}

