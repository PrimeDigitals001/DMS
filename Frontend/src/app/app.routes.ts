import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { ClientComponent } from './features/client/client.component';
import { ItemComponent } from './features/item/item.component';
import { CustomerComponent } from './features/customer/customer.component';
import { CustomerInvoiceComponent } from './features/customer/customer-invoice.component';
import { UserSeederComponent } from './components/user-seeder/user-seeder.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'seeder',
    component: UserSeederComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'clients',
        component: ClientComponent,
      },
      {
        path: 'items',
        component: ItemComponent,
      },
      {
        path: 'customers',
        component: CustomerComponent,
      },
      {
        path: 'invoices',
        component: CustomerInvoiceComponent,
      }
    ],
  },
];
