import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VegmodeModalPage } from './vegmode-modal.page';

const routes: Routes = [
  {
    path: '',
    component: VegmodeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VegmodeModalPageRoutingModule {}
