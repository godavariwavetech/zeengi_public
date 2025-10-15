import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundPageRoutingModule } from './refund-routing.module';

import { RefundPage } from './refund.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundPageRoutingModule
  ],
  declarations: [RefundPage]
})
export class RefundPageModule {}
