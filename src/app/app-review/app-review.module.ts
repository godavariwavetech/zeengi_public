import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppReviewPageRoutingModule } from './app-review-routing.module';

import { AppReviewPage } from './app-review.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppReviewPageRoutingModule
  ],
  declarations: [AppReviewPage]
})
export class AppReviewPageModule {}
