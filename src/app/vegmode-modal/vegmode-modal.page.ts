import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-vegmode-modal',
  templateUrl: './vegmode-modal.page.html',
  styleUrls: ['./vegmode-modal.page.scss'],
})
export class VegmodeModalPage implements OnInit {


  constructor(private modalCtrl: ModalController) {}

   ngOnInit() {
  }

confirmOff() {
    this.modalCtrl.dismiss({ confirmed: true });
  }

  dismiss() {
    this.modalCtrl.dismiss({ confirmed: false });
  }
}
