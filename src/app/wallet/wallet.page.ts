import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

declare var Razorpay: any; // Declare Razorpay globally
import { Checkout } from "../../../node_modules/capacitor-razorpay";

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  constructor(private navCtrl: NavController, public api: ApiService, private loadingCtrl: LoadingController,public navctrl: NavController,private alertController: AlertController) { 
    this.cartdetails();
  }

  wallets: any;
  wallet_amount: any
  rechargeAmount: number = 0;
  balance_amount: number = 0;
  history: any
  deduction: any;
  cartdata: any = [];cartCount=0;

  async ngOnInit(): Promise<void> {

    this.getwalletdetails();
  }
  async getwalletdetails(){
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.get_wallet_amounts().subscribe(async (res: any) => {
      if (res.status == 200) {
        this.wallets = res.data;
        

        this.wallet_amount = res.data[0].wallet_amount;
        this.rechargeAmount = this.wallet_amount
      }
    }, (error) => {
      loading.dismiss();
    })

    var dataw = {
      user_id: localStorage.getItem('usr_id')
    }
    this.api.get_user_wallet_amount_details(dataw).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.balance_amount = res.data[0][0].balance_amount;
        this.history = res.data[1];
      }
    }, (error) => {
      loading.dismiss();
    })
    var dataer = {
      customer_id: localStorage.getItem('usr_id')
    }
    this.api.getwalletdeduction(dataer).subscribe(async (res: any) => {
      if (res.status == 200) {
        loading.dismiss();
        this.deduction = res.data;
        this.calculateTotalAmount();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  calculateTotalAmount() {
    this.totalAmount = this.deduction.reduce((sum: any, item: any) => (sum * 1) + (item.received_item_amount * 1), 0);
  }
  totalAmount: number = 0

  goBack() {
    this.navCtrl.back();
  }

  selectamount(amount: any) {
    this.wallet_amount = amount;
    this.rechargeAmount = this.wallet_amount;
    this.amountError = false;
  }

  amountError: boolean = false;

  validateAmount() {
    this.amountError = this.rechargeAmount < 100;
  }

  orderId: any

  async rechargenow() {
    if (this.rechargeAmount < 100) {
    } else {
      const loading = await this.loadingCtrl.create({
        spinner: 'bubbles',
        cssClass: 'custom-loading'
      });
      await loading.present();
      var data = {
        order_amount: this.rechargeAmount * 100
      }
      this.api.generateorderid(data).subscribe(async (res: any) => {
        loading.dismiss();
        this.submit(res.orderId);
        this.openrazorpay(res.orderId.id,res.payment_key_id);
      }, (error) => {
        loading.dismiss();
      })
    }
  }


  async openrazorpay(order_id: any,payment_key_id:any) {
    const options = {
      description: `Payment for Order #${order_id}`,
      image: "https://control.freshozapcart.com/uploaded_images/icon.png",
      currency: 'INR',
      key: payment_key_id,
      order_id: order_id,
      amount: (this.rechargeAmount * 100).toString(), // 🔧 converted to string
      name: localStorage.getItem('name') || 'Fresho Zapcart',
      prefill: {
        name: localStorage.getItem('name') || '',
        email: '', // Consider removing if empty
        contact: localStorage.getItem('number') || '',
      },
      theme: {
        color: '#20b767',
      },
      modal: {
        ondismiss: () => {
          alert('dismissed');
        },
        onsuccess: () => {
          alert('successCallback');
        },
        fullscreen: true,
      },
      // options: {
      //   checkout: {
      //     method: {
      //       netbanking: "1",
      //       card: "1",
      //       upi: "0",
      //       wallet: "0"
      //     }
      //   }
      // }
    };
  
    
    try {
      const data = await Checkout.open(options);
      console.log(data);
      this.upadtepaymentdata(data.response);
      console.log(JSON.stringify(data));
    } catch (error) {
      console.log('Razorpay Checkout Error:', error);
    }
  }

  payWithRazorpay(orderId: string) {
    return new Promise((resolve, reject) => {
      if (!this.rechargeAmount || this.rechargeAmount < 100) {
        alert("Recharge amount must be at least 100 INR.");
        return reject("Invalid amount");
      }
      const options = {
        name: 'Fresho Zapcart',
        description: `Payment for Order #${orderId}`,
        order_id: orderId, // Include order ID from your server
        handler: (response: any) => {
          this.upadtepaymentdata(response)
          resolve(response);
        },
        prefill: {
          name: '',
          email: '', // Consider removing if empty
          contact: localStorage.getItem('number') || '',
        },
        theme: {
          color: '#20b767'
        },
        modal: {
          escape: false
        }
      };
      try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          console.error('Payment failed:', response);
          alert('Payment failed. Please try again.');
          reject(response);
        });
        rzp.on('modal.close', () => {
          console.warn('Payment cancelled by user.');
          alert('Payment cancelled by user.');
          reject('Payment cancelled');
        });
        rzp.open();
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        reject(error);
      }
    });
  }

  submit(response: any) {
    var data = {
      user_id: localStorage.getItem('usr_id'),
      razorpay_order_id: response.id,
      payment_amount: this.rechargeAmount
    }
    // var data = {
    //   user_id: localStorage.getItem('usr_id'),
    //   razorpay_order_id: 'testid',
    //   payment_amount: this.rechargeAmount
    // }
    console.log(data);
    
    this.api.user_wallet_payment(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        
      }
    })
  }

  upadtepaymentdata(response: any) {
    var data = {
      user_id: localStorage.getItem('usr_id'),
      location_id: localStorage.getItem('location_id'),
      payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      payment_amount: this.rechargeAmount
    }
    this.api.update_user_wallet_payment(data).subscribe(async (res: any) => {
      if (res.status == 200) {
         this.getwalletdetails();
        alert('Success');
      }
    })

  }


  show_id: any = '3';

  open(id: any) {
    this.show_id = id;
  }

gotopage(page: any) {
    if (page == 'wallet' || page == 'orders') {
      if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
        this.presentLoginAlert()
      } else {
        this.navctrl.navigateForward(page);
      }
    } else {
      this.navctrl.navigateForward(page);
    }
  }

   async presentLoginAlert() {
    const alert = await this.alertController.create({
      header: 'Login Required',
      message: 'Please log in to continue.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Login',
          handler: () => {
            localStorage.setItem('path_name', 'home')
            this.navctrl.navigateForward('login');
          },
        },
      ],
    });
    await alert.present();
  }


    cartdetails(){
    this.cartdata = [];
    const cartdata = localStorage.getItem('cartData');
    console.log(cartdata);
    this.cartCount=0;
    if (cartdata) {
     
      try {
        this.cartdata = JSON.parse(cartdata);
        console.log(this.cartdata);
        this.cartdata.forEach((obj: any) => {
            this.cartCount += obj.itemscount;
        });
        
        // this.cartCount = this.cartdata.length;

      } catch (error) {
      }
    }
  }

}
