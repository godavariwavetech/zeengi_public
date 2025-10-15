import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroceriesProductPage } from './groceries-product.page';

const routes: Routes = [
  {
    path: '',
    component: GroceriesProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroceriesProductPageRoutingModule {}
