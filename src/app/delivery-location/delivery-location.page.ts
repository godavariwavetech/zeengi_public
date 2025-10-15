/// <reference types="@types/googlemaps" />
import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

declare var cordova: any;
declare var google: any; // Ensure google is recognized as a global object

@Component({
  selector: 'app-delivery-location',
  templateUrl: './delivery-location.page.html',
  styleUrls: ['./delivery-location.page.scss'],
})
export class DeliveryLocationPage implements AfterViewInit {

  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  samelatlong: number = 0;
  map!: google.maps.Map;
  latitude: number = parseFloat(localStorage.getItem("latitude") || "0"); // Default to 0 if not found
  longitude: number = parseFloat(localStorage.getItem("longitude") || "0"); // Default to 0 if not found
  searchQuery: string = '';

  initialZoom = 15;
  cleaned_full_address: any;
  full_address: any;
  marker!: google.maps.Marker;
  city_name: any;
  short_address: any;
  private debounceTimer: any = null;

  async canDismiss(data?: undefined, role?: string) {
    return role !== 'gesture';
  }

  constructor(public alertController: AlertController, private api: ApiService, public navctrl: NavController, private toastCtrl: ToastController, private loadingCtrl: LoadingController, public router: Router, public alertCtrl: AlertController,) {
    /// <reference types="google.maps" />
    if ([null, 0, "0", "", "null", "undefined"].includes(this.latitude)) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.initializeMap(this.latitude, this.longitude);
        }, error => {
          // Handle error if geolocation is not available
        });
      }
    }

    setInterval(() => {
      this.full_address;
      this.city_name;
      this.short_address;
    }, 1000);
  }

  ngOnInit() {
    this.loadGooglePlaces();
  }

  ngAfterViewInit() {
    this.initializeMap(this.latitude, this.longitude);
  }

  debounce(func: Function, delay: number) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      func();
    }, delay);
  }

  initializeMap(latitude: any, longitude: any) {
    if (!this.mapElement) {
      console.error('Map element is not available');
      return;
    }

    const latlng = new google.maps.LatLng(latitude, longitude);
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: latlng }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const fullAddress = results[0].formatted_address;
        const components = results[0].address_components;

        this.full_address = fullAddress;
        this.city_name = components[1]?.short_name || '';
        const short1 = components[2]?.short_name || '';
        const short2 = components[3]?.short_name || '';
        this.short_address = short1 + ',' + short2;

        // Start cleaning the address
        let cleanedAddress = fullAddress;

        // Remove Plus Code at start of string (e.g. GM7F+9WQ,)
        cleanedAddress = cleanedAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{3},?\s*/i, '');

        // Remove city name and short address parts
        if (this.city_name) {
          cleanedAddress = cleanedAddress.replace(this.city_name, '');
        }
        if (short1) {
          cleanedAddress = cleanedAddress.replace(short1, '');
        }
        if (short2) {
          cleanedAddress = cleanedAddress.replace(short2, '');
        }

        // Replace multiple commas or commas with spaces between with a single comma
        cleanedAddress = cleanedAddress.replace(/,\s*,+/g, ',').replace(/\s{2,}/g, ' ').trim();

        // Remove comma at start or end if present
        cleanedAddress = cleanedAddress.replace(/^,|,$/g, '').trim();

        this.cleaned_full_address = cleanedAddress;


      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });



    setInterval(() => {
      this.full_address;
      this.city_name;
      this.short_address;
    }, 1000);
    // Initialize the Google Map
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: latitude, lng: longitude },
      zoom: this.initialZoom,
      disableDefaultUI: true
    });
    // Add a fixed marker that will always stay at the center
    this.marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: this.map,
      draggable: false  // Marker is fixed, not draggable
    });
    this.map.addListener('center_changed', () => {
      const center = this.map.getCenter(); // Get the new center of the map
      this.latitude = center.lat(); // Update latitude to new center
      this.longitude = center.lng(); // Update longitude to new center
      // te the marker's position to the new center of the map
      this.smoothMarkerTransition(center);
      // Optionally update address from coordinates
      setTimeout(() => {
        if (this.latitude !== this.samelatlong) {
          this.samelatlong = this.latitude;
          this.updateAddressFromCoordinates(this.latitude, this.longitude);
        }
      }, 800);
    });
  }

  smoothMarkerTransition(newCenter: google.maps.LatLng) {
    const currentPos = this.marker.getPosition();
    if (!currentPos) {
      console.error('Marker position is not available');
      return;
    }
    const targetLat = newCenter.lat();
    const targetLng = newCenter.lng();
    const steps = 1;
    const duration = 1000;
    const stepDelay = duration / steps;
    let step = 0;
    const animateMarker = () => {
      const lat = currentPos.lat() + (targetLat - currentPos.lat()) * (step / steps);
      const lng = currentPos.lng() + (targetLng - currentPos.lng()) * (step / steps);
      this.marker.setPosition(new google.maps.LatLng(lat, lng));
      step++;
      if (step <= steps) {
        requestAnimationFrame(animateMarker);
      }
    };
    animateMarker();
  }

  updateAddressFromCoordinates(latitude: any, longitude: any) {
    const latlng = new google.maps.LatLng(latitude, longitude);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latlng }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        this.full_address = results[0].formatted_address;
        this.city_name = results[0].address_components[1].short_name;
        this.short_address = results[0].address_components[2].short_name + "," + results[0].address_components[3].short_name;
        localStorage.setItem('full_address', this.full_address);
      }
    });
  }

  loadGooglePlaces() {
    const input = document.getElementById('place-input') as HTMLInputElement;
    const options = {
      types: ['establishment'], // Optional filter
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
        this.initializeMap(this.latitude, this.longitude);
      }
    });
  }

  mainlatitude: any = ''
  mainlongitude: any = ''

  async getlocationchck(latitude: any, longitude: any) {
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
      if (res.status == 200) {
        // localStorage.setItem('location_id', res.data[0].id);
        // localStorage.setItem('location_name', res.data[0].location_name);
        loading.dismiss();
        this.latitude = latitude
        this.longitude = longitude
        this.isModalOpen = false;
        this.initializeMap(latitude, longitude);
        localStorage.setItem('address_store', '1');
      } else if (res.status == 300) {
        this.isModalOpen = false;
        loading.dismiss();
        this.get();
      } else {
        loading.dismiss();
        this.isModalOpen = false;
        this.get();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  timeoutRef: any;

  // async usecurrentlocation2() {
  //   const loading = await this.presentLoading(); // Show spinner
  //   if ('geolocation' in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         this.latitude = position.coords.latitude;
  //         this.longitude = position.coords.longitude;

  //         localStorage.setItem("current_latitude", this.latitude.toString());
  //         localStorage.setItem("current_longitude", this.longitude.toString());

  //         this.setCurrentPosition2(this.latitude, this.longitude);
  //         loading.dismiss(); // Stop spinner
  //       },
  //       (error) => {
  //         console.warn('Geolocation failed. Using stored values.', error);
  //         this.setCurrentPosition2(localStorage.getItem("current_latitude"), localStorage.getItem("current_longitude")); // fallback
  //         loading.dismiss(); // Stop spinner
  //       },
  //       {
  //         enableHighAccuracy: false,
  //         timeout: 10000,
  //         maximumAge: 30000
  //       }
  //     );
  //   } else {
  //     console.warn('Geolocation not available');
  //     this.setCurrentPosition2(localStorage.getItem("current_latitude"), localStorage.getItem("current_longitude"));
  //     await this.requestGeolocationPermission(loading);
  //     loading.dismiss();
  //   }
  // }

  async usecurrentlocation2() {
    const loading = await this.presentLoading(); // Show spinner

    cordova.plugins.diagnostic.isLocationEnabled(
      async (enabled: boolean) => {
        if (!enabled) {
          clearTimeout(this.timeoutRef);
          await loading.dismiss();
          await this.askToEnableGPSwer();
        } else {
          try {
            // Optional: Check for permission before proceeding
            await this.requestGeolocationPermission(loading);

            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;

                  localStorage.setItem("current_latitude", lat.toString());
                  localStorage.setItem("current_longitude", lng.toString());

                  this.latitude = lat;
                  this.longitude = lng;

                  this.setCurrentPosition2(lat, lng);
                  await loading.dismiss();
                },
                async (error) => {
                  console.warn('Geolocation failed. Using stored values.', error);
                  const storedLat = localStorage.getItem("current_latitude");
                  const storedLng = localStorage.getItem("current_longitude");

                  this.setCurrentPosition2(storedLat, storedLng);
                  await loading.dismiss();
                },
                {
                  enableHighAccuracy: false,
                  timeout: 10000,
                  maximumAge: 30000
                }
              );
            } else {
              console.warn('Geolocation not available');
              const storedLat = localStorage.getItem("current_latitude");
              const storedLng = localStorage.getItem("current_longitude");

              this.setCurrentPosition2(storedLat, storedLng);
              await loading.dismiss();
            }
          } catch (err) {
            console.error('Permission or geolocation error:', err);
            await loading.dismiss();
            this.showToast('We couldn’t access your location. Try entering it manually.');
          }
        }
      },
      async (error: any) => {
        clearTimeout(this.timeoutRef);
        await loading.dismiss();
        this.showToast('We couldn’t access your location. Try entering it manually.');
      }
    );
  }


  async requestGeolocationPermission(loading: HTMLIonLoadingElement) {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted') {
        await this.getLocationAndProcess(loading);
      } else {
        clearTimeout(this.timeoutRef);
        await loading.dismiss();
        this.showAlert('Permission Denied', 'It Look like Turn Off Permissions Required for this feature. It can be enable under Phone Settings > Apps > Fresho Zapcart > Permissions');
        cordova.plugins.diagnostic.isLocationEnabled((enabled: boolean) => {
          if (!enabled) {
            this.askToEnableGPSwer();
          } else {
            this.enableHighAccuracyLocation();
          }
        }, (error: any) => {
          console.error("Error checking location", error);
        });

      }
    } catch (error) {
      clearTimeout(this.timeoutRef);
      await loading.dismiss();
      this.showToast('We couldn’t access your location. Try entering it manually.');
      // this.enterManually();
    }
  }
  async enableHighAccuracyLocation() {
    try {
      const permission = await Geolocation.requestPermissions();
      cordova.plugins.locationAccuracy.request(
        (success: any) => {
          console.log("High-accuracy location enabled", success);
        },
        (error: any) => {
          console.error("Failed to enable high accuracy", error);
        },
        cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
      );
    } catch (error) {
      console.error('Permission error', error);
    }
  }

  async getLocationAndProcess(loading: HTMLIonLoadingElement) {
    try {
      const resp = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      const { latitude, longitude } = resp.coords;

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

  async askToEnableGPSwer() {
    const alert = await this.alertController.create({
      header: 'Location Required',
      message: 'Please Enable your Device Location to continue.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Open Settings',
          handler: () => {
            // cordova.plugins.diagnostic.switchToLocationSettings();
            // cordova.plugins.diagnostic.switchToAppSettings();
            cordova.plugins.diagnostic.switchToSettings();
          }
        }
      ]
    });
    await alert.present();
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

  setCurrentPosition2(latitude: any, longitude: any) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.initializeMap(latitude, longitude);
    // if ([null, 0, "0", "", "null", "undefined"].includes(localStorage.getItem("current_latitude"))) {
    //   if ('geolocation' in navigator) {
    //     navigator.geolocation.getCurrentPosition((position: any) => {
    //       this.latitude = position.coords.latitude;
    //       this.longitude = position.coords.longitude;
    //       this.initializeMap(this.latitude, this.longitude);
    //     }, (error: any) => {
    //       this.latitude = parseFloat(localStorage.getItem("current_latitude") || "0");
    //       this.longitude = parseFloat(localStorage.getItem("current_longitude") || "0");
    //       this.initializeMap(this.latitude, this.longitude);
    //     });
    //   }
    // } else {
    //   this.latitude = parseFloat(localStorage.getItem("current_latitude") || "0");
    //   this.longitude = parseFloat(localStorage.getItem("current_longitude") || "0");
    //   this.initializeMap(this.latitude, this.longitude);
    // }
  }

  clearSearch() {
    this.searchQuery = '';
  }

  //---------------------------------------Address----------------------------------------

  isModalOpen = true;

  open() {
    this.getlocation(this.latitude, this.longitude)
  }

  close() {
    this.isModalOpen = false;
  }

  number = localStorage.getItem('number')

  address = {
    completeAddress: '',
    floor: '',
    landmark: '',
    address_type: '',
  };

  tags: string[] = ['Home', 'Work', 'Hotel', 'Other'];
  selectedTag: string = 'Home'; // Default selection

  selectTag(tag: string) {
    this.selectedTag = tag;
  }

  path: any;

  async getlocation(lat: any, long: any) {
    var data = {
      location_latitude: lat,
      location_longitude: long
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getuserlocation(data).subscribe(async (res: any) => {
      if (res.status == 200) {

        localStorage.setItem('location_id', res.data[0].id);
        localStorage.setItem('location_name', res.data[0].location_name);
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status", "0");

        this.locaton_id = res.data[0].id;
        this.checkcart();
        loading.dismiss();
      } else if (res.status == 300) {
        this.isModalOpen = false;
        this.get();
        loading.dismiss()
      } else {
        loading.dismiss()
        this.isModalOpen = false;
        this.get();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  data: any = '';
  cartdata: any = [];
  locaton_id: any = ''

  async checkcart() {
    this.data = localStorage.getItem('cartData');
    this.cartdata = [];
    if (this.data) {
      try {
        this.cartdata = JSON.parse(this.data);
      } catch (error) { };
    }
    if (this.cartdata.length) {
      if (this.locaton_id != localStorage.getItem('current_location_id')) {
        const alert = await this.alertController.create({
          mode: 'ios',
          header: 'Switch Location?',
          message: 'You already have items in your cart from another location. To continue, you’ll need to clear your cart. Do you want to proceed?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {

              }
            },
            {
              text: 'Clear Cart & Switch',
              handler: () => {
                localStorage.removeItem('cartData');
                localStorage.removeItem('cart_merchant');
                localStorage.removeItem('main_shopdetails');
                localStorage.removeItem('shopdetails');
                localStorage.setItem("set_delivery_distance_status", "0");
                this.isModalOpen = true;

              }
            }
          ]
        });
        await alert.present();
      } else {
        this.isModalOpen = true;
      }
    } else {
      this.isModalOpen = true;
    }
  }

  async clearcart() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Switch Location?',
      message: 'You already have items in your cart from another location. To continue, you’ll need to clear your cart. Do you want to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Clear Cart & Switch',
          handler: () => {
            localStorage.removeItem('cartData');
            localStorage.removeItem('cart_merchant');
            localStorage.removeItem('main_shopdetails');
            localStorage.removeItem('shopdetails');
            localStorage.setItem("set_delivery_distance_status", "0");
            this.isModalOpen = true;

          }
        }
      ]
    });
    await alert.present();
  }

  async get() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'We’ll arrive shortly—please hold on',
      message: 'It seems online ordering isn’t supported in your area just yet."',
      buttons: [
        {
          text: 'Re-locate',
          handler: () => {

          }
        },
        {
          text: 'Our-Services',
          handler: () => {
            this.navctrl.navigateRoot('servicelocation');
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    // this.navCtrl.navigateForward('/home');
    this.navctrl.back();
  }

  postaddress() {
    const addressParts = [
      this.address.completeAddress,
      this.city_name,
      this.short_address,
      this.cleaned_full_address
    ]
      .map(part => part ? part.trim().replace(/^,|,$/g, '').trim() : '') // remove leading/trailing commas and trim spaces
      .filter(part => part && part !== ','); // remove empty or just commas

    const formattedAddress = addressParts.join(', ');
    console.log(this.address);

    var data = {
      address_type: this.selectedTag === "Other" ? this.address.address_type : this.selectedTag,
      full_address: formattedAddress,
      customer_latitude: this.latitude,
      customer_longitude: this.longitude,
      location_id: localStorage.getItem('location_id'),
      customer_id: localStorage.getItem('usr_id')
    }


    this.api.post_customer_delivery_address(data).subscribe(async (res: any) => {

      if (res.status == 200) {
        localStorage.setItem("set_delivery_distance_status", "0");
        this.isModalOpen = false;
        setTimeout(() => {

          localStorage.setItem("location_id", res.data[1][0].location_id);
          localStorage.setItem('location_name', res.data[1][0].location_name);

          localStorage.setItem("address_type", this.selectedTag)
          localStorage.setItem('latitude', this.latitude.toString());
          localStorage.setItem('longitude', this.longitude.toString());
          localStorage.setItem('setlatlongs', this.latitude + ',' + this.longitude);
          localStorage.setItem('setlocation', formattedAddress);
          localStorage.setItem('address_store', '1');
          localStorage.setItem('full_address', formattedAddress);
          localStorage.removeItem('delivery_elements');
          this.address.completeAddress = "";
          this.address.address_type = "";
          const pathName = localStorage.getItem('path_name');

          alert('Address Added Successfully');
          if (pathName) {
            if (pathName == 'home') {
              if ([null, 0, "0", "", "null", "undefined"].includes(localStorage.getItem("location_id"))) {
                this.get();
              } else {
                this.navctrl.navigateRoot(['/home'], {
                  queryParams: { refreshStatus: 1 }
                });
              }
            } else {
              // this.navctrl.navigateRoot([pathName]);
              this.navctrl.back()
            }
          } else {
            if ([null, 0, "0", "", "null", "undefined"].includes(localStorage.getItem("location_id"))) {
              this.get();
            } else {
              this.navctrl.navigateRoot(['/home'], {
                queryParams: { refreshStatus: 1 }
              });
            }
          }
          localStorage.setItem('address_store', '1');

        }, 300);
      } else {
        this.get();
      }
    })
  }



  getDeliveryTime(distanceKm: number) {
    let minTime = 25;
    let maxTime = 30;

    if (distanceKm > 3) {
      const extraKm = distanceKm - 3;
      const extraMinutes = Math.ceil(extraKm) * 3;
      minTime += extraMinutes;
      maxTime += extraMinutes;
    }

    return {
      min: minTime,
      max: maxTime,
      formatted: `${minTime}-${maxTime} min`
    };
  }

  async presentToast(message: string, duration: number = 5000) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'bottom', // 'top', 'middle', 'bottom'
      color: 'danger', // 'primary', 'secondary', 'danger', etc.
    });
    await toast.present();
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }


  async presentLoading(timeout: number = 20000) {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading',
    });

    await loading.present();

    // Auto-dismiss after timeout
    setTimeout(() => {
      loading.dismiss().catch(() => { }); // Safe dismiss in case already dismissed
    }, timeout);

    return loading;
  }

  async gotoservicelist() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Location Not Found',
      message: 'We couldn’t fetch your location. Please select one of our available service locations.',
      buttons: [
        {
          text: 'Go to Services',
          handler: () => {
            this.navctrl.navigateRoot('servicelocation');
          }
        }
      ]
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

}
