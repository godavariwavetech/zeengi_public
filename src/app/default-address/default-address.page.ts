import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-default-address',
  templateUrl: './default-address.page.html',
  styleUrls: ['./default-address.page.scss'],
})
export class DefaultAddressPage implements OnInit {

  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  samelatlong: number = 0;
  map!: google.maps.Map;
  latitude: number = parseFloat(localStorage.getItem("latitude") || "0"); // Default to 0 if not found
  longitude: number = parseFloat(localStorage.getItem("longitude") || "0"); // Default to 0 if not found
  searchQuery: string = '';
  initialZoom = 15;
  full_address: any;
  marker!: google.maps.Marker;
  city_name: any;
  short_address: any;
  private debounceTimer: any = null;
  currentaddress: any;

  constructor(public navctrl: NavController, public api: ApiService, public toastController: ToastController, public loadingCtrl: LoadingController, public alertController: AlertController,public router: Router) {
    /// <reference types="google.maps" />

    this.getAddressFromCoordinates(this.latitude, this.longitude);

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
    this.getaddress();
  }

  ngAfterViewInit() {
    this.initializeMap(this.latitude, this.longitude);
  }

  // Add debounce function here
  debounce(func: Function, delay: number) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      func();
    }, delay);
  }

  getAddressFromCoordinates(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);
    localStorage.setItem('setlatlongs', lat + ',' + lng)
    geocoder.geocode({ location: latlng }, (results: any, status: string) => {
      if (status === 'OK' && results[0]) {
        this.currentaddress = results[0].formatted_address;
      } else {
        console.error('Geocoder failed due to:', status);
      }
    });
  }

  initializeMap(latitude: any, longitude: any) {
    // Check if the map element is available
    if (!this.mapElement) {
      console.error('Map element is not available');
      return;
    }
    // Initialize the geocoder to fetch the address from coordinates
    const latlng = new google.maps.LatLng(latitude, longitude);
    const geocoder = new google.maps.Geocoder();
    // Perform geocode operation to get the full address
    geocoder.geocode({ location: latlng }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        this.full_address = results[0].formatted_address;
        this.city_name = results[0].address_components[1].short_name;
        this.short_address = results[0].address_components[2].short_name + "," + results[0].address_components[3].short_name;
        localStorage.setItem('full_address', this.full_address);
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
    // Listen to the map's center change and update the marker position
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
    // Check if currentPos is null or undefined
    if (!currentPos) {
      console.error('Marker position is not available');
      return; // Exit the function if currentPos is not valid
    }
    const targetLat = newCenter.lat();
    const targetLng = newCenter.lng();
    const steps = 1; // Number of animation steps
    const duration = 1000; // Total animation duration (ms)
    const stepDelay = duration / steps; // Delay between each animation step
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
    animateMarker(); // Start the animation
  }

  // Function to update the address from coordinates
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
    const input = document.getElementById('place-input1') as HTMLInputElement;
    const options = {
      types: ['establishment'], // Optional filter
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();

        this.latitude =latitude;
        this.longitude =longitude;

        localStorage.setItem('latitude', latitude.toString() ?? "16.521816");
        localStorage.setItem('longitude', longitude.toString() ?? "80.620072");
        localStorage.setItem('current_latitude', latitude.toString());
        localStorage.setItem('current_longitude', longitude.toString());
        this.gotodeliverylocation();
        // this.initializeMap(latitude, longitude);
        // You can now do something with the place details, e.g., show it on the map or in a list.
      }
    });
  }

  setCurrentPosition2() {
    if ([null, 0, "0", "", "null", "undefined"].includes(localStorage.getItem("current_latitude"))) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.initializeMap(this.latitude, this.longitude)
        }, error => {
          // Handle error if geolocation is not available
        });
      }
    }
    else {
      this.latitude = parseFloat(localStorage.getItem("current_latitude") || "0");
      this.longitude = parseFloat(localStorage.getItem("current_longitude") || "0");
      this.initializeMap(this.latitude, this.longitude);
      // this.initialZoom = 15;
      const latlng = new google.maps.LatLng(this.latitude, this.longitude);
      const geocoder = new google.maps.Geocoder();
    }
  }

  clearSearch() {
    this.searchQuery = '';
  }

  gotodeliverylocation() {
    if ([null, 0, "0", "", "null", "undefined"].includes(this.latitude)) {
      this.navctrl.navigateRoot('/allow-location');
    } else {
      this.navctrl.navigateRoot('/map-location');
    }
    
  }

  address: any = [];
  show: boolean = false;

  async getaddress() {
    var data = {
      customer_id: localStorage.getItem('usr_id')
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.get_customer_delivery_address(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        loading.dismiss();
        this.address = res.data;
        if (this.address.length == 0) {
          this.show = true
        }
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  path: any = '';
  location_id: any;
  dataaddress: any = '';
  location_name: any = '';

  setaddress(data: any) {
    
    this.latitude = data.customer_latitude;
    this.longitude = data.customer_longitude;
    this.getlocationwer(data.customer_latitude, data.customer_longitude);
    localStorage.setItem("address_type", data.address_type)
    localStorage.removeItem('delivery_elements');
    this.dataaddress = data
  };

  async getlocationwer(lat: any, long: any) {
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
      console.log(res);
      
      if (res.status == 200) {
        this.location_id = res.data[0].id;
        this.location_name = res.data[0].location_name;
        this.checkcart(lat, long)
        loading.dismiss()
      } else if (res.status == 300) {
        this.presentToast("Currently we do not service this location. Please choose another location.", 5000, "warning");
        loading.dismiss();
      } else {
        loading.dismiss()
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  data: any = '';
  cartdata: any = [];

  async checkcart(latitude: any, longitude: any) {

    this.data = localStorage.getItem('cartData');
    console.log(this.data);
    
    this.cartdata = [];
    if (this.data) {
      try {
        this.cartdata = JSON.parse(this.data);
      } catch (error) {
        
       };
    }
    if (this.cartdata.length) {
      if (this.location_id != localStorage.getItem('current_location_id')) {
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
              text: 'Clear Cart & Switch 1 ',
              handler: () => {
                localStorage.removeItem('cartData');
                localStorage.removeItem('cart_merchant');
                localStorage.removeItem('main_shopdetails');
                localStorage.removeItem('shopdetails');
                localStorage.setItem("set_delivery_distance_status", "0");
                localStorage.setItem('location_id', this.location_id);
                localStorage.setItem('location_name', this.location_name);
                localStorage.setItem('setlatlongs', this.dataaddress.customer_latitude + ',' + this.dataaddress.customer_longitude);
                localStorage.setItem('setlocation', this.dataaddress.full_address);
                localStorage.setItem('latitude', this.dataaddress.customer_latitude);
                localStorage.setItem('longitude', this.dataaddress.customer_longitude);
                localStorage.removeItem('delivery_elements');
                const pathName = localStorage.getItem('path_name');
                if (pathName) {
                  if (pathName == 'home') {
                    this.navctrl.navigateRoot(['/home'], {
                      queryParams: { refreshStatus: 1 }
                    });
                  } else {
                    this.router.navigate([pathName]);
                  
                  }

                } else {
                  this.navctrl.navigateRoot(['/home'], {
                    queryParams: { refreshStatus: 1 }
                  });
                }
                localStorage.setItem('address_store', '1');
              }
            }
          ]
        });
        await alert.present();
      } else {
        localStorage.setItem('location_id', this.location_id);
        localStorage.setItem('location_name', this.location_name);
        localStorage.setItem('setlatlongs', this.dataaddress.customer_latitude + ',' + this.dataaddress.customer_longitude);
        localStorage.setItem('setlocation', this.dataaddress.full_address);
        localStorage.setItem('latitude', this.dataaddress.customer_latitude);
        localStorage.setItem('longitude', this.dataaddress.customer_longitude);
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status", "0");
        localStorage.setItem('address_store', '1');
        const pathName = localStorage.getItem('path_name');
        // if (Object.keys(restaurantdata).length > 0) {
        //   this.distanceCalculation(restaurantdata, pathName, latitude, longitude);
        // } else {
          if (pathName) {
            if (pathName == 'home') {
              this.navctrl.navigateRoot(['/home'], {
                queryParams: { refreshStatus: 1 }
              });
            } else {
              this.router.navigate([pathName]);
            }
          } else {
            this.navctrl.navigateRoot(['/home'], {
              queryParams: { refreshStatus: 1 }
            });
          }
        // }
      }
    } else {
      localStorage.setItem('location_id', this.location_id);
      localStorage.setItem('location_name', this.location_name);
      localStorage.setItem('setlatlongs', this.dataaddress.customer_latitude + ',' + this.dataaddress.customer_longitude);
      localStorage.setItem('setlocation', this.dataaddress.full_address);
      localStorage.setItem('latitude', this.dataaddress.customer_latitude);
      localStorage.setItem('longitude', this.dataaddress.customer_longitude);
      localStorage.removeItem('delivery_elements');
      localStorage.setItem("set_delivery_distance_status", "0");
      const pathName = localStorage.getItem('path_name');
      localStorage.setItem('address_store', '1');

      if (pathName) {
        if (pathName == 'home') {
          this.navctrl.navigateRoot(['/home'], {
            queryParams: { refreshStatus: 1 }
          });
        } else {
          this.router.navigate([pathName]);
        }
      } else {
        this.navctrl.navigateRoot(['/home'], {
          queryParams: { refreshStatus: 1 }
        });
      }
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
          text: 'Clear Cart & Switch 2',
          handler: () => {
            localStorage.removeItem('cartData');
            localStorage.removeItem('cart_merchant');
            localStorage.removeItem('main_shopdetails');
            localStorage.removeItem('shopdetails');
            localStorage.setItem("set_delivery_distance_status", "0");
            localStorage.setItem('location_id', this.location_id);
            localStorage.setItem('location_name', this.location_name);
            localStorage.setItem('setlatlongs', this.dataaddress.customer_latitude + ',' + this.dataaddress.customer_longitude);
            localStorage.setItem('setlocation', this.dataaddress.full_address);
            localStorage.setItem('latitude', this.dataaddress.customer_latitude);
            localStorage.setItem('longitude', this.dataaddress.customer_longitude);
            localStorage.removeItem('delivery_elements');
            localStorage.setItem("set_delivery_distance_status", "0");
            const pathName = localStorage.getItem('path_name');
            if (pathName) {
              if (pathName == 'home') {
                this.navctrl.navigateRoot(['/home'], {
                  queryParams: { refreshStatus: 1 }
                });
              } else {
                this.router.navigate([pathName]);
              }
            } else {
              this.navctrl.navigateRoot(['/home'], {
                queryParams: { refreshStatus: 1 }
              });
            }
            localStorage.setItem('address_store', '1');
          }
        }
      ]
    });
    await alert.present();
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

  editAddress(address: any) {

    // Implement edit logic here
  }

  async deleteAddress(address: any) {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    var data = {
      customer_id: localStorage.getItem('usr_id'),
      id: address.id
    }
    this.api.delete_customer_address(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        loading.dismiss();
        alert('Successfully Deleted . . !')
        this.getaddress();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  gotoback() {
    this.path = localStorage.getItem('path_name');
    this.navctrl.navigateRoot(this.path)
  }

  usecurrentlocation(latitude: any, longitude: any) {
    //  latitude = "16.511787"; longitude="80.709845";
    this.getlocation(latitude, longitude, localStorage.getItem("current_address"))
  }

  async usecurrentlocation2() {
    const loading = await this.presentLoading(); // Show spinner

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;

          localStorage.setItem("current_latitude", this.latitude.toString());
          localStorage.setItem("current_longitude", this.longitude.toString());

          this.usecurrentlocation(this.latitude, this.longitude);
          loading.dismiss(); // Stop spinner
        },
        (error) => {
          this.usecurrentlocation(localStorage.getItem("current_latitude"), localStorage.getItem("current_longitude")); // fallback
          loading.dismiss(); // Stop spinner
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    } else {
      // this.usecurrentlocation(localStorage.getItem("current_latitude"), localStorage.getItem("current_longitude"));
       loading.dismiss();
          this.navctrl.navigateRoot('/allow-location');
      
     
    }
  }

  async getlocation(lat: any, long: any, address: any) {
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
        this.location_id = res.data[0].id;
        loading.dismiss();
        this.checkcarters(res.data[0], lat, long, address);
        // this.checkcart(lat,long);
      } else if (res.status == 300) {
        loading.dismiss();
        this.get();
      } else {
        loading.dismiss();
        this.get()
      }
    }, (error: any) => {
      loading.dismiss();
    })
  }

  async checkcarters(data: any, lat: any, long: any, address: any) {
    this.data = localStorage.getItem('cartData');
    this.cartdata = [];
    if (this.data) {
      try {
        this.cartdata = JSON.parse(this.data);
      } catch (error) { };
    }
    if (this.cartdata.length) {
      if (this.location_id != localStorage.getItem('current_location_id')) {
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
              text: 'Clear Cart & Switch 3',
              handler: () => {
                localStorage.removeItem('cartData');
                localStorage.removeItem('cart_merchant');
                localStorage.removeItem('main_shopdetails');
                localStorage.removeItem('shopdetails');
                localStorage.setItem("set_delivery_distance_status", "0");
                localStorage.removeItem('delivery_elements');
                localStorage.setItem("set_delivery_distance_status", "0");
                localStorage.setItem('location_id', data.id);
                localStorage.setItem('location_name', data.location_name);
                localStorage.setItem('setlatlongs', lat + ',' + long);
                localStorage.setItem('latitude', lat);
                localStorage.setItem('longtitude', long);
                localStorage.setItem('setlatlongs', lat + ',' + long);
                localStorage.setItem('setlocation', address);
                localStorage.removeItem('delivery_elements');
                localStorage.setItem("set_delivery_distance_status", "0");
                this.path = localStorage.getItem('path_name');
                this.navctrl.navigateRoot(this.path);
                localStorage.setItem('address_store', '1');

              }
            }
          ]
        });
        await alert.present();
      } else {
        localStorage.setItem('location_id', data.id);
        localStorage.setItem('location_name', data.location_name);
        localStorage.setItem('setlatlongs', lat + ',' + long);
        localStorage.setItem('latitude', lat);
        localStorage.setItem('longtitude', long);
        localStorage.setItem('setlocation', address);
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status", "0");
        // this.path = localStorage.getItem('path_name');

        // this.navctrl.navigateRoot(this.path);
        localStorage.setItem('address_store', '1');

        const pathName = localStorage.getItem('path_name');
        const restaurantdata = JSON.parse(localStorage.getItem('main_shopdetails') || '{}');

        // if (Object.keys(restaurantdata).length > 0) {
        //   this.distanceCalculation(restaurantdata, pathName, lat, long);
        // } else {
          if (pathName) {
            if (pathName == 'home') {
                this.navctrl.navigateRoot(['/home'], {
                  queryParams: { refreshStatus: 1 }
                });
              } else {
                this.router.navigate([pathName]);
              }
          } else {
            this.navctrl.navigateRoot(['/home'], {
              queryParams: { refreshStatus: 1 }
            });
          }
          localStorage.setItem('address_store', '1');
        // }

      }
    } else {
      localStorage.setItem('location_id', data.id);
      localStorage.setItem('location_name', data.location_name);
      localStorage.setItem('setlatlongs', lat + ',' + long);
      localStorage.setItem('latitude', lat);
      localStorage.setItem('longtitude', long);
      localStorage.setItem('setlocation', address);
      localStorage.removeItem('delivery_elements');
      // localStorage.setItem("set_delivery_distance_status","0");
      // this.path = localStorage.getItem('path_name');
      // this.navctrl.navigateRoot(this.path);
      // localStorage.setItem('address_store', '1');

      const pathName = localStorage.getItem('path_name');
      
      const restaurantdata = JSON.parse(localStorage.getItem('main_shopdetails') || '{}');
      

      // if (Object.keys(restaurantdata).length > 0) {
      //   this.distanceCalculation(restaurantdata, pathName, lat, long);
      // } else {
        if (pathName) {
          if (pathName == 'home') {
            this.navctrl.navigateRoot(['/home'], {
              queryParams: { refreshStatus: 1 }
            });
          } else {
            this.router.navigate([pathName]);
          }
        } else {
          this.navctrl.navigateRoot(['/home'], {
            queryParams: { refreshStatus: 1 }
          });
        }
        localStorage.setItem('address_store', '1');
      // }

    }
  }

  gotoback2(){
    this.router.navigate(['/basket']);
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
            this.navctrl.navigateRoot('/servicelocation');
            localStorage.removeItem('delivery_elements');
            localStorage.setItem("set_delivery_distance_status", "0");
          }
        }
      ]
    });
    await alert.present();
  }


  async presentToast(message: string, duration: number = 5000,color:any) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom', // 'top', 'middle', 'bottom'
      color: color, // 'primary', 'secondary', 'danger', etc.
    });
    await toast.present();
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
            this.navctrl.navigateRoot('/servicelocation');
          }
        }
      ]
    });
    await alert.present();
  }

}
