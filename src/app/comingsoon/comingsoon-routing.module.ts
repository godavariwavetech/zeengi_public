import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComingsoonPage } from './comingsoon.page';

const routes: Routes = [
  {
    path: '',
    component: ComingsoonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComingsoonPageRoutingModule {}
