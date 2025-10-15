import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryMapPage } from './delivery-map.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryMapPageRoutingModule {}
