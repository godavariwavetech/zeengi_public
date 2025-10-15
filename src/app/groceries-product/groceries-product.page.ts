import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-groceries-product',
  templateUrl: './groceries-product.page.html',
  styleUrls: ['./groceries-product.page.scss'],
})
export class GroceriesProductPage implements OnInit {

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/icon/noimg.png'; // Replace with your actual fallback image path
  }

  searchQuery: string = '';
  selectedImage: string = '';
  product: any
  balance_amount: number = 0;

  data: any
  cartdata: any = []
  cartCount: number = 0;
  merchantData:any=[];

  constructor(private navCtrl: NavController, private route: ActivatedRoute, private api: ApiService, public loadingCtrl: LoadingController,private toastController: ToastController) { }

  ngOnInit() {

    this.data = localStorage.getItem('cartData');
    this.cartdata = [];
    if (this.data) {
      try {
        this.cartdata = JSON.parse(this.data);
        this.cartCount = this.cartdata.length
      } catch (error) {
      }
    }

    this.route.queryParams.subscribe(params => {
      if (params['product_details']) {
        this.product = JSON.parse(params['product_details']);
        
        this.get()
      } 
      if (params['merchantData']) {
        this.merchantData = JSON.parse(params['merchantData']);
        
      }

      
    });
  }

  async get() {
    var dataw = {
      user_id: localStorage.getItem('usr_id')
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.get_user_wallet_amount_details(dataw).subscribe(async (res: any) => {
      if (res.status == 200) {
        loading.dismiss();
        this.balance_amount = res.data[0][0].balance_amount;
      }
    }, (error) => {
      loading.dismiss();
    })

    var maindata = {
      sub_total_category_id: this.product.sub_total_category_id,
      location_id: localStorage.getItem('location_id')
    }
    this.api.get_related_products(maindata).subscribe(async (res: any) => {
      if (res.status == 200) {
        console.log(res.data);
        

        this.relatedProducts = res.data;
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  changeImage(image: string) {
    this.selectedImage = image;
  }

  goBack() {
    this.navCtrl.back();
  }

  openCart() {
    this.navCtrl.navigateForward('basket', {
      queryParams: { pageback: 'groceries' ,pageind: '1',pagebackdata:""}
    });
    localStorage.setItem("callbackdata", JSON.stringify({ pageback: 'groceries',pageind: '1',pagebackdata:"" }))
  }

  relatedProducts: any = [];
  quantity: number = 1;

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(product:any) {
    console.log(product);
    console.log(this.quantity);
    
    if ((this.quantity || 0) >= (product?.soh || 0)) {
      this.presentStockWarning();
      return;
    } else {
      this.quantity++;
    }
    
  }

  gotobuy(id: any) {
    
    // var transformedData = {
    //   id: this.product.id,
    //   item_name: this.product.item_name,
    //   item_image: this.product.item_image,
    //   item_description: this.product.item_description,
    //   selling_price: Number(this.product.selling_price), // Ensure it's a number
    //   itemscount: this.quantity, // Dynamic quantity
    //   itemsamount: this.product.selling_price * this.quantity, // Update total price
    //   savingitemprice: this.product.savingitemprice,
    //   savingsamount: this.product.savingitemprice * this.quantity, // Total savings
    //   actual_price: this.product.mrp_price * this.quantity, // Total actual price
    //   rack_code: this.product.rack_code,
    //   shop_id: this.merchantData.shop_id,
    //   item_gst: this.product.item_gst,
    //   item_gst_amount:this.product.item_gst_amount,

    //   final_more_itmes: "",
    //   extra_finalAmount:0,
    //   total_extra_item_price:0,
    //   org_selling_price:this.product.selling_price,
    //   org_actual_price:this.product.mrp_price,
    //   single_extra_item_price : 0
    // }

    var transformedData = {
      id: this.product.id,
      item_name: this.product.item_name,
      item_image: this.product.item_image,
      item_description: this.product.item_description,
      actual_price: this.product.mrp_price * this.quantity, // Total MRP
      selling_price: Number(this.product.selling_price), // Selling price
      itemscount: this.quantity,
      itemsamount: this.product.selling_price * this.quantity, // Total selling amount
      savingitemprice: this.product.savingitemprice,
      savingsamount: this.product.savingitemprice * this.quantity, // Total savings
      packing_charges: 0, // Default as per cartData
      rack_code: this.product.rack_code,
      filterone: this.product.filter_two || '', // Added field (nullable)
      shop_id: this.merchantData.shop_id,
      item_gst: this.product.item_gst,
      item_gst_amount: this.product.item_gst_amount,
      final_more_itmes: "",
      extra_finalAmount: 0,
      total_extra_item_price: 0,
      org_selling_price: this.product.selling_price,
      org_actual_price: this.product.mrp_price,
      single_extra_item_price: 0,
      prescription_required: this.product.prescription_required || 0, // Default to 0 if undefined
      banner_item_status: 0 // Default as per cartData
    };

    console.log(transformedData);
    
  
    

    localStorage.setItem("category_id",this.product.category_id);
    localStorage.setItem("category_name",this.product.category_name);
    localStorage.setItem("sub_category_id",this.product.sub_category_id);
    localStorage.setItem("sub_category_name",this.product.sub_category_name); 

    if (id === 1) {
      const storedData = localStorage.getItem('cartData');
      this.cartdata = [];

      if (storedData) {
        try {
          this.cartdata = JSON.parse(storedData);
        } catch (error) {
          console.error('Error parsing cartData from localStorage:', error);
        }
      }


      const exists = this.cartdata.some((item: any) => item.id === transformedData.id);
      if (!exists) {
        this.cartdata.push(transformedData);
      }
      console.log(this.cartdata);
      
      localStorage.removeItem('cartData');
      localStorage.removeItem('cart_merchant');
      localStorage.removeItem('main_shopdetails');
      localStorage.removeItem('shopdetails');

      localStorage.setItem("set_delivery_distance_status", "0");
      localStorage.setItem('cart_merchant', JSON.stringify(this.merchantData));
      localStorage.setItem('main_shopdetails', JSON.stringify(this.merchantData));
      localStorage.setItem('shopdetails', JSON.stringify(this.merchantData));
      localStorage.setItem('cartData', JSON.stringify(this.cartdata));
      
      this.navCtrl.navigateForward('basket', {
        queryParams: { pageback: 'groceries' ,pageind: '1',pagebackdata:"" }
      });
      localStorage.setItem("callbackdata", JSON.stringify({ pageback: 'groceries',pageind: '1',pagebackdata:"" }))
    }

  }

  gotosubscribe() {
    if (this.product.selling_price >= Number(this.balance_amount)) {
      alert('Please  Recharge Your Wallet');
    } else {
      console.log(this.product);
      
      var transformedData = {
        id: this.product.id,
        item_name: this.product.item_name,
        item_image: this.product.item_image,
        item_description: this.product.item_description,
        selling_price: Number(this.product.selling_price), // Ensure it's a number
        itemscount: this.quantity, // Dynamic quantity
        itemsamount: this.product.selling_price * this.quantity, // Update total price
        savingitemprice: this.product.savingitemprice,
        savingsamount: this.product.savingitemprice * this.quantity, // Total savings
        actual_price: this.product.mrp_price * this.quantity ,// Total actual price,
        measurement_type : this.product.measurement_type,
        rack_code : this.product.rack_code
      }
      localStorage.setItem('subscribecart', JSON.stringify(transformedData));
      this.navCtrl.navigateForward('subscribe');
    }
  }

  gotonext(product: any) {

  

    this.navCtrl.navigateForward('groceries-product', {
      queryParams: {
        product_details: JSON.stringify(product)
      }
    });
  }


  async presentStockWarning() {
  const toast = await this.toastController.create({
    message: 'This item is currently unavailable in required quantity.',
    duration: 2500,
    position: 'bottom',
    color: 'danger', // You can use 'warning' if you prefer
    buttons: ['OK']
  });
  await toast.present();
}

}


