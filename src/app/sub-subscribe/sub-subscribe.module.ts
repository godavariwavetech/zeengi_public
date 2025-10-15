import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubSubscribePageRoutingModule } from './sub-subscribe-routing.module';

import { SubSubscribePage } from './sub-subscribe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubSubscribePageRoutingModule
  ],
  declarations: [SubSubscribePage]
})
export class SubSubscribePageModule {}
