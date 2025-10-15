import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryLocationPageRoutingModule } from './delivery-location-routing.module';

import { DeliveryLocationPage } from './delivery-location.page';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,ReactiveFormsModule,
    DeliveryLocationPageRoutingModule
  ],
  declarations: [DeliveryLocationPage],
  providers:[LocationAccuracy]
})
export class DeliveryLocationPageModule {}
