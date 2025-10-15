import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetworkOffPage } from './network-off.page';

const routes: Routes = [
  {
    path: '',
    component: NetworkOffPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetworkOffPageRoutingModule {}
