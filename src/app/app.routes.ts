import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Admins } from './components/Admin/edit-admin/admins/admins';
import { Users } from './components/User/users/users';
import { Merchants } from './components/merchants/merchants';

import { Governments } from './components/governments/governments';
import { Messages } from './components/messages/messages';
import { Interests } from './components/interests/interests';
import { Cities } from './components/cities/cities';
import { Countries } from './components/countries/countries';
import { Deals } from './components/deals/deals';

import { BarChart } from './components/bar-chart/bar-chart';
import { PieChart } from './components/pie-chart/pie-chart';
import { LineChart } from './components/line-chart/line-chart';
import { GeoChart } from './components/geo-chart/geo-chart';
import { Calendar } from './components/calendar/calendar';
import { Faq } from './components/faq/faq';
import { Dash } from './components/dash/dash';
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
export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Dashboard,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dash },
      { path: 'admins', component: Admins },
      { path: 'users', component: Users },
      { path: 'adduser', component: AddUser },
      { path: 'edituser/:id', component: EditUser },
      { path: 'merchants', component: Merchants },
      { path: 'addmerchant', component: AddMerchant },
      { path: 'editmerchant/:id', component: EditMerchant },
      { path: 'governments', component: Governments },
      { path: 'addgovernmental', component: AddGovernmental },
      { path: 'editgovernmental/:id', component: EditGovernmental },
      { path: 'messages', component: Messages },
      { path: 'addadmin', component: AddAdmin },
      { path: 'editadmin/:id', component: EditAdmin },
      { path: 'interests', component: Interests },
      { path: 'cities', component: Cities },
      { path: 'countries', component: Countries },
      { path: 'deals', component: Deals },
            { path: 'bannedwords', component: BannedWords },

      { path: 'adddeal', component: AddDeal },
      { path: 'bar-chart', component: BarChart },
      { path: 'pie-chart', component: PieChart },
      { path: 'line-chart', component: LineChart },
      { path: 'geo-chart', component: GeoChart },
      { path: 'calendar', component: Calendar },
      { path: 'faq', component: Faq },
    ],
  },

  { path: '**', redirectTo: '' },
];
