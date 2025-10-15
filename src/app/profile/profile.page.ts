import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { ActionSheetController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userForm: any = '';

  appVersion: any = '';

  constructor(public api: ApiService, public navctrl: NavController, public alertcontroller: AlertController, public actionsheetCtrl: ActionSheetController, private translate: TranslateService, private loadingCtrl: LoadingController, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      customer_name: [''],
      customer_mobile_number: [''],
      customer_email: [''],
      dob: [''],
      anniversary: [''],
      gender: [''],
      pervious_image: ['']
    });
  }
  ngOnInit() {
    this.get();
  }

  async get() {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getprofile().subscribe(async (res: any) => {      
      if (res.status == 200) {
        loading.dismiss();
        console.log(localStorage.getItem("name"));
        
        let customer_name: any;

        const storedName = localStorage.getItem("name");

        if (!storedName || storedName === "undefined") {
          customer_name = "";
        } else {
          customer_name = storedName;
        }

        
        
        this.userForm = this.fb.group({
          customer_name : res.data?.[0]?.customer_name || customer_name || "",

          customer_mobile_number: res.data[0]?.customer_mobile_number || localStorage.getItem("number") || "",
          customer_email: res.data[0].customer_email,
          dob: res.data[0].customer_dob,
          anniversary: res.data[0].anniversary,
          gender: res.data[0].gender,
          pervious_image: res.data[0].profile_image,
        });
        this.profileImage = res.data[0].profile_image;
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  name: any

  editConstituency() {
    
  }

  navigateTo(page: string) {
    
  }

  deleteAccount() {
    
  }

  async presentLogoutAlert() {
    const alert = await this.alertcontroller.create({
      header: 'Logout',
      mode: 'ios',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            
          },
        },
        {
          text: 'Logout',
          role: 'confirm',
          handler: () => {
            this.logout();
          },
        },
      ],
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
    this.navctrl.navigateForward(['/home']);
  }

  async update_customer_profile() {
    var datae = {
      customer_id: localStorage.getItem('usr_id'),
      customer_name: this.userForm.value.customer_name,
      customer_mobile_number: this.userForm.value.customer_mobile_number,
      customer_email: this.userForm.value.customer_email,
      customer_dob: this.userForm.value.dob,
      anniversary: this.userForm.value.anniversary,
      gender: this.userForm.value.gender,
      iamgeeevnt: this.iamgeeevnt,
      image: this.profileImage,
      pervious_image: this.userForm.value.pervious_image
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.update_customer_profile(datae).subscribe(async (res: any) => {
    
      
      if (res.status == 200) {
        if(res.imageupload){
          localStorage.setItem("profile_image",res.imageupload)
        }
        alert('Successfully Updated');
        this.iamgeeevnt ='0';
        this.get();
        this.navctrl.navigateForward('more');        
      }
      loading.dismiss();
    }, (error) => {
      loading.dismiss();
    })
  }

  async getAppVersion() {
    const info = await App.getInfo();
  
    this.appVersion = info.version; // Retrieve the version number
  }

  async confirmDeleteAccount() {
    const alert = await this.alertcontroller.create({
      header: 'Delete Account',
      mode: 'ios',
      message: 'Are you sure you want to delete your account ? ',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
        },
        {
          text: 'Delete',
          handler: () => this.deleteAccount(),
          cssClass: 'alert-delete',
        }
      ],
      cssClass: 'delete-alert'
    });
    await alert.present();
  }

  iamgeeevnt: any = '0'

  profileImage: string | ArrayBuffer | null = null;

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
        this.iamgeeevnt = 1
      };
      reader.readAsDataURL(file);
    }
  }

}
