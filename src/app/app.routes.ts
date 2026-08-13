import { Routes } from '@angular/router';
import { CashierLogin } from './components/cashier-login/cashier-login';
import { CashierPortal } from './components/cashier-portal/cashier-portal';
import { CashierAuthGuard } from './guards/cashier-auth.guard';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Admins } from './components/Admin/edit-admin/admins/admins';
import { Users } from './components/User/users/users';
import { Merchants } from './components/merchants/merchants';
import { Governments } from './components/governments/governments';

import { Interests } from './components/interests/interests';
import { Cities } from './components/cities/cities';
import { Countries } from './components/countries/countries';
import { Deals } from './components/deals/deals';
import { Calendar } from './components/calendar/calendar';

import { AuthGuard } from './guards/auth.guard';
import { AddAdmin } from './components/Admin/edit-admin/add-admin/add-admin';
import { EditAdmin } from './components/Admin/edit-admin/edit-admin';
import { AdminProfile } from './components/Admin/admin-profile/admin-profile';
import { AddUser } from './components/User/users/adduser/adduser';
import { EditUser } from './components/User/users/edituser/edituser';
import { AddMerchant } from './components/add-merchant/add-merchant';
import { EditMerchant } from './components/edit-merchant/edit-merchant';
import { AddGovernmental } from './components/add-governmental/add-governmental';
import { EditGovernmental } from './components/edit-governmental/edit-governmental';
import { AddDeal } from './components/add-deal/add-deal';
import { BannedWords } from './components/banned-words/banned-words';
import { PendingUsers } from './components/pending-users/pending-users';
import { PendingCreators } from './components/pending-creators/pending-creators';
import { VerificationOrders } from './components/verification-orders/verification-orders';
import { VerificationPrices } from './components/verification-prices/verification-prices';
import { Roles } from './components/roles/roles';
import { Dashcount } from './components/dashcount/dashcount';
import { DealDetails } from './components/deals/deal-details/deal-details';
import { DealOrders } from './components/deal-orders/deal-orders';

import { WalletTransactions } from './components/wallet-transactions/wallet-transactions';
import { Settings } from './components/settings/settings';
import { TopUsersNotes } from './components/top-users-notes/top-users-notes';
import { Loyalty } from './components/loyalty/loyalty';
import { SendNotifications } from './components/send-notifications/send-notifications';
import { CommentReports } from './components/comment-reports/comment-reports';
import { PostReports } from './components/post-reports/post-reports';
import { SupportDepartments } from './components/support-departments/support-departments';
import { SupportChats } from './components/support-chats/support-chats';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/landing-page/landing-page').then(m => m.LandingPage) },
  { path: 'login', component: Login },
  { path: 'cashier/login', component: CashierLogin },
  { path: 'cashier/dashboard', component: CashierPortal, canActivate: [CashierAuthGuard] },
  { path: 'terms', loadComponent: () => import('./components/policy-page/policy-page').then(m => m.PolicyPage), data: { type: 'terms' } },
  { path: 'privacy', loadComponent: () => import('./components/policy-page/policy-page').then(m => m.PolicyPage), data: { type: 'privacy' } },
  { path: 'about-us', loadComponent: () => import('./components/policy-page/policy-page').then(m => m.PolicyPage), data: { type: 'about' } },
  { path: 'About-us', loadComponent: () => import('./components/policy-page/policy-page').then(m => m.PolicyPage), data: { type: 'about' } },
  { path: 'join-merchant', loadComponent: () => import('./components/policy-page/policy-page').then(m => m.PolicyPage), data: { type: 'merchant' } },
  {
    path: 'admin',
    component: Dashboard,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboardcount', pathMatch: 'full' },
      { path: 'dashboardcount', component: Dashcount, data: { role: 'dashboard' } },
      { path: 'admins', component: Admins, data: { role: 'Admins' } },
      { path: 'users', component: Users, data: { role: 'Users' } },
      { path: 'adduser', component: AddUser, data: { role: 'Users' } },
      { path: 'edituser/:id', component: EditUser, data: { role: 'Users' } },
      { path: 'merchants', component: Merchants, data: { role: 'Merchants' } },
      {
        path: 'addmerchant',
        component: AddMerchant,
        data: { role: 'Merchants' },
      },
      {
        path: 'editmerchant/:id',
        component: EditMerchant,
        data: { role: 'Merchants' },
      },
      {
        path: 'governments',
        component: Governments,
        data: { role: 'Governments' },
      },
      {
        path: 'addgovernmental',
        component: AddGovernmental,
        data: { role: 'Governments' },
      },
      {
        path: 'editgovernmental/:id',
        component: EditGovernmental,
        data: { role: 'Governments' },
      },
      {
        path: 'verify_account',
        component: PendingUsers,
        data: { role: 'verification' },
      },
      {
        path: 'verify_creator',
        component: PendingCreators,
        data: { role: 'verification' },
      },
      {
        path: 'verification-orders',
        component: VerificationOrders,
        data: { role: 'verification' },
      },
      {
        path: 'verification-prices',
        component: VerificationPrices,
        data: { role: 'verification' },
      },

      { path: 'addadmin', component: AddAdmin, data: { role: 'Admins' } },
      { path: 'roles', component: Roles, data: { role: 'Admins' } },
      { path: 'editadmin/:id', component: EditAdmin, data: { role: 'Admins' } },
      { path: 'profile', component: AdminProfile },
      { path: 'interests', component: Interests, data: { role: 'Interests' } },
      { path: 'cities', component: Cities, data: { role: 'Cities' } },
      { path: 'countries', component: Countries, data: { role: 'Countries' } },
      { path: 'deals', component: Deals, data: { role: 'Deals' } },
      {
        path: 'bannedwords',
        component: BannedWords,
        data: { role: 'banned_words' },
      },
      { path: 'adddeal', component: AddDeal, data: { role: 'Deals' } },
      { path: 'deal-details/:id', component: DealDetails, data: { role: 'Deals' } },
      { path: 'deal-orders', component: DealOrders, data: { role: 'Deals' } },
      { path: 'calendar', component: Calendar, data: { role: 'calendar' } },

      { path: 'wallet', component: WalletTransactions, data: { role: 'wallet' } },
      { path: 'policy-settings', component: Settings, data: { role: 'settings' } },
      { path: 'top-users-notes', component: TopUsersNotes, data: { role: 'top30' } },
      { path: 'loyalty', component: Loyalty, data: { role: 'loyalty' } },
      { path: 'send-notifications', component: SendNotifications, data: { role: 'notifications' } },
      { path: 'comment-reports', component: CommentReports, data: { role: 'reports' } },
      { path: 'post-reports', component: PostReports, data: { role: 'reports' } },
      { path: 'support-departments', component: SupportDepartments, data: { role: 'support' } },
      { path: 'support-chats', component: SupportChats, data: { role: 'support' } },
    ],
  },
  { path: '**', redirectTo: '' },
];