import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultAddressPage } from './default-address.page';

const routes: Routes = [
  {
    path: '',
    component: DefaultAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultAddressPageRoutingModule {}
