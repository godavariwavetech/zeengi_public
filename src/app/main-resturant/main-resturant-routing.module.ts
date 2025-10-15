import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainResturantPage } from './main-resturant.page';

const routes: Routes = [
  {
    path: '',
    component: MainResturantPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainResturantPageRoutingModule {}
