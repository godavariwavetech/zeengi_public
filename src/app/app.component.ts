import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import OneSignal from 'onesignal-cordova-plugin';
import { ApiService } from './service/api.service';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { AlertController } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';


import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  
  latitude: any;

  longitude: any;

  previousUrl: string = '';

  currentUrl: string = '';

  constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService, public platform: Platform, public api: ApiService, private geolocation: Geolocation, private locationAccuracy: LocationAccuracy, private modalCtrl: ModalController, private alertCtrl: AlertController) {
    this.monitorNetwork();
    const locationId = localStorage.getItem('location_id');
    const user_id = localStorage.getItem('usr_id');

    if ([null, 'undefined', '', 0, "0"].includes(locationId)) {
      this.navCtrl.navigateRoot('/slides');
    } else if ([null, 'undefined', '', 0, "0"].includes(user_id)) {
      this.navCtrl.navigateRoot('/login');
    } else {
      this.navCtrl.navigateRoot('/home');
    }

    this.setupStatusBar();
    platform.ready().then(() => {
      if (platform.is('android')) {
        this.OneSignalInit();
      }
    });

    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            this.getcurrentlocation();
          },
          (error) => {
            console.error('Location accuracy request failed:', error);
          }
        );
      }
    });

    // this.initializeApp();

    this.initapp()

    this.setupStatusBar();
  }

  async initapp() {
    await SplashScreen.hide();
    await SplashScreen.show({
      showDuration: 2500,
      autoHide: true,
    });
  }

  OneSignalInit() {
    try {
      OneSignal.initialize("e18577fd-869b-46d0-9d9c-a02b9987ffc5");
      let myClickListener = async function (event: any) {
        let notificationData = JSON.stringify(event);
      };
      OneSignal.Notifications.addEventListener("click", myClickListener);
      OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {

      });
      OneSignal.User.pushSubscription.addEventListener("change", (event: any) => {
        localStorage.setItem('player_id', event.current.id);
        this.addplayerid();
      });
    } catch (e) {
    }
  }
  addplayerid() {
    var data = {
      player_id: localStorage.getItem('player_id'),
      user_type: 0,
      user_id: 0,
      location_id: localStorage.getItem('location_id') || 0
    }
    this.api.postplayer_id(data).subscribe(async (res: any) => {
    });
  }

  async setupStatusBar() {
    // try {
    //   await StatusBar.setOverlaysWebView({ overlay: true }); // Makes status bar float over content
    //   await StatusBar.setBackgroundColor({ color: 'transparent' }); // Fully transparent status bar
    // } catch (error) {
    //   console.error('Error setting up status bar:', error);
    // }
  }

  getlocation(latitude: any, longitude: any) {
    var data = {
      location_latitude: latitude,
      location_longitude: longitude
    }
    this.api.getuserlocation(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        localStorage.setItem('location_id', res.data[0].id);
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status", "0");
        localStorage.setItem('location_name', res.data[0].location_name);
        localStorage.setItem('service_location_status', "1");
        this.navCtrl.navigateRoot('home');
      } else if (res.status == 300) {
        localStorage.setItem('service_location_status', "0");
        // this.navCtrl.navigateRoot('servicelocation');
      } else {
        localStorage.setItem('service_location_status', "0");
        // this.navCtrl.navigateRoot('servicelocation');
      }
    }, error => {
    })

    this.currentUrl = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
  }

  getcurrentlocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      localStorage.setItem('latitude', resp.coords.latitude.toString());
      localStorage.setItem('longitude', resp.coords.longitude.toString());
      localStorage.setItem('current_latitude', resp.coords.latitude.toString());
      localStorage.setItem('current_longitude', resp.coords.longitude.toString());

      localStorage.setItem('setlatlongs', resp.coords.latitude.toString() + ',' + resp.coords.longitude.toString())

      this.getlocation(resp.coords.latitude, resp.coords.longitude);
      const latlng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const geocoder = new google.maps.Geocoder();
      // Use 'location' instead of 'latLng'
      geocoder.geocode({ 'location': latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[1]) {
          localStorage.setItem("setlocation", results[1].formatted_address);
          localStorage.setItem("current_address", results[1].formatted_address);
        } else {

        }
      });
    }).catch((error: any) => {

    });
  }

  appVersion: any = '';
  dbversion: any = '';

  // async initializeApp() {
  //   this.platform.ready().then(() => {
  //     this.registerBackButtonListener();
  //   });

  //   await this.platform.ready();
  //   try {
  //     await StatusBar.setBackgroundColor({ color: '#F57B00' }); // Match your header
  //     await StatusBar.setStyle({ style: Style.Light });          // Use Style.Dark if bg is light
  //     await StatusBar.show();
  //   } catch (err) {
  //     console.warn('StatusBar plugin error:', err);
  //   }
  // }

  registerBackButtonListener() {
    CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
      // const currentPath = this.router.url;
      const url = this.router.url;
      const currentPath = url.includes('?') ? url.split('?')[0] : url;

      const body = document.querySelector('body');
      if (body) {
        body.classList.remove('scanner-active');
      }

      const topModal = await this.modalCtrl.getTop();
      console.log(topModal);

      if (topModal) {
        console.log("hont 1")
        await this.modalCtrl.dismiss();
        return;
      }
      if (currentPath === '/basket') {

      } else if (currentPath === '/main-resturant') {
        this.router.navigateByUrl('/home');
        // if (this.previousUrl === '/basket') {
        //   this.router.navigateByUrl('/home');
        // } else {
        //   this.router.navigateByUrl('/home');
        // }
      } else if (['/home', '/location', '/slides'].includes(currentPath)) {
        console.log("hont 3")
        CapacitorApp.exitApp();
      } else {
        console.log("hont 4")
        if (canGoBack || window.history.length > 1) {
          console.log("hont 41")
          window.history.back();
        } else {
          console.log("hont 42")
          CapacitorApp.exitApp();
        }
      }
    });
  }

  async monitorNetwork() {
    const status = await Network.getStatus();
    this.handleNetworkStatus(status.connected);

    Network.addListener('networkStatusChange', (status) => {
      this.handleNetworkStatus(status.connected);
    });
  }

  //  async handleNetworkStatus(connected: boolean) {
  //   if (!connected) {
  //     const alert = await this.alertCtrl.create({
  //       header: 'No Internet Connection',
  //       message: 'Please check your internet connection.',
  //       backdropDismiss: false,
  //       buttons: [
  //         {
  //           text: 'OK',
  //           handler: () => {
  //             CapacitorApp.exitApp(); // ✅ Exit the app when OK is clicked
  //           },
  //         },
  //       ],
  //     });
  //     await alert.present();
  //   }
  // }

  handleNetworkStatus(connected: boolean) {
    if (!connected) {
      this.router.navigateByUrl('/network-off');
    }
  }

  private async setupSystemBars() {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
      // 1) Go edge-to-edge (transparent system bars; webview draws behind them)
      // await EdgeToEdge.enable();

      // 2) Paint the area behind status/nav bars
      await EdgeToEdge.setBackgroundColor({ color: '#F57B00' });

      // 3) Pick icon color that contrasts your bg.
      // Style.Dark = light icons; Style.Light = dark icons
      await StatusBar.setStyle({ style: Style.Dark });

      // await StatusBar.show();
    } catch (err) {
      console.warn('System bar setup error:', err);
    }
  }


}





