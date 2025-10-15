import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.page.html',
  styleUrls: ['./subscribe.page.scss'],
})
export class SubscribePage implements OnInit {

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/icon/noimg.png'; // Replace with your actual fallback image path
  }

  product: any;
  subscribeitems: any;
  selectedSchedule: any;
  data: any;
  subscription_start_date: string = '';
  minSubscriptionDate: string = '';

today: string = new Date().toISOString().split('T')[0]; // restrict past dates


  constructor(private navCtrl: NavController, private route: ActivatedRoute, public api: ApiService, private alertController: AlertController, private loadingCtrl: LoadingController,private toastController: ToastController) { }

  async ngOnInit() {

     const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.subscription_start_date = tomorrow.toISOString().split('T')[0];
      this.minSubscriptionDate = this.subscription_start_date;
      
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.get_subscription_timeline().subscribe(async (res: any) => {
      if (res.status == 200) {
        loading.dismiss();
        this.subscribeitems = res.data;
        this.selectedSchedule = this.subscribeitems[0].timeline;
      }
    }, (error) => {
      loading.dismiss();
    })
    this.data = localStorage.getItem('subscribecart');
    this.product = JSON.parse(this.data);
    console.log(this.product);
    
  }

  goBack() {
    this.navCtrl.back();
  }

  selectSchedule(schedule: any) {
    this.selectedSchedule = schedule;
  }

  quantity = 1;

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  removeItem() {
  }

  sub_array: any = []

  cartdata: any

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure?',
      mode: 'ios',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('User clicked No');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.orderplaced();
          }
        }
      ]
    });
    await alert.present();
  }

  async orderplaced() {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    var data = {
      customer_id: localStorage.getItem('usr_id'),
      item_name: this.product.item_name,
      item_image: this.product.item_image,
      item_id: this.product.id,
      category_id: localStorage.getItem('category_id'),
      sub_category_id: "1",
      category_name: 'Groceries',
      sub_category_name: "Wash Items",
      actualitem_price: Number(this.product.actual_price),
      item_price: Number(this.product.selling_price),
      sub_item_count: this.product.itemscount,
      item_total_amount: this.product.itemsamount,
      total_saving_amount : this.product.total_saving_amount,
      items_actual_amount : this.product.items_actual_amount,
      filter_name: "tets",
      item_description: this.product.item_description,
      saving_price: this.product.savingitemprice,
      shop_id: '1',
      filter_one: "test",
      subscription_type: this.selectedSchedule,
      subscription_start_date:this.subscription_start_date
    };
    console.log(data);
    

    this.api.subscription_order_placed(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        alert("Subscribe Success");
        console.log(res);
        
        setTimeout(() => {
            this.navCtrl.navigateForward('orders', {
              queryParams: {
                order_cancle_type: 0,
                order_id: res.data.insertId,
                orderindication:0
              }
            });
          }, 100);
        loading.dismiss();
      }
    }, (error) => {
      loading.dismiss();
    })
  }


  increaseQty(product:any) {
    if ((product.itemscount || 0) < (product.soh || 99)) {
      product.itemscount++;
      this.itemcalicualtion(product);
    } else {
      this.presentStockWarning(); // Optional: toast for stock limit
    }
    
  }

  decreaseQty(product:any) {
    if (product.itemscount > 1) {
      product.itemscount--;
    } else {
      product.itemscount = 1;
    }
    this.itemcalicualtion(product);
  }

  itemcalicualtion(product:any){
    product.itemsamount=product.selling_price*product.itemscount;
    product.items_actual_amount=product.actual_price*product.itemscount;
    product.total_saving_amount = product.items_actual_amount - product.itemsamount;
  }

  async presentStockWarning() {
  const toast = await this.toastController.create({
    message: 'Stock limit reached!',
    duration: 1500,
    color: 'warning',
    position: 'bottom'
  });
  await toast.present();
}




}
