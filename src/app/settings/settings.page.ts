import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(public navctrl: NavController, private alertController: AlertController,private api: ApiService) { }

  ngOnInit() {
  }

  goBack() {
    this.navctrl.back();
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      mode: 'ios',
      message: 'Are you sure you want to delete your account? ',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            // Call your delete logic here
            this.deleteuseraccount();

          }
        }
      ]
    });
    await alert.present();
  }

  deleteuseraccount() {
    var data = {
      customer_id:localStorage.getItem("usr_id")
    }
    this.api.deleteaccount(data).subscribe(async (res: any) => {

    })
    localStorage.removeItem('usr_id');
    localStorage.removeItem('name');
    localStorage.removeItem('number');
    localStorage.removeItem('cartData');
    localStorage.removeItem('cart_merchant');
    localStorage.removeItem('main_shopdetails');
    localStorage.removeItem('shopdetails');
    localStorage.setItem("set_delivery_distance_status", "0");
    this.navctrl.navigateRoot('/home');

  }
}
