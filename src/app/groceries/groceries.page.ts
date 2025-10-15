import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import Swiper from 'swiper';
import { ApiService } from '../service/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-groceries',
  templateUrl: './groceries.page.html',
  styleUrls: ['./groceries.page.scss'],
})
export class GroceriesPage implements OnInit {
  canDismiss = true; 

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://control.freshozapcart.com/uploaded_images/others/grocery.jpg'; // Replace with your actual fallback image path
  }

  //-----------------------------------   slides ----------------------------------------------------

  swiperConfig = {
    autoplay: {
      delay: 1000, // Time in milliseconds between slides
      disableOnInteraction: false // Keep autoplay after user interaction
    },
    loop: true // Enable looping of slides
  };

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  // react to events from swiper and segment
  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  swiperSlideChanged(e: any) {
    const index = e.target.swiper.activeIndex
  }

  _segmentSelected(index: number) {
    this.swiper?.slideTo(index)
  }

  //-----------------------------------   Slides --------------------------------------------------
  categoryArray: any = []
  subCategoryArray: any = []
  subTotalCategoryArray: any = []
  filteredProducts: any = []
  searchQuery: string = '';merchantData:any;

  constructor(private navCtrl: NavController, private api: ApiService, private loadingCtrl: LoadingController,private route: ActivatedRoute,private alertController: AlertController,private toastController: ToastController) {
    this.api.getgrocery_sub_total_categories().subscribe(async (res: any) => {
      if (res.status == 200) {
        this.categoryArray = res.categoryArray;
        this.category_id = res.categoryArray[0].category_id;
        this.subCategoryArray = res.subCategoryArray;
        this.subTotalCategoryArray = res.subTotalCategoryArray;
        this.filteredsubCategoryArray = this.subCategoryArray;
        this.filteredsubtotalCategoryArray = this.subTotalCategoryArray;
        
      }
    })
    
  }

 async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['merchant_data']) {
        this.merchantData = JSON.parse(params['merchant_data']);
        console.log(this.merchantData);
        this.getproducts(this.merchantData.shop_id);
      } else {
        this.gotoservicelist();
      }
    },error=>{
      this.gotoservicelist();
    });

    this.data = localStorage.getItem('cartData');
    
    this.cartData = [];
    
    // if (this.data) {
      try {
        this.cartData = JSON.parse(this.data);
        
        this.totalItems = this.cartData.length
      } catch (error) {
        this.cartData = [];
        this.totalItems = 0
      }
    // }
  }


   async gotoservicelist() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Something Went Wrong',
      message: 'Unable to fetch the data. Please try again.',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.navCtrl.navigateForward(['/home'], {
              queryParams: { refreshStatus: 1 }
            });
          }
        }
      ]
    });
    await alert.present();

  }

  goBack() {
    this.navCtrl.navigateForward(['/home'], {
      queryParams: { refreshStatus: 1 }
    });
  }

  openCart() {
    this.navCtrl.navigateForward('basket', {
      queryParams: { pageback: 'groceries' ,pageind: '1',pagebackdata:"" }
    });
    localStorage.setItem("callbackdata", JSON.stringify({ pageback: 'groceries',pageind: '1',pagebackdata:"" }))
  }

  selectedCategory: number = 0;
  filteredsubCategoryArray: any = [];
  filteredsubtotalCategoryArray: any = [];

  selectCategory(category: any,shop_id:any) {
    this.category_id = category.category_id
    this.selectedCategory = category.category_id;
    this.filteredsubCategoryArray = this.subCategoryArray.filter((p: any) => p.category_id === category.category_id);
    this.getproducts(shop_id);
  }

  selectsubCategory(category: any,shop_id:any) {
    this.sub_category_id = category.sub_category_id
    this.filteredsubtotalCategoryArray = this.subTotalCategoryArray.filter((p: any) => p.sub_category_id === category.sub_category_id);
    this.category_id = 0;
    this.getproducts(shop_id);
  }

  selecttotalsubCategory(category: any,shop_id:any) {
    this.sub_total_category_id = category.sub_total_category_id;
    this.sub_category_id = 0;
    this.getproducts(shop_id);
  }

  addToCart(product: any) {
  }

  sortByPopularity() {
  }

  openFilter() {
  }

  data: any
  cartdata: any = []
  totalItems: number = 0;

  

  gotonext(product: any) {   
    
    this.navCtrl.navigateForward('groceries-product', {
      queryParams: {
        product_details: JSON.stringify(product), "merchantData":JSON.stringify(this.merchantData)
      }
    });
  }

  category_id: any = 0;
  sub_category_id: any = 0;
  sub_total_category_id: any = 0;
  masterproducts: any = [];

  async getproducts(shop_id:any) {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.masterproducts = [];
    this.filteredProducts = [];
    var data = {
      category_id: this.category_id,
      sub_category_id: this.sub_category_id,
      sub_total_category_id: this.sub_total_category_id,
      shop_id: shop_id
    }
    this.api.getgroucery_category_items_list(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        res.data = res.data.map((item: any) => ({
          ...item,
          actual_price:item.mrp_price,
          item_description: item.category_name,
          itemscount: 0,
          itemsamount: 0,
          item_gst_amount:0,
          savingitemprice: (item.mrp_price * 1) - (item.selling_price * 1),
          savingsamount: 0,
          packing_charges: this.merchantData.packing_charges,
          random_rating: (Math.random() * (4.5 - 3.5) + 3.5).toFixed(1),
          item_count: 1,
          // item_wishlist_ind: !!matchedWishlist,
          extra_finalAmount:0,
          total_extra_item_price:0,single_extra_item_price:0,
          org_selling_price:item.selling_price,
          org_actual_price:item.selling_price,
          // wishlist_id: matchedWishlist?.id || 0
        }));
        this.masterproducts = res.data;
        this.filteredProducts = res.data;
        loading.dismiss();
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  grandTotal = 0; // Initialize grand total
  cartData: any = []; // Initialize cart array

  async additem(itemId: any, item_count: any,soh:any) {
    if (this.cartData.length == 0) {
      this.cartfunctionality(itemId, item_count,soh);

    } else if (this.cartData[0].shop_id == this.merchantData.shop_id) {
      this.cartfunctionality(itemId, item_count,soh);
    } else {
      this.removecartalert();
    }
  }


  cartfunctionality(itemId: any, item_count: number,soh:any) {
  

    localStorage.setItem('main_shopdetails', JSON.stringify(this.merchantData));
    
    for (let item of this.filteredProducts) {
        
        if (item.id == itemId) {
          console.log(item.itemscount);
          console.log(soh);
          
          if ((item?.itemscount || 0) >= (item?.soh || 0)) {
            this.presentStockWarning();
            return;
          } else {
            localStorage.setItem("category_id", item.category_id);
            localStorage.setItem("category_name", item.category_name);
            localStorage.setItem("sub_category_id", item.sub_category_id);
            localStorage.setItem("sub_category_name", item.sub_category_name);
            item.itemscount = item.itemscount + item_count;
            item.total_extra_item_price = item.total_extra_item_price * item.itemscount;
            item.itemsamount = item.itemscount * ((parseFloat(item.selling_price) + parseFloat(item.single_extra_item_price)));

            item.item_gst_amount = (item.item_gst * item.itemsamount) / 100;
            item.savingsamount = item.itemscount * parseFloat(item.savingitemprice);
            // Update grand total
            this.grandTotal += parseFloat(item.selling_price);
            // Check if item is already in cartData;
            
            let cartItem = this.cartData.find((cartItem: any) => cartItem.id == itemId);
            if (cartItem) {
              cartItem.itemscount = item.itemscount;
              cartItem.itemsamount = item.itemsamount;
              cartItem.item_gst_amount = item.item_gst_amount;
              cartItem.savingitemprice = item.savingitemprice;
              cartItem.savingsamount = item.savingsamount;
            } else {

              this.cartData.push({
                id: item.id,
                item_name: item.item_name,
                item_image: item.item_image,
                item_description: item.item_description,
                actual_price: item.mrp_price,
                selling_price: item.selling_price,
                itemscount: item.itemscount,
                itemsamount: item.itemsamount,
                savingitemprice: item.savingitemprice,
                savingsamount: item.savingsamount,
                packing_charges: 0,
                rack_code: item.rack_code,
                filterone: item.filter_two,  
                shop_id: this.merchantData.shop_id,
                item_gst: item.item_gst,
                item_gst_amount:item.item_gst_amount,
                final_more_itmes: "",
                extra_finalAmount:0,
                total_extra_item_price:0,
                org_selling_price: item.selling_price,
                org_actual_price: item.actual_price,
                single_extra_item_price: item.single_extra_item_price,
                prescription_required: item.prescription_required,
                banner_item_status: 0         
              });            
            }
            this.getCartSummary(); // Display cart summary
            return;
          }
          
        }
      
    }
    localStorage.removeItem('delivery_elements');
    // localStorage.setItem("set_delivery_distance_status", "0");
  }

//   additem(itemId: any) {
    
//     if(this.cartData.length==0){
//       this.cartfunctionality(itemId);
//     } 
//     else if(this.cartData[0].shop_id==this.merchantData.shop_id){
//       this.cartfunctionality(itemId);
//     } 
//     else {
//       this.removecartalert()
// ;      
//     }
    
    
//   }

  // cartfunctionality(itemId:any,item_count:any){
    
  //   for (let item of this.filteredProducts) {
  //     if (item.id === itemId) {
  //       console.log(item);
        
  //       item.itemscount += 1;
  //       item.itemsamount = item.itemscount * parseFloat(item.selling_price);
  //       item.item_gst_amount= (item.item_gst*item.itemsamount)/100,
  //       item.savingsamount = item.itemscount * parseFloat(item.savingitemprice);
  //       // Update grand total
  //       this.grandTotal += parseFloat(item.selling_price);

  //       localStorage.setItem("category_id",item.category_id);
  //       localStorage.setItem("category_name",item.category_name);
  //       localStorage.setItem("sub_category_id",item.sub_category_id);
  //       localStorage.setItem("sub_category_name",item.sub_category_name);

  //       // Check if item is already in cartData
  //       let cartItem = this.cartData.find((cartItem: any) => cartItem.id === itemId);
  //       if (cartItem) {
  //         cartItem.actual_price = item.mrp_price;
  //         cartItem.itemscount = item.itemscount;
  //         cartItem.itemsamount = item.itemsamount;
  //         cartItem.item_gst_amount= (item.item_gst*item.itemsamount)/100,
  //         cartItem.savingitemprice = item.savingitemprice;
  //         cartItem.savingsamount = item.savingsamount;
  //       } else {
  //         // Push a new item to cartData
  //         console.log(item.mrp_price);
          
  //         this.cartData.push({
  //           id: item.id,
  //           item_name: item.item_name,
  //           item_image: item.item_image,
  //           item_description: item.item_description,
  //           actual_price: item.mrp_price,
  //           selling_price: item.selling_price,
  //           itemscount: item.itemscount,
  //           itemsamount: item.itemsamount,
  //           rack_code: item.rack_code,
  //           savingitemprice: item.savingitemprice,
  //           savingsamount: item.savingsamount,
  //           shop_id: this.merchantData.shop_id,
  //           item_gst: item.item_gst,
  //           item_gst_amount:item.item_gst_amount,
  //           final_more_itmes: "",
  //           extra_finalAmount:0,
  //           total_extra_item_price:0,
  //           org_selling_price:item.selling_price,
  //           org_actual_price:item.mrp_price,
  //           single_extra_item_price : 0            
  //         });
          
  //       }
       
  //       this.getCartSummary(); // Display cart summary
  //       return;
  //     }
  //   }
  //   localStorage.removeItem('delivery_elements');
  //   localStorage.setItem("set_delivery_distance_status","0");
  // }

  removeitem(itemId: any) {
    for (let item of this.filteredProducts) {
      if (item.id === itemId) {
        if (item.itemscount > 0) {
          item.itemscount -= 1;
          item.itemsamount = item.itemscount * parseFloat(item.selling_price);
          item.item_gst_amount= (item.item_gst*item.itemsamount)/100;
          this.grandTotal -= parseFloat(item.selling_price);
          let cartItemIndex = this.cartData.findIndex((cartItem: any) => cartItem.id === itemId);
          if (cartItemIndex !== -1) {
            if (item.itemscount === 0) {
              this.cartData.splice(cartItemIndex, 1);
            } else {
              this.cartData[cartItemIndex].itemscount = item.itemscount;
              this.cartData[cartItemIndex].itemsamount = item.itemsamount;
              this.cartData[cartItemIndex].item_gst_amount = item.item_gst_amount;
              this.cartData[cartItemIndex].savingitemprice = item.savingitemprice;
              this.cartData[cartItemIndex].savingsamount = item.savingsamount;
            }
          }
        }
        this.getCartSummary(); // Display cart summary
        return;
      }
    }
   
  }

 

  getCartSummary() {
    // let categoryDetails = (() => {
    //   try {
    //     return JSON.parse(localStorage.getItem("category_details") ?? "null");
    //   } catch {
    //     return null;
    //   }
    // })();
  
    
    // localStorage.setItem('category_id', categoryDetails.id);
    // localStorage.setItem('category_name', categoryDetails.category_name);
    // localStorage.setItem('order_offer_amount', categoryDetails.order_offer_amount);
    
    this.totalItems = this.cartData.reduce((sum: any, item: any) => sum + item.itemscount, 0);
    console.log(this.totalItems);
    

  }

  gotobasket() {
    localStorage.removeItem('cartData');
      localStorage.removeItem('cart_merchant');
      localStorage.removeItem('main_shopdetails');
      localStorage.removeItem('shopdetails');

    localStorage.setItem("set_delivery_distance_status", "0");
    localStorage.setItem('cart_merchant', JSON.stringify(this.merchantData));
    localStorage.setItem('main_shopdetails', JSON.stringify(this.merchantData));
    localStorage.setItem('shopdetails', JSON.stringify(this.merchantData));
    localStorage.setItem('cartData', JSON.stringify(this.cartData));
    console.log(this.cartData);
    
    this.navCtrl.navigateForward('basket', {
      queryParams: { pageback: 'groceries' ,pageind: '1',pagebackdata:"" }
    });
    localStorage.setItem("callbackdata", JSON.stringify({ pageback: 'groceries',pageind: '1',pagebackdata:"" }))
  }

  async searchdata() {
    let data = {
      search_term: this.searchQuery.length > 2 ? this.searchQuery : ''
    };

    this.api.getgroucery_search_items_list(data).subscribe(async (res: any) => {
     
      if (res.status == 200) {
        res.data = res.data.map((item: any) => ({
          ...item,
          item_description: item.category_name,
          itemscount: 0,
          itemsamount: 0,
          item_gst_amount:0,
          savingitemprice: (item.mrp_price * 1) - (item.selling_price * 1),
          savingsamount: 0,
          packing_charges: this.merchantData.packing_charges,
          random_rating: (Math.random() * (4.5 - 3.5) + 3.5).toFixed(1),
          item_count: 1,
          // item_wishlist_ind: !!matchedWishlist,
          extra_finalAmount:0,
          total_extra_item_price:0,single_extra_item_price:0,
          org_selling_price:item.selling_price,
          org_actual_price:item.selling_price,
          // wishlist_id: matchedWishlist?.id || 0
        }));
        this.masterproducts = res.data;
        this.filteredProducts = res.data;
      }
    }, (error: any) => {
    });
  }


  async removecartalert(){
    const alert = await this.alertController.create({
      header: 'Clear Cart?',
      message: 'You already have products from another merchant in your cart. Do you want to clear the cart to add these items?',
      cssClass: 'custom-alert',  // Apply custom class to the alert
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'green-button'  // Custom class for styling
        },
        {
          text: 'Clear Cart',
          cssClass: 'green-button',  // Custom class for styling
          handler: () => {
            localStorage.removeItem('cartData');
      localStorage.removeItem('cart_merchant');
            localStorage.setItem("set_delivery_distance_status", "0");
            this.cartData=[];
            this.totalItems=0;
          }
        }
      ]
    });
  
    await alert.present();
    
  
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
