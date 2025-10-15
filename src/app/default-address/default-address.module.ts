import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefaultAddressPageRoutingModule } from './default-address-routing.module';

import { DefaultAddressPage } from './default-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefaultAddressPageRoutingModule
  ],
  declarations: [DefaultAddressPage]
})
export class DefaultAddressPageModule {}
