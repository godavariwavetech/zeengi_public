import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AboutPolicyPageRoutingModule } from './about-policy-routing.module';

import { AboutPolicyPage } from './about-policy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutPolicyPageRoutingModule
  ],
  declarations: [AboutPolicyPage]
})
export class AboutPolicyPageModule {}
