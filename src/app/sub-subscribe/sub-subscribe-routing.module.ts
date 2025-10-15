import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubSubscribePage } from './sub-subscribe.page';

const routes: Routes = [
  {
    path: '',
    component: SubSubscribePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubSubscribePageRoutingModule {}
