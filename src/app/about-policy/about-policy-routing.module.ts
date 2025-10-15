import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutPolicyPage } from './about-policy.page';

const routes: Routes = [
  {
    path: '',
    component: AboutPolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutPolicyPageRoutingModule {}
