import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VegmodeModalPageRoutingModule } from './vegmode-modal-routing.module';

import { VegmodeModalPage } from './vegmode-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VegmodeModalPageRoutingModule
  ],
  declarations: [VegmodeModalPage]
})
export class VegmodeModalPageModule {}
