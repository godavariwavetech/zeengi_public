import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-network-off',
  templateUrl: './network-off.page.html',
  styleUrls: ['./network-off.page.scss'],
})
export class NetworkOffPage implements OnInit {

  constructor(private router: Router,public toastController: ToastController) { }

  ngOnInit() {
  }

  async retry() {
    const status = await Network.getStatus();
    if (status.connected) {
      const user_id = localStorage.getItem('usr_id');
      if ([null, 'undefined', '', 0, "0"].includes(user_id)) {
      this.router.navigateByUrl('/login');
    } else {
      this.router.navigateByUrl('/home');
    }
      
    } else {
      this.presentToast(`Check your internet connection`);
    }
  }

  async presentToast(message: string, duration: number = 5000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom', // 'top', 'middle', 'bottom'
      color: 'danger', // 'primary', 'secondary', 'danger', etc.
    });
    await toast.present();
  }

}
