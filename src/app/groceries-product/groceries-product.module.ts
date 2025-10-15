import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroceriesProductPageRoutingModule } from './groceries-product-routing.module';

import { GroceriesProductPage } from './groceries-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroceriesProductPageRoutingModule
  ],
  declarations: [GroceriesProductPage]
})
export class GroceriesProductPageModule {}
