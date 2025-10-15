import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { AnimationController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})

export class OrdersPage implements OnInit {

  filterorder = "Past Orders";
  ongoindorderls: any = [];
  deliveredorders: any = [];
  subscripitioinorders: any = [];
  ongoingorderlength = 1;
  deliveredorderlength = 1; order_cancle_type = 0; cancle_order_id = 0;
  counter: number = 60;
  intervalId: any;
  cartCount: any = 0; cartdata: any = []; orderindication = 0;
  constructor(public navCtrl: NavController, public api: ApiService, private loadingCtrl: LoadingController, public animationCtrl: AnimationController, private alertController: AlertController, private route: ActivatedRoute) {
    // order_cancle_type
  }

  async ngOnInit() {
    const data = localStorage.getItem('cartData');
    this.cartdata = data ? JSON.parse(data) : [];

    this.cartCount = this.cartdata.reduce((total: number, item: any) => {
      return total + (item.itemscount || 0);
    }, 0);

    this.route.queryParams.subscribe(params => {
      this.order_cancle_type = params['order_cancle_type'];
      this.cancle_order_id = params['order_id'];
      if (this.order_cancle_type == 0) {
        this.startCountdown();
      }
      if (params['orderindication']) {
        this.orderindication = params['orderindication'];
        this.filterorder = "InProcess"
      }
    });
    this.get();
  }

  startCountdown() {
    this.counter = 60;
    this.intervalId = setInterval(() => {
      if (this.counter > 0) {
        this.counter--;
      } else {
        clearInterval(this.intervalId);
        // Optionally disable cancel button or update status
      }
    }, 1000);
  }

  handleRefresh(event: any) {
    this.get();
    setTimeout(() => {
      event.target.complete(); // Stop the refresher animation
    }, 2000); // Simulate a delay
  }

  async get() {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    var datae = {
      customer_id: localStorage.getItem('usr_id'),
      order_id: 0
    }
    this.ongoindorderls = [];
    this.deliveredorders = [];
    this.api.getorderlistdata(datae).subscribe((res: any) => {
      if (res.status == 200) {
        var result = [];
        result.push(res);
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].order_status == 0 || res.data[i].order_status == 1 || res.data[i].order_status == 2 || res.data[i].order_status == 7 || res.data[i].order_status == 8) {
            this.ongoindorderls.push(res.data[i]);
          } else {
            this.deliveredorders.push(res.data[i]);
          }
        }
        this.ongoingorderlength = this.ongoindorderls.length;
        this.deliveredorderlength = this.deliveredorders.length;
        loading.dismiss();
      }
    }, (error) => {
      loading.dismiss();
    })

    var data = {
      customer_id: localStorage.getItem('usr_id')
    }
    this.api.getsubscripitioin_orders(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.subscripitioinorders = res.data;
        loading.dismiss();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  getfilteroderlist(filterorder: any) {
    this.filterorder = filterorder;
  }

  gotoorderdetails(orderdata: any) {
    console.log(orderdata);

    this.navCtrl.navigateForward('ordertracking', {
      queryParams: {
        'orderdata': JSON.stringify(orderdata)
      }
    })
  }

  gotohomepage() {
    this.navCtrl.navigateRoot('/home');
  }

  gotoback() {
    this.navCtrl.navigateRoot('/home');
  }

  gotoSubscribe(data: any) {
    this.navCtrl.navigateForward('sub-subscribe', {
      queryParams: {
        subscribe_details: JSON.stringify(data)
      }
    })
  }

  async cancelOrder(order: any) {
    // event.stopPropagation(); // Prevents card click from triggering
    const alert = await this.alertController.create({
      header: 'Cancel Order',
      mode: 'ios',
      message: `Are you sure you want to cancel Order #${order.order_id} ?  `,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes, Cancel',
          handler: () => {
            this.performCancelOrder(order);
          }
        }
      ]
    });
    await alert.present();
  }

  performCancelOrder(order: any) {

    var data = {
      order_id: order.id,
    }
    this.api.cancleorder(data).subscribe((res: any) => {
      if (res.status == 200) {
        alert('SuccessFully Cancelled');
        this.get();
      } else if (res.status == 300) {
        alert('Sorry, the order is in progress');
        this.get();
      }
    }, (error) => {
      // loading.dismiss();
    })
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Placed';
      case 1: return 'Accepted';
      case 2: return 'Pickup Delivery Boy';
      case 3: return 'Delivered';
      case 4: return 'Cancelled';
      case 5: return 'Rejected';
      case 6: return 'Not Received';
      default: return 'Unknown';
    }
  }



  rateOrder(order: any) {

    // open rate modal / navigate to rating page
  }

  reorder(order: any) {

    // implement reorder logic
  }

}
