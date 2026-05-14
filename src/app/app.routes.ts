import { Routes } from '@angular/router';
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
import { AddUser } from './components/User/users/adduser/adduser';
import { EditUser } from './components/User/users/edituser/edituser';
import { AddMerchant } from './components/add-merchant/add-merchant';
import { EditMerchant } from './components/edit-merchant/edit-merchant';
import { AddGovernmental } from './components/add-governmental/add-governmental';
import { EditGovernmental } from './components/edit-governmental/edit-governmental';
import { AddDeal } from './components/add-deal/add-deal';
import { BannedWords } from './components/banned-words/banned-words';
import { RejectedDeals } from './components/rejected-deals/rejected-deals';
import { ApprovedDeals } from './components/approved-deals/approved-deals';
import { PendingUsers } from './components/pending-users/pending-users';
import { PendingCreators } from './components/pending-creators/pending-creators';
import { Roles } from './components/roles/roles';
import { Dashcount } from './components/dashcount/dashcount';
import { DealDetails } from './components/deals/deal-details/deal-details';

import { WalletTransactions } from './components/wallet-transactions/wallet-transactions';
import { Settings } from './components/settings/settings';
import { TopUsersNotes } from './components/top-users-notes/top-users-notes';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Dashboard,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboardcount', pathMatch: 'full' },
      { path: 'dashboardcount', component: Dashcount },
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
        data: { role: 'verifycation' },
      },
      {
        path: 'verify_creator',
        component: PendingCreators,
        data: { role: 'verifycation' },
      },

      { path: 'addadmin', component: AddAdmin, data: { role: 'Admins' } },
      { path: 'roles', component: Roles, data: { role: 'Admins' } },
      { path: 'editadmin/:id', component: EditAdmin, data: { role: 'Admins' } },
      { path: 'interests', component: Interests, data: { role: 'Interests' } },
      { path: 'cities', component: Cities, data: { role: 'Cities' } },
      { path: 'countries', component: Countries, data: { role: 'Countries' } },
      { path: 'deals', component: Deals, data: { role: 'Deals' } },
      { path: 'approved', component: ApprovedDeals, data: { role: 'Deals' } },
      { path: 'rejected', component: RejectedDeals, data: { role: 'Deals' } },
      {
        path: 'bannedwords',
        component: BannedWords,
        data: { role: 'Banned_Words' },
      },
      { path: 'adddeal', component: AddDeal, data: { role: 'Deals' } },
      { path: 'deal-details/:id', component: DealDetails, data: { role: 'Deals' } },
      { path: 'calendar', component: Calendar },

      { path: 'wallet', component: WalletTransactions, data: { role: 'Wallet' } },
      { path: 'policy-settings', component: Settings },
      { path: 'top-users-notes', component: TopUsersNotes, data: { role: 'Users' } },
    ],
  },
  { path: '**', redirectTo: '' },
];