import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppReviewPage } from './app-review.page';

const routes: Routes = [
  {
    path: '',
    component: AppReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppReviewPageRoutingModule {}
