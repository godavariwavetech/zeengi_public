import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicelocationPageRoutingModule } from './servicelocation-routing.module';

import { ServicelocationPage } from './servicelocation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicelocationPageRoutingModule
  ],
  declarations: [ServicelocationPage]
})
export class ServicelocationPageModule {}
