import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  detailsForm: FormGroup;
  latitude: any;
  longitude: any;

  constructor(private fb: FormBuilder, public navCtrl: NavController, public api: ApiService, public alertController: AlertController, public platform: Platform) {
    this.detailsForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: [localStorage.getItem('number'), Validators.required],
      age: ['', Validators.required],
      fatherName: ['', Validators.required],
      location: ['', Validators.required],
      constituency: ['', Validators.required],
      mandalam: ['', Validators.required],
      village: ['', Validators.required],
    });
    this.getaddress();
  }

  constituency: any;
  mandals: any;
  villages: any;

  ngOnInit() {

    this.api.masterdata().subscribe(async (res: any) => {
      this.constituency = res.data[0];
      this.mandals = res.data[1];
      this.villages = res.data[2];
    });

  }

  onSubmit() {
    if (this.detailsForm.valid) {
      this.api.publicregister(this.detailsForm.value).subscribe(async (res: any) => {

        if (res.status == 200) {
          const alert = await this.alertController.create({
            mode: 'ios',
            header: 'Data Submit Successfully',
            buttons: ['OK']
          });
          await alert.present();
          localStorage.setItem('usr_id', res.data[0].id);
          localStorage.setItem('name', res.data[0].name);
          localStorage.setItem('number', res.data[0].number);
          localStorage.setItem('village', res.data[0].village_id);
          localStorage.setItem('mandal', res.data[0].mandal_id);
          localStorage.setItem('constituency', res.data[0].constituency_id);
          this.navCtrl.navigateRoot('/news');
        }
      })
    } else {
      alert('Please fill the Empty details')
    }
  }

  getaddress() {
    this.latitude = localStorage.getItem('latitude');
    this.longitude = localStorage.getItem('longitude');
    this.getAddressFromCoordinates(this.latitude, this.longitude, (address: string | null) => {
      if (address) {
        this.detailsForm.patchValue({
          location: address
        })
      } else {
      }
    });
  }

  getAddressFromCoordinates(latitude: number, longitude: number, callback: (address: string | null) => void): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const address: string = data.display_name;
        callback(address);
      })
      .catch(error => {
        console.error('Error fetching address:', error);
        callback(null);
      });
  }

  filteredmandal: any = [];
  filteredvillages: any = [];

  onConstituencyChange(event: any) {
    this.filteredmandal = this.mandals.filter((item: any) => item.constituency_id === event.target.value);
  }

  onMandalsChange(event: any) {
    this.filteredvillages = this.villages.filter((item: any) => item.mandal_id === event.target.value);
  }

  hotom(id: any) {
    if (id == 2) {
      if (this.filteredmandal.length == 0) {
        alert('Please Select the Constituency')
      }
    } else {
      if (this.filteredvillages.length == 0) {
        alert('Please Select the Mandals')
      }
    }
  }

 

}
