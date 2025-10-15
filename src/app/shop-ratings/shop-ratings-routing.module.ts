import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShopRatingsPage } from './shop-ratings.page';

const routes: Routes = [
  {
    path: '',
    component: ShopRatingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRatingsPageRoutingModule {}
