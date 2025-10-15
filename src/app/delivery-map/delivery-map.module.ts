import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryMapPageRoutingModule } from './delivery-map-routing.module';

import { DeliveryMapPage } from './delivery-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryMapPageRoutingModule
  ],
  declarations: [DeliveryMapPage]
})
export class DeliveryMapPageModule {}
