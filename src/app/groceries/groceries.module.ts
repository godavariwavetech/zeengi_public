import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroceriesPageRoutingModule } from './groceries-routing.module';

import { GroceriesPage } from './groceries.page';
import { register } from 'swiper/element/bundle';

register();

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroceriesPageRoutingModule
  ],
  declarations: [GroceriesPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class GroceriesPageModule { }
