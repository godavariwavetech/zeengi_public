import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  AlertController,
  LoadingController,
  NavController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { ApiService } from '../service/api.service';

declare var cordova: any;
declare var google: any;

@Component({
  selector: 'app-allow-location',
  templateUrl: './allow-location.page.html',
  styleUrls: ['./allow-location.page.scss'],
})
export class AllowLocationPage implements OnInit {
  timeoutRef: any;

  constructor(
    public api: ApiService,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {}

  ngOnInit() {}

  async allowLocation() {
    await this.platform.ready();

    const loading = await this.loadingCtrl.create({
      message: 'Trying to get your location...',
      spinner: 'crescent',
    });
    await loading.present();

    // Show toast after 5 seconds if location takes time
    this.timeoutRef = setTimeout(() => {
      this.showToast('Still trying to get your location...');
    }, 5000);

    try {
      cordova.plugins.diagnostic.isLocationEnabled(async (enabled: boolean) => {
          if (!enabled) {
            clearTimeout(this.timeoutRef);
            await loading.dismiss();
            await this.askToEnableGPS();
          } else {
            await this.requestGeolocationPermission(loading);
          }
        },
        async (error: any) => {
          clearTimeout(this.timeoutRef);
          await loading.dismiss();
          this.showToast('We couldn’t access your location. Try entering it manually.');
          this.enterManually();
        }
      );
    } catch (err) {
      clearTimeout(this.timeoutRef);
      await loading.dismiss();
      this.showToast('We couldn’t access your location. Try entering it manually..');
      this.enterManually();
    }
  }

  async requestGeolocationPermission(loading: HTMLIonLoadingElement) {
    try {
      const permission = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        await this.getLocationAndProcess(loading);
      } else {
        clearTimeout(this.timeoutRef);
        await loading.dismiss();
        this.showAlert('Permission Denied', 'Location permission is required to continue.');
      }
    } catch (error) {
      clearTimeout(this.timeoutRef);
      await loading.dismiss();
      this.showToast('We couldn’t access your location. Try entering it manually.');
      this.enterManually();
    }
  }

  async getLocationAndProcess(loading: HTMLIonLoadingElement) {
    try {
      const resp = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const { latitude, longitude } = resp.coords;
      console.log('Coordinates:', latitude, longitude);

      localStorage.setItem('latitude', latitude.toString());
      localStorage.setItem('longitude', longitude.toString());
      localStorage.setItem('current_latitude', latitude.toString());
      localStorage.setItem('current_longitude', longitude.toString());

      await this.getlocation(latitude, longitude);

      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(latitude, longitude);

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[1]) {
          const address = results[1].formatted_address;
          localStorage.setItem('setlocation', address);
          localStorage.setItem('current_address', address);
        }
      });

      clearTimeout(this.timeoutRef);
      await loading.dismiss();
    } catch (error) {
      clearTimeout(this.timeoutRef);
      await loading.dismiss();
      this.showToast('Unable to get your location. Please try again or use manual location.');
    }
  }

  async getlocation(latitude: number, longitude: number) {
    const data = { location_latitude: latitude, location_longitude: longitude };

    this.api.getuserlocation(data).subscribe({
      next: async (res: any) => {
        if (res.status === 200 && res.data?.length) {
          const loc = res.data[0];
          localStorage.setItem('location_id', loc.id);
          localStorage.setItem('location_name', loc.location_name);
          localStorage.setItem('service_location_status', '1');
          localStorage.removeItem('delivery_elements');
          localStorage.setItem('set_delivery_distance_status', '0');

          this.showToast('Location matched. Redirecting to home...');
          this.navCtrl.navigateRoot('/home');
        } else {
          localStorage.setItem('service_location_status', '0');
          this.showAlert('Service Unavailable', 'Your area is currently not supported.');
          this.navCtrl.navigateRoot('servicelocation');
        }
      },
      error: () => {
        localStorage.setItem('service_location_status', '0');
        this.showAlert('Service Unavailable', 'Unable to fetch service area details.');
        this.navCtrl.navigateRoot('servicelocation');
      },
    });
  }

  async askToEnableGPS() {
    const alert = await this.alertCtrl.create({
      header: 'Enable GPS',
      message: 'Please enable your device location (GPS) to continue.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Open Settings',
          handler: () => {
            cordova.plugins.diagnostic.switchToLocationSettings();
          },
        },
      ],
    });
    await alert.present();
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }

  enterManually() {
    this.navCtrl.navigateRoot('default-address');
  }
}
