import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetworkOffPageRoutingModule } from './network-off-routing.module';

import { NetworkOffPage } from './network-off.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkOffPageRoutingModule
  ],
  declarations: [NetworkOffPage]
})
export class NetworkOffPageModule {}
