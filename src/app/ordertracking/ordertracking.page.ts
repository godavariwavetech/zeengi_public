import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ordertracking',
  templateUrl: './ordertracking.page.html',
  styleUrls: ['./ordertracking.page.scss'],
})
export class OrdertrackingPage implements OnInit {

  orderdata: any = []
  deliveryboyarr: any;
  orderitemdata: any
  orderdetailslength: number = 0;
  ordercancelstatus = 1;
  mainorderdata: any
  deliverycommand: any
  deliveryrating: any;

  constructor(private navctrl: NavController, private route: ActivatedRoute, public api: ApiService, public loadingCtrl: LoadingController, public alertController: AlertController) { }

  gotoback() {
    // this.navctrl.navigateRoot('/home');
    this.navctrl.back();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['orderdata']) {
        this.mainorderdata = JSON.parse(params['orderdata']);
        this.maindata(this.mainorderdata.id);
        this.get();
      }
      var data = {
        shop_id: this.mainorderdata.shop_id
      }
      this.api.getfranshichedetails(data).subscribe((res: any) => {
        if (res.status == 200) {
          this.customer_number = res.data[0].franchise_mobile_number
        }
      })
    })

    setInterval(() => {
      var data = {
        customer_id: localStorage.getItem('usr_id'),
        order_id: this.mainorderdata.id
      }
      this.api.getorderlistdata(data).subscribe((res: any) => {
        if (res.status == 200) {
          this.mainorderdata = [];
          this.orderitemdata = this.mainorderdata;
          this.orderdetailslength = this.mainorderdata.length;
          this.mainorderdata = res.data[0];
          this.diffamount = (res.data[0].grand_total * 1) -
            ((res.data[0].actual_total_amount * 1) - (res.data[0].total_saving_amount * 1) + (res.data[0].delivery_charges * 1) +
              (res.data[0].coupon_amount * 1));
        }
      })
    }, 2000);
  }

  diffamount: any = 0;

  customer_number: any

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/icon/noimg.png';
  }

  handleRefresh(event: any) {
    this.get();
    this.maindata(this.mainorderdata.id)
    setTimeout(() => {
      event.target.complete(); 
    }, 2000);
  }

  async maindata(id: any) {
    var data = {
      customer_id: localStorage.getItem('usr_id'),
      order_id: id
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getorderlistdata(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.mainorderdata = [];
        this.orderitemdata = this.mainorderdata;
        this.orderdetailslength = this.mainorderdata.length;
        this.mainorderdata = res.data[0];
        try {
          this.deliveryboyarr = JSON.parse(this.mainorderdata.delivery_boy_array);
        } catch (error) {
          console.error("Failed to parse delivery boy array:", error);
          this.deliveryboyarr = [];
        }
        loading.dismiss();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  orderitemdetails: any = []

  async get() {
    var data = {
      order_id: this.mainorderdata.id
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getorderdetails(data).subscribe((res: any) => {
      if (res.status == 200) {
        loading.dismiss();
        this.orderitemdetails = res.data;
        if (this.orderdata.order_status == 0) {
          this.ordercancelstatus = 0;
        } else {
          this.ordercancelstatus = 1;
        }
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  getTotal(): number {
    return Number(this.mainorderdata?.grand_total) + Number(this.mainorderdata?.total_saving_amount);
  }

  gotohome() {
    this.navctrl.back()
  }

  adddeliverycommand(test: any, test1: any, test3: any) { }


  cancelorder() { }

  productcommand: string = '';
  productrating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];

  setRating(rating: number) {
    this.productrating = rating;
  }

  addproductcommand(comment: string, rating: number) {
    var data = {
      usr_id: localStorage.getItem('usr_id'),
      order_id: this.mainorderdata.id,
      shop_id: this.mainorderdata.shop_id,
      comment: comment,
      rating: rating
    }
    this.api.postorderrating(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.productcommand = '';
        this.productrating = 0;
        alert("Thank You For Review . . !");
      }
    }, (error) => {
    })
  }

  data: any = [];

  async reorder() {
    if (JSON.parse(localStorage.getItem("cartData") ?? '[]').length) {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: '⚠️ Switch Merchant?',
        message: 'You already have items in your cart from another merchant. To add items from this merchant, your current cart will be cleared. Do you want to continue?',
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
              localStorage.removeItem('delivery_elements');
              const pathName = localStorage.getItem('path_name');
              if (pathName) {
                this.navctrl.navigateRoot(pathName);
              } else {
                this.navctrl.navigateRoot('/home');
              }
              localStorage.setItem('address_store', '1');
              this.gettomainrestaurant();
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.gettomainrestaurant();
    }
  }


  gettomainrestaurant() {
    const shopdata = {
      shop_latitude: localStorage.getItem("latitude"),
      shop_longitude: localStorage.getItem("longitude"),
      location_id: localStorage.getItem("location_id"),
      shop_id: this.mainorderdata.shop_id,
      veg_mode: localStorage.getItem("vegmodestatus")
    }
    this.api.getsingleshopdetails(shopdata).subscribe(async (res: any) => {
      console.log(res.data);

      if (res.data.length > 0) {

        const matchedShop = res.data[0];

        if (matchedShop) {
          console.log('Shop found:', matchedShop);

          if (matchedShop.shop_active_status == 0) {
            const result = this.orderitemdetails.map((item: any) => ({
              item_id: item.item_id,
              sub_item_count: item.sub_item_count,
              category_id: item.category_id,
              sub_category_id: item.sub_category_id || item[" "] || null // fallback if key missing
            }));
            console.log(result);
            localStorage.setItem('reorder_status', '1');
            localStorage.setItem('reorder_items', JSON.stringify(result));

            //---------------------------------------------------------------
            localStorage.setItem('shop_id', this.mainorderdata.shop_id);
            localStorage.setItem('shopdetails', JSON.stringify(matchedShop));
            this.navctrl.navigateForward('main-resturant', {
              queryParams: {
                data: JSON.stringify(matchedShop)
              }
            });
            //---------------------------------------------------------------
          } else {
            alert("Sorry, we are not delivering this order at the moment");
          }
        } else {
          alert(this.mainorderdata.shop_name + ' Sorry, we are not delivering this order at the moment');
        }

      } else {
        alert("Sorry, we are not delivering this order at the moment");
      }

    })
  }


  // gettomainrestaurant() {
  //   this.data = localStorage.getItem('restaurant_avalibility');
  //   var datwe = JSON.parse(this.data);
  //   // console.log("+++++++++++++++++++", datwe, this.mainorderdata.shop_id);
  //   console.log(this.mainorderdata);
  //   console.log(datwe);


  //   const matchedShop = datwe.find((shop: any) => shop.shop_id == this.mainorderdata.shop_id);
  //   if (matchedShop) {
  //     console.log('Shop found:', matchedShop);

  //     if (matchedShop.shop_active_status == 0) {
  //       const result = this.orderitemdetails.map((item: any) => ({
  //         item_id: item.item_id,
  //         sub_item_count: item.sub_item_count,
  //         category_id: item.category_id,
  //         sub_category_id: item.sub_category_id || item[" "] || null // fallback if key missing
  //       }));
  //       console.log(result);
  //       localStorage.setItem('reorder_status', '1');
  //       localStorage.setItem('reorder_items', JSON.stringify(result));

  //       //---------------------------------------------------------------
  //       localStorage.setItem('shop_id', this.mainorderdata.shop_id);
  //       localStorage.setItem('shopdetails', JSON.stringify(matchedShop));
  //       this.navctrl.navigateForward('main-resturant', {
  //         queryParams: {
  //           data: JSON.stringify(matchedShop)
  //         }
  //       });
  //       //---------------------------------------------------------------
  //     } else {
  //       alert("Sorry, we are not delivering this order at the moment");
  //     }
  //   } else {
  //     alert(this.mainorderdata.shop_name + ' Sorry, we are not delivering this order at the moment');
  //   }
  // }

}
