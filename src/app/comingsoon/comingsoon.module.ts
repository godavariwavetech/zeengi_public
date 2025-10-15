import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComingsoonPageRoutingModule } from './comingsoon-routing.module';

import { ComingsoonPage } from './comingsoon.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComingsoonPageRoutingModule
  ],
  declarations: [ComingsoonPage]
})
export class ComingsoonPageModule {}
