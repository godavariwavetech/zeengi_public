import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShopRatingsPageRoutingModule } from './shop-ratings-routing.module';

import { ShopRatingsPage } from './shop-ratings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShopRatingsPageRoutingModule
  ],
  declarations: [ShopRatingsPage]
})
export class ShopRatingsPageModule {}
