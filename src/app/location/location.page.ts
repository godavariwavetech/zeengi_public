import { Component, OnInit } from '@angular/core';

import { LoadingController, NavController, Platform } from '@ionic/angular';

// import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../service/api.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';


@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  isLoading = false;

  constructor(public navctrl: NavController, private api: ApiService, private geolocation: Geolocation, private locationAccuracy: LocationAccuracy,
    private platform: Platform, public loadingCtrl: LoadingController) {

    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            // If request is successful, fetch the current location
            // this.getcurrentlocation();
          },
          (error) => {
            // In case of error, still try to fetch the current location
            console.error('Location accuracy request failed:', error);
            // this.getcurrentlocation();  // Handle fallback behavior or error handling here
          }
        );
      }
    });
  }

  ngOnInit() {
    this.getcurrentlocation();
  }

  gotolocation() {
    this.navctrl.navigateForward('servicelocation');
  }

  gotohome() {
    localStorage.setItem('path_name', 'location')
    this.navctrl.navigateForward('login');
  }

  isToastOpen = false;

  getcurrentlocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.getlocation(resp.coords.latitude, resp.coords.longitude);
      localStorage.setItem('latitude', resp.coords.latitude.toString());
      localStorage.setItem('longitude', resp.coords.longitude.toString());
      localStorage.setItem('current_latitude', resp.coords.latitude.toString());
      localStorage.setItem('current_longitude', resp.coords.longitude.toString());
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

  async getlocation(latitude: any, longitude: any) {
    var data = {
      location_latitude: latitude,
      location_longitude: longitude
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getuserlocation(data).subscribe(async (res: any) => {
      loading.dismiss(); //loader
      if (res.status == 200) {
        localStorage.setItem('location_id', res.data[0].id);
        localStorage.setItem('location_name', res.data[0].location_name);
        localStorage.setItem('service_location_status', "1");
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status","0");
        this.navctrl.navigateRoot('home');
      } else if (res.status == 300) {
        localStorage.setItem('service_location_status', "0");
        // this.navctrl.navigateForward('servicelocation');
      } else {
        localStorage.setItem('service_location_status', "0");
      }
    }, error => {
      this.isLoading = false;
    })
  }

  gotocontinuenextpage() {
    const location_id = localStorage.getItem('location_id');
    if([null, 'undefined', '', 0, "0"].includes(location_id)) {
      this.navctrl.navigateRoot('servicelocation');
    } else {
      this.navctrl.navigateRoot('home');
    }
  }
  
}
