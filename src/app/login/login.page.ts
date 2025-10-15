import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  myForm: any;
  otp: boolean = false;
  mobile_number: any;
  confrimotp: any;

  openinput() {
    this.otp = false;
    this.mobile_number = '';
  }

  constructor(private fb: FormBuilder, public route: Router, public alertController: AlertController, public api: ApiService, public navCtrl: NavController, public loadingCtrl: LoadingController, private modalcont: ModalController, private locationAccuracy: LocationAccuracy, private geolocation: Geolocation, public toastController: ToastController) {


  }

  ngOnInit() {
    this.myForm = this.fb.group({
      number: [''],
      otp1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      otp2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      otp3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      otp4: ['', [Validators.required, Validators.pattern('[0-9]')]]
    });


    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            // If request is successful, fetch the current location
            this.getcurrentlocation();
          },
          (error) => {
            // In case of error, still try to fetch the current location
            console.error('Location accuracy request failed:', error);
            this.getcurrentlocation();  // Handle fallback behavior or error handling here
          }
        );
      }
    }, error => {
      console.log("coming2");
      this.getcurrentlocation();
    });
  }

  moveToNext(event: any, nextControlName: string) {
    if (event.target.value.length === 1) {
      const nextControl = this.myForm.get(nextControlName);
      if (nextControl) {
        const element = document.querySelector(`input[formControlName=${nextControlName}]`);
        (element as HTMLElement)?.focus();
      }
    }
  }

  moveBack(event: any, prevControlName: string) {
    if (event.key === 'Backspace' && event.target.value === '') {
      const prevControl = this.myForm.get(prevControlName);
      if (prevControl) {
        const element = document.querySelector(`input[formControlName=${prevControlName}]`);
        (element as HTMLElement)?.focus();
      }
    }
  }

  isOtpFilled(): boolean {
    return this.myForm.valid;
  }

  async request() {
    if (this.myForm.value.number.length != 10) {
      const alert = await this.alertController.create({
        header: 'Please Check Number',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      this.mobile_number = this.myForm.value.number;
      var data = {
        customer_mobile_number: this.myForm.value.number
      }
      const loading = await this.loadingCtrl.create({
        spinner: 'bubbles',
        cssClass: 'custom-loading'
      });
      await loading.present();
      this.api.getuserloginotp(data).subscribe(async (res: any) => {
        console.log(res);

        if (res.status == 200) {
          loading.dismiss();
          this.otp = true;
          this.confrimotp = res.loginotp
        } else {
          loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error Found',
            buttons: ['OK']
          });
          await alert.present();
        }
      }, (error) => {
        loading.dismiss();
      })
    }
  }

  async resend_otp() {
    this.myForm.reset();
    this.myForm.patchValue({
      number: this.mobile_number
    })
    this.myForm.value.number = this.mobile_number;
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'OTP Resend Successfully..!',
      buttons: ['OK']
    });
    await alert.present();
    this.request()
  }

  path: any = ''

  async verify() {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    if (this.myForm.valid) {
      const { otp1, otp2, otp3, otp4 } = this.myForm.value;
      const otpCode = [otp1, otp2, otp3, otp4].join('');
      if (otpCode == this.confrimotp) {
        var data = {
          customer_mobile_number: this.myForm.value.number,
          customer_otp: otpCode
        }
        this.api.customerlogin(data).subscribe(async (res: any) => {
          if (res.status == 200) {
            loading.dismiss();
            const alert = await this.toastController.create({
              mode: 'ios',
              header: 'Login Success',
              duration: 1000 // duration in milliseconds (1 second)
            });
            await alert.present();
            this.otp = false;
            this.myForm.reset();
            localStorage.setItem("vegmodestatus","0")
            localStorage.setItem('usr_id', res.data.customer_id);
            localStorage.setItem('number', res.data.customer_mobile_number);
            localStorage.setItem('name', res.data.customer_name);
            const player_id = localStorage.getItem('player_id');
            if (![null, undefined, '', 0, '0'].includes(player_id)) {
              this.postplayer_id();
            }

            //------------------------------------------------------------------
            this.modalcont.dismiss(null, 'cancel');
            //-----------------------------------------------------------------
            const callback_path = localStorage.getItem('path_name');
            const location_id = localStorage.getItem('location_id');
            const latitude = localStorage.getItem('latitude');
            // this.showLatitudeToast()
            // console.log(location_id);

            if ([null, 'undefined', '', 0, "0"].includes(callback_path)) {
              if ([null, 'undefined', '', 0, "0"].includes(latitude)) {
                this.navCtrl.navigateRoot('allow-location');
              }
              else if ([null, 'undefined', '', 0, "0"].includes(location_id)) {
                this.navCtrl.navigateRoot('servicelocation');                
              } else {
                this.navCtrl.navigateRoot('home');
              }
            } else {
              this.navCtrl.navigateRoot(this.path);
            }

          } else {
            loading.dismiss();
            const alert = await this.alertController.create({
              mode: 'ios',
              header: 'Error',
              buttons: ['OK']
            });
            await alert.present();
          }
        }, (error) => {
          loading.dismiss();
        })
      } else {
        loading.dismiss();
        const alert = await this.alertController.create({
          mode: 'ios',
          header: 'Invalid OTP',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      loading.dismiss();
      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Please Check OTP',
        buttons: ['OK']
      });
      await alert.present();
    }
  }


  async showLatitudeToast() {
    const latitude = localStorage.getItem('latitude');
    const location_id = localStorage.getItem('location_id')

    const toast = await this.toastController.create({
      message: latitude ? `Latitude: ${latitude}` : 'Latitude not found in localStorage',
      duration: 2000,
      color: 'danger'
    });

    await toast.present();
  }

  postplayer_id() {
    var data = {
      usr_id: localStorage.getItem('usr_id'),
      player_id: localStorage.getItem('player_id'),
      user_type: 0,
      user_id: localStorage.getItem('usr_id'),
      location_id: localStorage.getItem("location_id") || 0
    }
    this.api.postplayer_id(data).subscribe(async (res: any) => {
    }, (error) => {

    });
  }


  //-----------------------------------------------------------------

  skipOnboarding() {
    this.navCtrl.navigateForward('location')
  }


  getcurrentlocation() {
    console.log("coming1");

    this.geolocation.getCurrentPosition().then((resp) => {
      this.getlocation(resp.coords.latitude, resp.coords.longitude);
      localStorage.setItem('latitude', resp.coords.latitude.toString() ?? "16.521816");
      localStorage.setItem('longitude', resp.coords.longitude.toString() ?? "80.620072");
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

    this.api.getuserlocation(data).subscribe(async (res: any) => {

      if (res.status == 200) {
        localStorage.setItem('location_id', res.data[0].id);
        localStorage.setItem('location_name', res.data[0].location_name);
        localStorage.setItem('service_location_status', "1");
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status", "0");
      } else if (res.status == 300) {
        localStorage.setItem('service_location_status', "0");
      } else {
        localStorage.setItem('service_location_status', "0");
      }
    }, error => {
    })
  }



  
}