import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

interface Complaint {
  description: string;
  image: File | null;
  complaint_image: string | null;
  customer_id: number;
  customer_name: string;
  phone_number: string;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})


export class SupportPage implements OnInit {

  user: any = ''

  supportData = {
    name: '',
    email: '',
    message: ''
  };


  complaint: Complaint = {
    description: '',
    image: null,
    complaint_image: null,
    customer_id: 0,
    customer_name: '',
    phone_number: ''
  };
  number: any;
  constructor(private alertCtrl: AlertController, private api: ApiService, private toastController: ToastController, public loadingCtrl: LoadingController) { }
  ngOnInit(): void {
    var data = { location_id: localStorage.getItem('location_id') }
    this.api.getfranchsiedetails(data).subscribe(async (res: any) => {
      this.number = res.data[0].franchise_mobile_number;
    })
    this.api.application_common_api().subscribe(async (res: any) => {
      if (res.status == 200) {
        this.user = res.data[0];
      }
    })

    this.complaint.customer_id = Number(localStorage.getItem("usr_id")) || 0;
    this.complaint.phone_number = localStorage.getItem("number") || '';
    this.complaint.customer_name = localStorage.getItem("name") || '';

  }

  async submitSupport() {
    if (!this.supportData.name || !this.supportData.email || !this.supportData.message) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please fill in all fields.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Simulate sending support request


    const alert = await this.alertCtrl.create({
      header: 'Success',
      message: 'Your support request has been submitted.',
      buttons: ['OK']
    });
    await alert.present();

    // Clear form
    this.supportData = { name: '', email: '', message: '' };
  }




  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.complaint.image = file;

      // Image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.complaint.complaint_image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async submitComplaint() {
    console.log('Complaint submitted:', this.complaint);

    this.complaint.customer_id = Number(localStorage.getItem("usr_id") || 0);
    this.complaint.phone_number = localStorage.getItem("number") || '';
    this.complaint.customer_name = localStorage.getItem("name") || '';

    const loadingWrapper = await this.presentLoading();

    this.api.public_complaits(this.complaint).subscribe(async (res: any) => {
      await this.presentToast('Complaint submitted successfully! Our team will contact you.', 'success');

      // Reset the form
      this.complaint = {
        description: '',
        image: null,
        complaint_image: null,
        customer_id: Number(localStorage.getItem("usr_id") || 0),
        customer_name: localStorage.getItem("name") || '',
        phone_number: localStorage.getItem("number") || ''
      };

      await loadingWrapper.dismiss();

    }, async (error) => {
      await loadingWrapper.dismiss();
      this.presentToast('Failed to submit complaint. Please try again.', 'danger');
    });
  }



  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color // 'success', 'danger', etc.
    });
    await toast.present();
  }


  async presentLoading(timeout: number = 20000) {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading',
    });

    let isDismissed = false;

    await loading.present();

    const dismiss = async () => {
      if (!isDismissed) {
        isDismissed = true;
        try {
          await loading.dismiss();
        } catch (e) {
          // ignore if already dismissed
        }
      }
    };

    // Auto-dismiss after timeout
    setTimeout(() => dismiss(), timeout);

    return { loading, dismiss };
  }

}
