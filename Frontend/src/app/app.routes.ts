import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './features/home/home.component';
import { ClientComponent } from './features/client/client.component';
import { ItemComponent } from './features/item/item.component';

export const routes: Routes = [
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
    ],
  },
];
