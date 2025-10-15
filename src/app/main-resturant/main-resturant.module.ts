import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainResturantPageRoutingModule } from './main-resturant-routing.module';

import { MainResturantPage } from './main-resturant.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainResturantPageRoutingModule
  ],
  declarations: [MainResturantPage]
})
export class MainResturantPageModule {}
