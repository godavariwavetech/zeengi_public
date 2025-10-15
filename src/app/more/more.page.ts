import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {
  login: boolean = false;
  data: any
  cartdata: any = []
  cartCount: number = 0; profile_image: any;

  constructor(private alertController: AlertController, public navctrl: NavController, public api: ApiService) {
    this.get();
    this.profile_image = localStorage.getItem("profile_image");
    console.log(this.profile_image);

  }

  ngOnInit() {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
      this.login = false;
    } else {
      this.login = true;
    }

    const data = localStorage.getItem('cartData');
    this.cartdata = data ? JSON.parse(data) : [];

    this.cartCount = this.cartdata.reduce((total: number, item: any) => {
      return total + (item.itemscount || 0);
    }, 0);

    if (localStorage.getItem('name') == '' || localStorage.getItem('name') == null || localStorage.getItem('name') == 'null' || localStorage.getItem('name') == undefined || localStorage.getItem('name') == 'undefined') {
      this.firstName = 'U';
      this.nme = 'User';
    } else {
      this.nme = localStorage.getItem('name');
      this.firstName = this.nme.split('')[0];
    }
  }
  nme: any
  firstName: any
  async Logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to Logout ?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
        },
        {
          text: 'Logout',
          cssClass: 'alert-delete',
          handler: () => {
            this.logout();
          },
        },
      ],
      cssClass: 'delete-alert'
    });
    await alert.present();
  }

  logout() {
    localStorage.removeItem('usr_id');
    localStorage.removeItem('name');
    localStorage.removeItem('number');
    localStorage.removeItem('cartData');
    localStorage.removeItem('cart_merchant');
    localStorage.removeItem('main_shopdetails');
    localStorage.removeItem('shopdetails');
    localStorage.setItem("set_delivery_distance_status", "0");
    this.navctrl.navigateForward('/login');
  }

  goBack() {
    this.navctrl.back();
  }

  async gotoprofile() {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
      this.logindevice();
    } else {
      this.navctrl.navigateForward('/profile');
    }
  }

  async gotoorders(orderind: any) {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
      this.logindevice();
    } else {
      this.navctrl.navigateForward('/orders', {
        queryParams: { orderindication: orderind }
      });
    }
  }

  loginUser() {
    // this.navctrl.navigateRoot('/login');

    localStorage.setItem('path_name', 'more')
    this.navctrl.navigateRoot('/login');
  }

  gotocollection() {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
      this.logindevice();
    } else {
      this.navctrl.navigateForward('/collection');
    }
  }

  async gotowallet() {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
      this.logindevice();
    } else {
      this.navctrl.navigateForward('/wallet');
    }
  }

  async logindevice() {
    const alert = await this.alertController.create({
      header: 'Please Login',
      message: 'Are you sure to Login ? ',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
        },
        {
          text: 'Login',
          cssClass: 'alert-delete',
          handler: () => {
            localStorage.setItem('path_name', 'more')
            this.navctrl.navigateRoot('/login');
          },
        },
      ],
      cssClass: 'delete-alert'
    });
    await alert.present();
  }


  async gotoaddress() {
    this.navctrl.navigateForward('default-address');
    localStorage.setItem('path_name', 'more')
  }

  async share() {
    await Share.share({
      title: 'Check out Zeengi!',
      text: 'Download Zeengi from the Play Store:',
      url: 'https://play.google.com/store/search?q=Zeengi&c=apps',
      dialogTitle: 'Share Zeengi with your friends'
    });
  }

  navigateTo(item: any) {

  }

  userdata: any = ''
  profileCompletion: any = 0

  get() {
    this.api.getprofile().subscribe(async (res: any) => {
      this.userdata = res.data[0];
      this.calculateProfileCompletion();
    })
  }

  calculateProfileCompletion() {
    const fieldsToCheck = [
      this.userdata.customer_name,
      this.userdata.profile_image,
      this.userdata.customer_mobile_number,
      this.userdata.customer_dob,
      this.userdata.customer_email,
      this.userdata.gender,
      this.userdata.anniversary
    ];
    const filledFields = fieldsToCheck.filter(field => field !== null && field !== '' && field !== 'null').length;
    const totalFields = fieldsToCheck.length;
    this.profileCompletion = Math.round((filledFields / totalFields) * 100);
  }

  ionViewWillEnter() {
    this.profile_image = localStorage.getItem("profile_image");
  }
}
