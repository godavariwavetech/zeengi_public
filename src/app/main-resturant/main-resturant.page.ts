import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../service/api.service';
import { AlertController, IonAccordionGroup, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { SchedulePage } from '../schedule/schedule.page';
import { firstValueFrom } from 'rxjs';


interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  open: boolean;
  items: Item[];
}

interface Item {
  id: number;
  shop_id: string;
  item_name: string;
  item_image: string;
  item_description: string;
  filter_one: string;
  actual_price: string;
  selling_price: string;
  discount_percentage: string;
  discount_amount: string;
  active_status: string;
  admin_percentage: number;
  sub_category_id: number;
  sub_category_name: string;
  itemscount: number;
  totalamount: number;
}

// interface ItemVariant {
//   id: number;
//   quantity_varient: string;
//   selling_price: string;
// }

@Component({
  selector: 'app-main-resturant',
  templateUrl: './main-resturant.page.html',
  styleUrls: ['./main-resturant.page.scss'],
})
export class MainResturantPage implements OnInit {
  @ViewChild('timeScroll') timeScroll!: ElementRef;

  dateOptions = [
    { display: '', label: 'Today', slot_date: '' },
    { display: '', label: 'Tomorrow', slot_date: '' }
  ];

  isNaN = isNaN;

  timeOptions = [];

  selectedDate = this.dateOptions[0];
  selectedTime: string | null = null;


  @ViewChild(IonAccordionGroup, { static: false }) accordionGroup!: IonAccordionGroup
  othermainitems: any
  searchQuery: any = ''
  data: any = []
  restaurantdata: any
  filteredItems: any = []
  mainitems: any = []
  originaldata: any;
  shop_wishlist_ind: boolean = false;
  wishlistdata: any = [];
  location_name: any; filtermodal: boolean = false;
  outletshoplist: any = [];
  outletmodal: boolean = false;
  directionsService = new google.maps.DirectionsService; shop_offerslist: any = []; offerscount = 1; currentIndex = 0; valid_offer_amount: any = 0; offermodal = false; slottimingmodal: boolean = false; deliveryType = 0;
  moreitemsmodal = false; moreitemsdata: any; selectedWeight: string = ''; moreselecteditemsdata: any;
  selectedVariant: string = ''; moreitemslist: any = [] = []; itemCount: number = 1;
  grandTotal = 0; // Initialize grand total
  cartData: any = []; // Initialize cart array
  totalItems: any
  private intervalId: any; banneritmeslist: any = [];
  extra_items_array: any = []; extra_cart_count: any; extra_finalAmount: any; total_extra_item_price: any;
  extra_more_items_commants: any; extra_items_data: any; total_saving_amount = 0; total_cart_value = 0; offertagline: any = 0; ofermodalind = 0;

  userLatitude: any;
  userLongitude: any;

  gotoback() {
    this.navctrl.back();
  }

  selectedFilters = {
    sort: '',
    diet: [],
    top: [],
    dietary: [],
    offer: []
  };

  showfilteritemsstatus: boolean = true;
  filtertotalitems: any = []; selectedItemId: number = 0; single_extra_item_price: any = 0; notdatastatus = 2;

  constructor(private route: ActivatedRoute, public api: ApiService, public navctrl: NavController, public loadingCtrl: LoadingController, private alertController: AlertController, private modalCtrl: ModalController, private toastController: ToastController,) {
    this.cartData = JSON.parse(localStorage.getItem("cartData") ?? '[]');
    if (this.cartData.length) {
      const found = this.cartData.some((item: any) => item.banner_item_status == 1);
      if (found) {
        this.exclusive_show_indicator = 1;
      } else {
        this.exclusive_show_indicator = 0;
      }
    }
    this.savingamount();
    this.totalItems = this.cartData.reduce((sum: any, item: any) => sum + item.itemscount, 0);
    this.route.queryParams.subscribe(params => {
      this.data = params['data'];
      this.restaurantdata = JSON.parse(this.data);
      this.restaurantdata.slot_order = 0;
      this.getcategorydetails(this.restaurantdata);
      this.getcustomerwishlist();
      this.getshopdetail(this.restaurantdata.shop_id);
    });
    this.location_name = localStorage.getItem("location_name");
  }

  savingamount() {
    this.total_saving_amount = this.cartData.reduce((total: any, item: any) => total + item.savingsamount, 0);
    if (this.total_saving_amount > 0) {
      this.offertagline = "You are saving ₹" + "" + this.total_saving_amount
    }

    this.total_cart_value = this.cartData.reduce((total: number, item: any) => {
      const amount = Number(item.itemsamount) || 0;
      return total + amount;
    }, 0);

    if (this.shop_offerslist.length > 0) {
      const sortedOffers = this.shop_offerslist.sort((a: any, b: any) => {
        return Number(a.coupon_max_price_limit) - Number(b.coupon_max_price_limit);
      });

      for (let i = 0; i < sortedOffers.length; i++) {
        const obj = sortedOffers[i];
        if (obj.coupon_max_price_limit > 0) {
          if (obj.coupon_max_price_limit > this.total_cart_value) {
            const addvalue = obj.coupon_max_price_limit - this.total_cart_value;

            this.offertagline = "Add ₹" + addvalue + " more to get the " + obj.coupon_name;
            break;
          } else {
            // Optional: handle case when condition is not met
            this.offertagline = 0;
          }
        }
      }
    }
  }

  convertTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  ngOnInit() {
  }

  inactiveItems: any = []

  items: any = [];
  reorder_items: any = []
  filterskey: any

  async getshopdetail(shop_id: any) {
    var data = {
      shop_id: shop_id,
      shop_items_tb_nm: this.restaurantdata.shop_items_tb_nm
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getitemslist(data).subscribe(async (res: any) => {
      this.inactiveItems = res.data.filter((item: any) => item.active_status == "1");
      res.data = res.data.filter((item: any) => item.active_status == "0");
      if (res.status == 200) {
        const shopitemstatus = this.cartData.some((obj: any) => obj.shop_id == shop_id);
        if (this.restaurantdata.banner_item_ids) {
          await this.banneritemsfunction(res.data, shopitemstatus, this.restaurantdata);
        } else {
          const bannerres: any = await firstValueFrom(this.api.getbanneritemslist(this.restaurantdata));
          if (bannerres.data[0]?.item_id) {
            this.exclusive_array = bannerres.data[0];
            this.restaurantdata.banner_item_ids = bannerres.data[0].item_id;
            this.restaurantdata.banner_offer_title = bannerres.data[0].banner_offer_title;
            await this.banneritemsfunction(res.data, shopitemstatus, this.restaurantdata);
          }
        }
        res.data = res.data.filter((item1: any) =>
          !this.banneritmeslist.some((item2: any) => item2.id == item1.id)
        );
        res.data = res.data.map((item: any) => {
          const wishlistArray = Array.isArray(this.wishlistdata) ? this.wishlistdata : [];
          const matchedWishlist = wishlistArray.find(
            (obj: any) =>
              obj.wishlist_id == item.id &&
              obj.wishlist_type == 1 &&
              obj.table_name == this.restaurantdata.shop_items_tb_nm
          );

          // If shopitemstatus is true and item exists in cartData
          let updatedCartItem: any = null;
          if (shopitemstatus) {
            updatedCartItem = this.cartData.find((obj: any) => obj.id == item.id);
          }

          return {
            ...item,
            itemscount: updatedCartItem ? updatedCartItem.itemscount : 0,
            itemsamount: updatedCartItem ? updatedCartItem.itemsamount : 0,
            item_gst_amount: updatedCartItem ? updatedCartItem.item_gst_amount : 0,
            savingitemprice: (item.actual_price * 1) - (item.selling_price * 1),
            savingsamount: updatedCartItem ? updatedCartItem.savingsamount : 0,
            packing_charges: this.restaurantdata.packing_charges,
            random_rating: (Math.random() * (4.5 - 3.5) + 3.5).toFixed(1),
            item_count: 1,
            item_wishlist_ind: !!matchedWishlist,
            extra_finalAmount: updatedCartItem ? updatedCartItem.extra_finalAmount : 0,
            total_extra_item_price: updatedCartItem ? updatedCartItem.total_extra_item_price : 0,
            single_extra_item_price: updatedCartItem ? updatedCartItem.single_extra_item_price : 0,
            org_selling_price: item.selling_price,
            org_actual_price: item.selling_price,
            wishlist_id: matchedWishlist?.id || 0
          };
        });

        loading.dismiss();
        this.notdatastatus = 0;

        this.originaldata = res.data;
        this.mainitems = res.data;
        this.items = this.groupItemsBySubCategory(res.data);
        this.othermainitems = this.items;
        if (this.items.length == 0) {
          this.notdatastatus = 1;
        }
        //--------------------------------------Reorder---------------------------------------------
        if (Number(localStorage.getItem('reorder_status')) == 1) {
          this.reorder_items = localStorage.getItem('reorder_items');
          var datwe = JSON.parse(this.reorder_items);
          for (const b of datwe) {
            for (let i = 0; i < b.sub_item_count; i++) {
              this.additem(b.item_id, 1);
            }
          }
          localStorage.setItem('reorder_status', '0')
        }
        //-----------------------------------------------Reorder ----------------------------------------------
        const uniqueFilters = Array.from(
          new Set(this.mainitems.map((item: any) => item.filter_one.toLowerCase().replace(/\b\w/g, (c: any) => c.toUpperCase())))
        );
        this.filterskey = uniqueFilters;
        this.filteredItems = [...this.mainitems]; // Default: show all items
      } else {
        loading.dismiss();
        this.notdatastatus = 1;
      }
    }, (error) => {
      loading.dismiss();
      this.notdatastatus = 1;
    })
  }

  async banneritemsfunction(itemsdata: any, shopitemstatus: any, restaurantdata: any) {
    const banner_item_ids = String(restaurantdata.banner_item_ids); // handle both strings & numbers
    const bannerIdsArray = banner_item_ids
      .split(',')
      .map(id => Number(id.trim()));

    const filteredItems = itemsdata.filter((item: any) =>
      bannerIdsArray.includes(item.id)
    );

    const wishlistArray = Array.isArray(this.wishlistdata) ? this.wishlistdata : [];

    this.banneritmeslist = filteredItems.map((item: any) => {
      const matchedWishlist = wishlistArray.find(
        (obj: any) =>
          obj.wishlist_id == item.id &&
          obj.wishlist_type == 1 &&
          obj.table_name == restaurantdata.shop_items_tb_nm
      );

      let updatedCartItem: any = null;
      if (shopitemstatus) {
        updatedCartItem = this.cartData.find((obj: any) => obj.id == item.id);
      }

      return {
        ...item,
        itemscount: updatedCartItem ? updatedCartItem.itemscount : 0,
        itemsamount: updatedCartItem ? updatedCartItem.itemsamount : 0,
        item_gst_amount: updatedCartItem ? updatedCartItem.item_gst_amount : 0,
        savingitemprice: (item.actual_price * 1) - (item.selling_price * 1),
        savingsamount: updatedCartItem ? updatedCartItem.savingsamount : 0,
        packing_charges: this.restaurantdata.packing_charges,
        random_rating: (Math.random() * (4.5 - 3.5) + 3.5).toFixed(1),
        item_count: 1,
        item_wishlist_ind: !!matchedWishlist,
        extra_finalAmount: updatedCartItem ? updatedCartItem.extra_finalAmount : 0,
        total_extra_item_price: updatedCartItem ? updatedCartItem.total_extra_item_price : 0,
        single_extra_item_price: updatedCartItem ? updatedCartItem.single_extra_item_price : 0,
        org_selling_price: item.selling_price,
        org_actual_price: item.selling_price,
        wishlist_id: matchedWishlist?.id || 0
      };
    });
  }

  groupItemsBySubCategory(items: Item[]): SubCategory[] {
    this.showfilteritemsstatus = true;
    const subCategoryMap: { [key: number]: SubCategory } = {};
    items.forEach(item => {
      if (!subCategoryMap[item.sub_category_id]) {
        subCategoryMap[item.sub_category_id] = {
          sub_category_id: item.sub_category_id,
          sub_category_name: item.sub_category_name,
          open: true, // Always Open by Default
          items: []
        };
      }
      subCategoryMap[item.sub_category_id].items.push(item);
    });
    return Object.values(subCategoryMap);
  }

  filterItems(filterType: string) {
    this.items = [];
    if (filterType == 'All') {
      this.filteredItems = [...this.mainitems];
    } else {
      this.filteredItems = this.mainitems.filter((item: any) => item.filter_one.toLowerCase() == filterType.toLowerCase());
    }
    this.items = this.groupItemsBySubCategory(this.filteredItems);;
    setTimeout(() => {
      this.items.forEach((item: any) => {
        const accordion = document.querySelector(`ion-accordion[value="${item.sub_category_name}"]`);
        if (accordion) {
          (accordion as any).toggle();
        }
      });
    }, 300);
  }

  modalopens = false;

  openMenuModal() {
    this.modalopens = true;
  }

  close() {
    this.modalopens = false;
  }

  toggleCategory(category: any) {
    category.open = !category.open; 2
  }


  // Your method
  async additem(itemId: any, item_count: any) {
    if (this.cartData.length == 0) {
      const timestamp = new Date().getTime();
      localStorage.setItem('cart_created_at', timestamp.toString());
      this.cartfunctionality(itemId, item_count);

    } else if (this.cartData[0].shop_id == this.restaurantdata.shop_id) {
      this.cartfunctionality(itemId, item_count);
    } else {
      this.removecartalert();
    }
  }


  additem2(itemId: any, item_count: any) {

    if (this.cartData.length == 0) {
      this.banneritemscaliculations(itemId, item_count);
    } else if (this.cartData[0].shop_id == this.restaurantdata.shop_id) {
      this.banneritemscaliculations(itemId, item_count);
    } else {
      this.removecartalert();
    }
  }


  banneritemscaliculations(item: any, item_count: number) {

    localStorage.setItem('main_shopdetails', JSON.stringify(this.restaurantdata));
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
    this.closeitemmodal();
    // Check if item is already in cartData
    let cartItem = this.cartData.find((cartItem: any) => cartItem.id == item.id);
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
        actual_price: item.actual_price,
        selling_price: item.selling_price,
        itemscount: item.itemscount,
        itemsamount: item.itemsamount,
        savingitemprice: item.savingitemprice,
        savingsamount: item.savingsamount,
        packing_charges: item.packing_charges,
        rack_code: '',
        filterone: item.filter_two,
        shop_id: this.restaurantdata.shop_id,
        item_gst: item.item_gst,
        item_gst_amount: item.item_gst_amount,
        final_more_itmes: item.final_more_itmes,
        extra_finalAmount: item.extra_finalAmount,
        total_extra_item_price: item.total_extra_item_price,
        org_selling_price: item.selling_price,
        org_actual_price: item.actual_price,
        single_extra_item_price: item.single_extra_item_price,
        prescription_required: item.prescription_required,
        banner_item_status: 1
      });
    }
    this.getCartSummary(); // Display cart summary



  }

  cartfunctionality(itemId: any, item_count: number) {
    let found = false;
    if (this.restaurantdata.banner_item_ids) {
      const idsArray = this.restaurantdata.banner_item_ids.toString().split(',').map((id: any) => parseInt(id.trim()));
      found = idsArray.some((id: any) => id == itemId);
    }
    if (found) {
      var banner_item_s = 1;
    } else {
      var banner_item_s = 0;
    }

    this.closeitemmodal();
    localStorage.setItem('main_shopdetails', JSON.stringify(this.restaurantdata));

    for (let category of this.items) {
      for (let item of category.items) {

        if (item.id == itemId) {
          localStorage.setItem("category_id", item.category_id);
          localStorage.setItem("category_name", item.category_name);
          localStorage.setItem("sub_category_id", item.sub_category_id);
          localStorage.setItem("sub_category_name", item.sub_category_name);
          item.itemscount = item.itemscount + item_count;
          item.total_extra_item_price = item.total_extra_item_price * item.itemscount;

          item.itemsamount = item.itemscount * ((parseFloat(item.selling_price) + parseFloat(item.single_extra_item_price)));

          item.item_gst_amount = (item.item_gst * item.itemsamount) / 100;

          item.savingsamount = item.itemscount * parseFloat(item.savingitemprice);

          this.grandTotal += parseFloat(item.selling_price);

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
              actual_price: item.actual_price,
              selling_price: item.selling_price,
              itemscount: item.itemscount,
              itemsamount: item.itemsamount,
              savingitemprice: item.savingitemprice,
              savingsamount: item.savingsamount,
              packing_charges: item.packing_charges,
              rack_code: '',
              filterone: item.filter_two,
              shop_id: this.restaurantdata.shop_id,
              item_gst: item.item_gst,
              item_gst_amount: item.item_gst_amount,
              final_more_itmes: item.final_more_itmes,
              extra_finalAmount: item.extra_finalAmount,
              total_extra_item_price: item.total_extra_item_price,
              org_selling_price: item.selling_price,
              org_actual_price: item.actual_price,
              single_extra_item_price: item.single_extra_item_price,
              prescription_required: item.prescription_required,
              banner_item_status: banner_item_s
            });

          }
          this.getCartSummary(); // Display cart summary
          return;
        }
      }
    }
    localStorage.removeItem('delivery_elements');
  }

  async removecartalert() {
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
            localStorage.removeItem('main_shopdetails');
            localStorage.removeItem('shopdetails');
            localStorage.setItem("set_delivery_distance_status", "0");
            this.cartData = [];
            this.totalItems = 0;
            this.savingamount();
          }
        }
      ]
    });
    await alert.present();
  }

  removeitem2(itemId: any, item: any) {
    if (item.itemscount > 0) {
      item.itemscount -= 1;
      item.total_extra_item_price = item.total_extra_item_price * item.itemscount;
      item.itemsamount = item.itemscount * ((parseFloat(item.selling_price) + parseFloat(item.single_extra_item_price)));

      item.item_gst_amount = (item.item_gst * item.itemsamount) / 100;
      this.grandTotal -= parseFloat(item.selling_price);
      let cartItemIndex = this.cartData.findIndex((cartItem: any) => cartItem.id == itemId);
      if (cartItemIndex !== -1) {
        if (item.itemscount == 0) {
          console.log("remove delivery status 1");

          this.cartData.splice(cartItemIndex, 1);
          localStorage.removeItem('cartData');
          localStorage.removeItem('cart_merchant');
        } else {
          this.cartData[cartItemIndex].itemscount = item.itemscount;
          this.cartData[cartItemIndex].itemsamount = item.itemsamount;
          this.cartData[cartItemIndex].item_gst_amount = item.item_gst_amount;
          this.cartData[cartItemIndex].savingitemprice = item.savingitemprice;
          this.cartData[cartItemIndex].savingsamount = item.savingsamount;
        }
      }
    } else {
      item.itemscount = 0;
    }
    console.log(this.cartData);
    if (this.cartData.length == 0) {
      localStorage.setItem("set_delivery_distance_status", "0");
    }

    this.getCartSummary(); // Display cart summary


  }

  removeitem(itemId: any, item: any) {
    for (let category of this.items) {
      for (let item of category.items) {
        if (item.id == itemId) {
          if (item.itemscount > 0) {
            item.itemscount -= 1;
            item.total_extra_item_price = item.total_extra_item_price * item.itemscount;
            item.itemsamount = item.itemscount * ((parseFloat(item.selling_price) + parseFloat(item.single_extra_item_price)));
            item.item_gst_amount = (item.item_gst * item.itemsamount) / 100;
            this.grandTotal -= parseFloat(item.selling_price);
            let cartItemIndex = this.cartData.findIndex((cartItem: any) => cartItem.id == itemId);
            if (cartItemIndex !== -1) {
              if (item.itemscount == 0) {
                this.cartData.splice(cartItemIndex, 1);
                localStorage.removeItem('cartData');
                localStorage.removeItem('cart_merchant');
              } else {
                this.cartData[cartItemIndex].itemscount = item.itemscount;
                this.cartData[cartItemIndex].itemsamount = item.itemsamount;
                this.cartData[cartItemIndex].item_gst_amount = item.item_gst_amount;
                this.cartData[cartItemIndex].savingitemprice = item.savingitemprice;
                this.cartData[cartItemIndex].savingsamount = item.savingsamount;
              }
            }
          } else {
            item.itemscount = 0;
          }
          if (this.cartData.length == 0) {
            localStorage.setItem("set_delivery_distance_status", "0");
          }
          this.getCartSummary(); // Display cart summary
          return;
        }
      }
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------

  async addmoreitem(item: any, sub_ctgry_items: any) {
    const loader = await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'circles', // options: 'bubbles' | 'circles' | 'crescent' | 'dots' | 'lines'
    });
    await loader.present();
    this.moreitemsdata = item;
    item.shop_items_tb_nm = this.restaurantdata.shop_items_tb_nm;
    this.moreitemsmodal = true;
    this.api.getrelateditemslist(item).subscribe(async (res: any) => {
      // res.data.sort((a: any, b: any) => a.price - b.price);
      res.data.sort((a: any, b: any) => {
        // Make "Quantity" items appear first
        if (a.title === 'Quantity' && b.title !== 'Quantity') return -1;
        if (a.title !== 'Quantity' && b.title === 'Quantity') return 1;

        // Otherwise, sort by price
        return a.price - b.price;
      });

      if (res.data.length > 0) {
        if (item.quantity_type == 0) {

          this.extra_items_array.push({
            id: item.id,
            item_id: item.id,
            category_id: item.category_id,
            shop_id: item.shop_id,
            title: "Quantity",
            food_type: item.filter_one,
            user_selection: 0,
            radio_button_selected: "1",
            extra_item_name: item.item_name,
            price: item.selling_price,
            table_name: "",
            entry_by: 0,
            d_in: 0
          });

          this.extra_cart_count = 1;
          this.exctra_cart_caliculation(this.extra_items_array);
          await loader.dismiss();
        } else {
          let mcnt = 0;
          const quantityproducts = res.data.filter((obj: any) => obj.title == "Quantity");
          if (quantityproducts.length > 0) {
            this.selectedItemId = quantityproducts[0].id;
            item.selling_price = quantityproducts[0].price;
          }

          res.data.forEach(async (obj: any) => {
            if (obj.user_selection == 0 && mcnt == 0) {

              obj.radio_button_selected = "1";

              obj.check_type = 0;

              this.extra_items_array.push(obj);

              this.extra_cart_count = 1;

              this.extra_items_array.sort((a: any, b: any) => a.price - b.price);

              this.exctra_cart_caliculation(this.extra_items_array);
              mcnt++;
            }
            await loader.dismiss();
          });
        }
        const sortedItems = res.data.sort((a: any, b: any) => {
          if (a.title == 'Quantity' && b.title !== 'Quantity') {
            return -1;
          }
          if (a.title !== 'Quantity' && b.title == 'Quantity') {
            return 1;
          }
          return 0; // Keep original order otherwise
        });
        this.moreitemslist = Object.values(sortedItems.reduce((r: any, o: any) => {
          r[o.title] = r[o.title] || { 'user_selection': o.user_selection, 'title': o.title, 'subarray': [] };
          r[o.title]['subarray'].push(o);
          return r;
        }, {}));
      }
    })
  }

  exctra_cart_caliculation(extra_items_array: any) {
    this.total_extra_item_price = this.extra_items_array.reduce((sum: any, item: any) => {
      return sum + parseFloat(item.price);
    }, 0);
    this.extra_finalAmount = this.total_extra_item_price * this.extra_cart_count;
    console.log('ewrqerf', this.extra_finalAmount)

    console.log(this.extra_items_array)
  }


  removeextracount() {
    if (this.extra_cart_count > 1) {
      this.extra_cart_count -= 1;
      this.exctra_cart_caliculation(this.extra_items_array);
    }
  }

  addextracount() {
    this.extra_cart_count += 1;
    this.exctra_cart_caliculation(this.extra_items_array);
  }

  selecte_items_value(selected_items: any, check_type: any) {
    selected_items.check_type = check_type;

    if (check_type == 0) {
      // Find any existing radio item (check_type == 0)
      const oldItem = this.extra_items_array.find((obj: any) => obj.check_type == 0);

      // If exists, subtract its price from total
      if (oldItem) {
        this.single_extra_item_price = (parseFloat(this.single_extra_item_price) || 0) - (parseFloat(oldItem.price) || 0);
      }

      // Remove all radio items from array
      this.extra_items_array = this.extra_items_array.filter(
        (obj: any) => obj.check_type !== 0
      );

      // Add new item and update total
      this.extra_items_array.push(selected_items);
      this.single_extra_item_price =
        (parseFloat(this.single_extra_item_price) || 0) + (parseFloat(selected_items.price) || 0);
    } else {
      // Checkbox logic
      const index = this.extra_items_array.findIndex(
        (obj: any) => obj.id == selected_items.id
      );

      if (index == -1) {
        this.single_extra_item_price =
          (parseFloat(this.single_extra_item_price) || 0) + (parseFloat(selected_items.price) || 0);
        this.extra_items_array.push(selected_items);
      } else if (check_type == 1) {
        this.single_extra_item_price =
          (parseFloat(this.single_extra_item_price) || 0) - (parseFloat(selected_items.price) || 0);
        this.extra_items_array.splice(index, 1);
      }
    }
    this.exctra_cart_caliculation(this.extra_items_array);
  }

  exclusive_show_indicator: any = 0
  exclusive_array: any = ''
  data_er: any


  getCartSummary() {
    if (this.cartData.length == 0) {
      this.exclusive_show_indicator = 0;
    };
    this.exclusive_show_indicator = 0;
    const array1Ids = this.banneritmeslist.map((x: any) => x.id);
    const found = this.cartData.some((item: any) => array1Ids.includes(item.id));
    if (found) {
      this.exclusive_show_indicator = 1;
    } else {
      this.exclusive_show_indicator = 0;
    }

    //------------------------------------------------------------------------------------------------
    if (this.cartData[0].shop_id == this.restaurantdata.shop_id) {

      localStorage.removeItem('cartData');
      localStorage.removeItem('cart_merchant');
      console.log("remove delivery status 3");
      this.totalItems = this.cartData.reduce((sum: any, item: any) => sum + item.itemscount, 0);
      this.savingamount();
      this.data_er = localStorage.getItem('location_id');
      localStorage.setItem('current_location_id', this.data_er)
      setTimeout(() => {
        localStorage.setItem('cartData', JSON.stringify(this.cartData));
        localStorage.setItem('cart_merchant', JSON.stringify(this.restaurantdata));
      }, 100);
    } else {
      localStorage.removeItem('cartData');
      localStorage.removeItem('cart_merchant');
      console.log("remove delivery status 4");
      localStorage.setItem("set_delivery_distance_status", "0");
    }
  }

  async gotobasket() {
    this.restaurantdata = JSON.parse(localStorage.getItem('cart_merchant') || 'null');
    if (localStorage.getItem("set_delivery_distance_status") === "0") {
      const loadingWrapper = await this.presentLoading();
      const dismissLoader = loadingWrapper.dismiss;
      const distance_latlng = {
        from_latitude: this.restaurantdata.shop_latitude,
        from_longitude: this.restaurantdata.shop_longitude,
        to_latitude: this.userLatitude,
        to_longitude: this.userLongitude,
      };

      console.log(distance_latlng)
      try {

        // Uncomment when integrating real API call
        const distanceInfo = await this.api.getRouteDistanceORS(this.restaurantdata.shop_latitude, this.restaurantdata.shop_longitude, this.userLatitude, this.userLongitude);


        if (distanceInfo && (this.restaurantdata.maximum_del_km >= distanceInfo)) {
          this.restaurantdata.distance = distanceInfo;
          localStorage.setItem("order_distance", String(distanceInfo))
          if (this.restaurantdata.distance < this.restaurantdata.minimum_km) {   // Below 3 kilometers
            localStorage.setItem("delivery_charges", String(this.restaurantdata.minimum_del_charge));
            this.restaurantdata.delivery_charges = this.restaurantdata.minimum_del_charge;
            this.restaurantdata.extradistance = 0;
            localStorage.setItem("order_delivery_charges", String(this.restaurantdata.minimum_del_charge))
            localStorage.setItem("order_extradistance", "0")
          } else {
            this.restaurantdata.extradistance = this.restaurantdata.distance - this.restaurantdata.minimum_km;
            var del_charges = Math.round((this.restaurantdata.extradistance * this.restaurantdata.per_km_chargers) + Number(this.restaurantdata.minimum_del_charge));
            localStorage.setItem("delivery_charges", String(del_charges));
            this.restaurantdata.delivery_charges = del_charges;
            localStorage.setItem("order_delivery_charges", String(del_charges))
            localStorage.setItem("order_extradistance", this.restaurantdata.extradistance)
          }
          localStorage.setItem("set_delivery_distance_status", "1");
          await dismissLoader();
          this.maindatafunction2();
        } else {
          localStorage.removeItem('cartData');
          localStorage.removeItem('cart_merchant');
          localStorage.removeItem('main_restaurantdata');
          localStorage.removeItem('shopdetails');
          localStorage.setItem("set_delivery_distance_status", "0");
          localStorage.setItem('address_store', '0');
          await dismissLoader();
          this.serviceNotAvailableFunction();
          console.log("111")
        }
      } catch (error) {
        console.error('Error fetching distance:', error);
        localStorage.removeItem('cartData');
        localStorage.removeItem('cart_merchant');
        localStorage.removeItem('main_shopdetails');
        localStorage.removeItem('shopdetails');
        localStorage.setItem("set_delivery_distance_status", "0");
        localStorage.setItem('address_store', '0');
        await dismissLoader();
        this.serviceNotAvailableFunction();
        console.log("222")
      }
    } else {
      this.restaurantdata.distance = localStorage.getItem("order_distance");
      this.restaurantdata.delivery_charges = localStorage.getItem("order_delivery_charges");
      this.restaurantdata.extradistance = localStorage.getItem("order_extradistance");
      if ([null, 'undefined', '', 0, "0"].includes(this.restaurantdata.distance)) {
        localStorage.setItem("set_delivery_distance_status", "0");
      }
      this.maindatafunction2();
    }
  }

  maindatafunction2() {
    localStorage.setItem('main_shopdetails', JSON.stringify(this.restaurantdata));
    localStorage.setItem('cart_merchant', JSON.stringify(this.restaurantdata));
    this.navctrl.navigateForward('basket', {
      queryParams: { pageback: 'main-resturant', pageind: '0', pagebackdata: this.restaurantdata }
    });
    localStorage.setItem("callbackdata", JSON.stringify({ pageback: 'main-resturant', pageind: '0', pagebackdata: this.restaurantdata }))
  }
  searchdata() {
    const query = this.searchQuery.toLowerCase();
    if (query == ' ') {
      this.mainitems = [...this.originaldata];
      return;
    }
    this.mainitems = this.originaldata.filter((item: any) =>
      item.item_name.toLowerCase().includes(query) ||
      item.category_name.toLowerCase().includes(query) ||
      item.sub_category_name.toLowerCase().includes(query)
    );
    this.items = this.groupItemsBySubCategory(this.mainitems);
    const uniqueFilters = Array.from(
      new Set(this.mainitems.map((item: any) => item.filter_one.toLowerCase().replace(/\b\w/g, (c: any) => c.toUpperCase())))
    );
    // this.filterskey = uniqueFilters;
    this.filteredItems = [...this.mainitems];
  }

  filtersubcategory(data: any) {
    if (data == 'All') {
      this.mainitems = this.originaldata;
      this.items = this.groupItemsBySubCategory(this.mainitems);
      this.close();
    } else {
      this.mainitems = this.originaldata.filter((item: any) =>
        item.sub_category_name == data);
      this.items = this.groupItemsBySubCategory(this.mainitems);
      this.close();
    }
  }

  itemmodal = false;
  itemdetails: any;

  openitemmodal(data: any, modalind: any) {
    this.itemdetails = data;
    this.itemmodal = true;
    this.ofermodalind = modalind;
  }

  closeitemmodal() {
    this.itemmodal = false;
  }


  async shopupdatewishlist(shop_wishlist_ind: boolean, wishlist_id: number) {
    if ([null, 'undefined', '', 0, "0"].includes(localStorage.getItem("usr_id"))) {
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
            handler: async () => {
              localStorage.setItem('path_name', 'main-resturant');
              this.navctrl.navigateForward('login');
            },
          },
        ],
      });

      await alert.present();
    } else {
      this.shop_wishlist_ind = !shop_wishlist_ind;

      if (this.shop_wishlist_ind == true) {
        const wishlist_data = {
          location_id: this.restaurantdata.location_id,
          wishlist_id: this.restaurantdata.shop_id,
          shop_id: this.restaurantdata.shop_id,
          wishlist_type: 0,
          table_name: "shop_list_t",
          customer_id: localStorage.getItem("usr_id")
        }
        this.api.addwishlist(wishlist_data).subscribe(async (res: any) => {


          this.restaurantdata.wishlist_id = res.data.insertId;


        })
        this.presentToast("Addess To Bookmarks", 'custom-toast-gray');

      } else if (this.shop_wishlist_ind == false) {
        const wishlist_data = {
          id: wishlist_id
        }


        this.api.deletewishlist(wishlist_data).subscribe(async (res: any) => {
        })
        this.presentToast("Collections Updated", 'custom-toast-gray');
      }

    }
  }

  async itemupdatewishlist(wishlist_item: any) {
    if ([null, 'undefined', '', 0, "0"].includes(localStorage.getItem("usr_id"))) {
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
            handler: async () => {
              localStorage.setItem('path_name', 'main-resturant');
              this.navctrl.navigateForward('login');
            },
          },
        ],
      });

      await alert.present();
    } else {

      wishlist_item.item_wishlist_ind = !wishlist_item.item_wishlist_ind;
      if (wishlist_item.item_wishlist_ind == true) {
        const wishlist_data = {
          location_id: this.restaurantdata.location_id,
          wishlist_id: wishlist_item.id,
          shop_id: this.restaurantdata.shop_id,
          wishlist_type: 1,
          table_name: this.restaurantdata.shop_items_tb_nm,
          customer_id: localStorage.getItem("usr_id")
        }
        this.api.addwishlist(wishlist_data).subscribe(async (res: any) => {
          wishlist_item.wishlist_id = res.data.insertId;
        })
        this.presentToast("Addess To Bookmarks", 'custom-toast-gray');

      } else if (wishlist_item.item_wishlist_ind == false) {
        const wishlist_data = {
          id: wishlist_item.wishlist_id
        }


        this.api.deletewishlist(wishlist_data).subscribe(async (res: any) => {
        })
        this.presentToast("Collections Updated", 'custom-toast-gray');
      }

    }
  }

  getcustomerwishlist() {
    const wishlist_data = {
      location_id: this.restaurantdata.location_id,
      shop_id: this.restaurantdata.shop_id,
      customer_id: localStorage.getItem("usr_id")
    }
    this.api.getuserwishlist(wishlist_data).subscribe(async (res: any) => {
      this.wishlistdata = res.data;

      const matchedItem = this.wishlistdata.find((obj: any) => obj.shop_id == this.restaurantdata.shop_id && obj.wishlist_type == 0);
      // const wishlist_shop_id = matchedItem ? matchedItem.shop_id : null;


      if (matchedItem.shop_id == this.restaurantdata.shop_id) {
        this.restaurantdata.wishlist_id = matchedItem.id;
        this.shop_wishlist_ind = !this.shop_wishlist_ind;
      }
    })
  }

  shopdetailsmodal = false;

  openshopdetails() {
    this.shopdetailsmodal = true;
  }

  closeshopdetails() {

    this.shopdetailsmodal = false;
  }



  async presentToast(message: string, cssClass: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass
    });
    await toast.present();
  }


  async share(item: any) {
    const message = `🍽️ *Craving something delicious?*  
Check out this amazing item on *Zeengi*!  

🛍️ *${item.item_name}*  

✨ Why you'll love it:  
✅ Fresh & tasty  
✅ Easy to order  
✅ Delivered to your doorstep  

📱 Download Zeengi now and explore more mouth-watering delights:  
https://play.google.com/store/apps/details?id=Zeengi.app  

Don't miss out — share with your friends and spread the foodie love! ❤️`;

    await Share.share({
      title: `Check out ${item.item_name} on Zeengi!`,
      text: message,
      dialogTitle: 'Share this delicious find with your friends!'
    });
  }

  async shareShop() {
    const message = `🍴 *Discover a great shop on Zeengi!*  

🛒 *${this.restaurantdata.shop_name}*  
📍 ${this.restaurantdata.shop_address}  
⭐ Rating: *${this.restaurantdata.shop_rating}*  
🕒 Delivery Time: *${this.restaurantdata.delivery_time}*  

✨ Why you'll love this shop:  
✅ Fresh & quality products  
✅ Fast and reliable delivery  
✅ Amazing customer experience  

📱 Download Zeengi now to explore this shop and many more:  
https://play.google.com/store/apps/details?id=Zeengi.app  

Share this with your friends and let them enjoy the goodness too! ❤️`;


    await Share.share({
      title: `Check out ${this.restaurantdata.shop_name} on Zeengi!`,
      text: message,
      dialogTitle: 'Share this shop with your friends'
    });
  }

  openfiltermodal() {
    if (this.filtermodal == true) {
      this.filtermodal = false;
      this.filtermodal = true;
    } else {
      this.filtermodal = true;
    }

  }

  clossefiltermodal() {
    this.filtermodal = false;
  }


  selectFilter(filter: string) {
    const allItems: Item[] = this.items.flatMap((cat: any) => cat.items); // You can define a proper type for `cat` later too

    switch (filter) {
      case 'lowHigh':
        allItems.sort((a: Item, b: Item) => parseFloat(a.selling_price) - parseFloat(b.selling_price));
        break;
      case 'highLow':
        allItems.sort((a: Item, b: Item) => parseFloat(b.selling_price) - parseFloat(a.selling_price));
        break;
      case 'az':
        allItems.sort((a: Item, b: Item) => (a.item_name || '').localeCompare(b.item_name || ''));
        break;
      case 'za':
        allItems.sort((a: Item, b: Item) => (b.item_name || '').localeCompare(a.item_name || ''));
        break;
    }

    // this.sortedItems = allItems;
    // this.showfilteritemsstatus=false;
    // this.filtertotalitems = allItems;

    this.items = this.groupItemsBySubCategory(allItems);




  }

  async getrelativeoutlets(restaurantdata: any) {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();

    const shop_details = {
      shop_latitude: localStorage.getItem("latitude"),
      shop_longitude: localStorage.getItem("longitude"),
      location_id: localStorage.getItem("location_id"),
      category_id: restaurantdata.category_id,
      shop_unique_id: restaurantdata.shop_unique_id
    }

    this.api.sameshopoutlets(shop_details).subscribe(async (res: any) => {



      if (res.data.length > 1) {

        const data = res.data.map((shop: any) => {
          const distance = shop.distance; // assumed in kilometers
          const { min, max, formatted } = this.getDeliveryTime(distance);

          return {
            ...shop,
            delivery_distance: distance,
            delivery_time: formatted,
            duration_org: { min, max }
          };
        });

        const sortedData = data.sort((a: any, b: any) => {
          const aDist = parseFloat(a.delivery_distance);
          const bDist = parseFloat(b.delivery_distance);

          if (isNaN(aDist)) return 1; // move 'N/A' or invalid to the end
          if (isNaN(bDist)) return -1;

          return aDist - bDist;
        });

        this.outletshoplist = data;


        this.outletmodal = true;
      } else {
        this.shopdetailsmodal = true;
      }
      loading.dismiss();
    }, error => {
      loading.dismiss();
    })

  }
  closseoutletmodal() {
    this.outletmodal = false;
  }


  async calculateRoute(shop_latitude: any, shop_longitude: any): Promise<{ distance: number, duration: string, duration_org: string }> {
    return {
      distance: 10,
      duration: "10-30 mins",
      duration_org: "30",
    };
  }
  // async calculateRoute(
  //   shop_latitude: any,
  //   shop_longitude: any
  // ): Promise<{ distance: string; duration: string; duration_org: number }> {
  //   const origin = `${shop_latitude},${shop_longitude}`; // Shop's location
  //   const destinationLatitude = parseFloat(localStorage.getItem('latitude') || '0');
  //   const destinationLongitude = parseFloat(localStorage.getItem('longitude') || '0');
  //   const destination = `${destinationLatitude},${destinationLongitude}`; // Customer's location

  //   return new Promise((resolve, reject) => {
  //     if (origin && destination && destinationLatitude !== 0 && destinationLongitude !== 0) {
  //       this.directionsService.route(
  //         {
  //           origin,
  //           destination,
  //           travelMode: google.maps.TravelMode.DRIVING,
  //         },
  //         (response: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
  //           if (status == 'OK' && response.routes.length > 0) {
  //             const leg = response.routes[0].legs[0];

  //             const distanceText = leg.distance.text;
  //             const originalDurationText = leg.duration.text;
  //             const dist = distanceText.replace(/[^\d.]/g, '');

  //             let durationText = originalDurationText;
  //             const durationMinutes = parseInt(originalDurationText, 10)+19
  //             const original_mints = parseInt(originalDurationText)

  //             // if (durationMinutes >= 10) {
  //             //   durationText = '15-20 mins';
  //             // } else {
  //               durationText = `${durationMinutes - 5}-${durationMinutes} mins`;
  //             // }


  //             resolve({
  //               distance: dist,
  //               duration: durationText,
  //               duration_org: original_mints,
  //             });
  //           } else {
  //             reject('Directions request failed due to: ' + status);
  //           }
  //         }
  //       );
  //     } else {
  //       reject('Invalid origin or destination');
  //     }
  //   });

  // }


  async shopitemspage(shopdetails: any) {
    this.outletmodal = false;
    localStorage.setItem('shopdetails', JSON.stringify(shopdetails));
    this.navctrl.navigateForward('main-resturant', {
      queryParams: {
        data: JSON.stringify(shopdetails)
      }
    });
  }


  async gotoshopratingllist(restaurantdata: any) {

    if (restaurantdata.rating_count == 0) {

    } else {
      this.navctrl.navigateForward('shop-ratings', {
        queryParams: { pageback: 'main-resturant', pageind: '0', pagebackdata: restaurantdata }
      });
    }

  }
  async shop_offercelist(restaurantdata: any) {

    const valid_offer_amount = `Get Delivery Offer on orders above ₹${this.valid_offer_amount}`;

    this.api.getshop_offercelist(restaurantdata).subscribe(async (res: any) => {
      this.shop_offerslist = res.data;
      if (this.valid_offer_amount) {
        this.shop_offerslist.push({ id: this.shop_offerslist.length + 1, location_id: this.restaurantdata.location_id, location_name: "", shop_id: this.restaurantdata.shop_id, coupon_name: valid_offer_amount, coupon_description: valid_offer_amount, coupon_percentage: 0, coupon_upto_price: 0, coupon_status: 0, coupon_user_permission: 0, coupon_type: 0, coupon_category_id: "0", coupon_max_price_limit: 0, i_ts: "2025-04-14 00:39:52", entry_by: "2", d_in: "0", "offer_type": 1 });
      }
      if (restaurantdata.special_offer_name) {
        // this.shop_offerslist.push({ id: this.shop_offerslist.length + 1, location_id: this.restaurantdata.location_id, location_name: "", shop_id: this.restaurantdata.shop_id, coupon_name: restaurantdata.special_offer_name, coupon_description: restaurantdata.special_offer_name, coupon_percentage: 0, coupon_upto_price: 0, coupon_status: 0, coupon_user_permission: 0, coupon_type: 0, coupon_category_id: "0", coupon_max_price_limit: 0, i_ts: "2025-04-14 00:39:52", entry_by: "2", d_in: "0", "offer_type": 1 });
      }

      this.offerscount = this.shop_offerslist.length;
      if (this.shop_offerslist?.length > 1) {
        this.intervalId = setInterval(() => {
          this.currentIndex = (this.currentIndex + 1) % this.shop_offerslist.length;
        }, 3000);
      }
      this.savingamount();
    })
  }


  getcategorydetails(category_data: any) {

    const crtrydata = {
      id: category_data.category_id
    }
    this.api.getcategorydetails(crtrydata).subscribe(async (res: any) => {
      this.valid_offer_amount = res.data[0].order_offer_amount;
      this.shop_offercelist(this.restaurantdata);
    }, error => {
      this.shop_offercelist(this.restaurantdata);
    })
  }


  oepnordersmodal() {
    this.offermodal = true;
  }

  closeoffersmodal() {
    this.offermodal = false;
  }


  async setslot(i: any) {

    const modal = await this.modalCtrl.create({
      component: SchedulePage,
      componentProps: { restaurantdata: this.restaurantdata },
      cssClass: 'half-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
      animated: true
    });
    await modal.present();

    // await modal.present();

    modal.onDidDismiss().then((result) => {

      if (result.data?.dismissed) {
        const selectedTime = result.data.selectedTime
        const checktimeslot = {
          end_time: result.data.end_time,
          selectedDate: result.data.selectedDate.slot_date,
          location_id: result.data.selectedDate.location_id,
          shop_id: this.restaurantdata.shop_id
        }

        this.api.checkshop_slot_timings(checktimeslot).subscribe(async (res: any) => {
          console.log(res);

          this.restaurantdata.shop_active_status = res.data[0].shop_active_status;
          if (res.data[0].shop_active_status == 0) {
            const startTime24 = this.extractStartTimeTo24Hour(selectedTime);
            this.deliveryType = 1;
            this.selectedTime = result.data.selectedDate.slot_date + " " + result.data.selectedTime;
            this.restaurantdata.selectedTime = result.data.selectedTime;
            this.restaurantdata.deliveryType = this.deliveryType;
            this.restaurantdata.slot_order = 1;

            this.restaurantdata.order_date = result.data.selectedDate.slot_date;
            this.restaurantdata.slot_date = result.data.selectedDate.slot_date;
            this.restaurantdata.slot_time = startTime24
            this.restaurantdata.order_date_time = result.data.selectedDate.slot_date + " " + startTime24;

            localStorage.setItem('cart_merchant', JSON.stringify(this.restaurantdata));

          } else {
            this.deliveryType = 0;
            this.restaurantdata.slot_order = 0;

          }

        })
      }
    });

    await modal.present();
  }
  closseslottimingmodal() {
    this.slottimingmodal = false;
  }

  closemoreitemsmodal(item: any) {
    this.moreitemsmodal = false;
    this.extra_finalAmount = 0;
    this.total_extra_item_price = 0;
    this.extra_cart_count = 0;
    this.extra_items_array = [];
    this.moreitemslist = [];
    this.selectedItemId = 0;
    item = {}
    this.moreitemsdata = item;

  }

  closemoreitemsmodal1(item: any) {
    this.moreitemsmodal = false;
    this.extra_finalAmount = 0;
    this.total_extra_item_price = 0;
    this.extra_cart_count = 0;
    this.extra_items_array = [];
    this.moreitemslist = [];
    this.selectedItemId = 0;
    item = {}
    this.moreitemsdata = item;

  }

  selectedmoreitems(moreselecteditemsdata: any) {

    moreselecteditemsdata.item_count = 1;


    this.moreitmscaliculation(moreselecteditemsdata)

  }

  increaseCount(event: Event, moreselecteditemsdata: any) {
    event.stopPropagation(); // prevents ion-button click event
    this.itemCount++;
    moreselecteditemsdata.item_count = this.itemCount;
    this.moreitmscaliculation(moreselecteditemsdata)
  }

  decreaseCount(event: Event, moreselecteditemsdata: any) {
    event.stopPropagation();
    if (this.itemCount > 1) {
      this.itemCount--;
      moreselecteditemsdata.item_count = this.itemCount;
      this.moreitmscaliculation(moreselecteditemsdata)
    }
  }

  moreitmscaliculation(moreselecteditemsdata: any) {
    moreselecteditemsdata.total_actual_price = moreselecteditemsdata.item_count * moreselecteditemsdata.actual_price;
    moreselecteditemsdata.total_selling_price = moreselecteditemsdata.item_count * moreselecteditemsdata.selling_price;
    this.moreselecteditemsdata = moreselecteditemsdata;
  }


  addtocart2(moreitemsdata: any) {

    const itemNames = this.extra_items_array
      .map((item: any) => item.extra_item_name.trim())
      .filter((name: string) => name.length > 0) // Optional: filters out empty names
      .join(', ');

    const comments = this.extra_more_items_commants?.trim(); // trims and handles null/undefined

    // Final combined comment
    const final_more_items = itemNames && comments ? `${itemNames}, ${comments}` : itemNames || comments || '';

    this.moreitemsdata.extra_finalAmount = this.extra_finalAmount;

    this.moreitemsdata.total_extra_item_price = ((this.total_extra_item_price * this.extra_cart_count) - (this.moreitemsdata.selling_price * this.extra_cart_count));
    this.moreitemsdata.extra_finalAmount = this.extra_finalAmount;
    this.moreitemsdata.unique_item_count = this.extra_cart_count;
    this.moreitemsdata.item_count = this.extra_cart_count;
    // this.moreitemsdata.itemscount = this.extra_cart_count;
    this.moreitemsdata.final_more_itmes = final_more_items;
    this.moreitemsdata.single_extra_item_price = this.single_extra_item_price;
    this.single_extra_item_price = 0;

    const bajjiCategory = this.items.find((c: any) => c.sub_category_id == this.moreitemsdata.sub_category_id);

    if (bajjiCategory?.items && Array.isArray(bajjiCategory.items)) {
      const index = bajjiCategory.items.findIndex((item: any) => item.id == this.moreitemsdata.id);
      if (index !== -1) {
        bajjiCategory.items.splice(index, 1, this.moreitemsdata);
      } else {
        bajjiCategory.items.push(this.moreitemsdata);
      }
    }

    this.additem(this.moreitemsdata.id, this.extra_cart_count)
    this.moreitemsmodal = false;
  }

  getDeliveryTime(distanceKm: number) {
    let minTime = 25;
    let maxTime = 30;

    if (distanceKm > 3) {
      const extraKm = distanceKm - 3;
      const extraMinutes = Math.ceil(extraKm) * 3;
      minTime += extraMinutes;
      maxTime += extraMinutes;
    }

    return {
      min: minTime,
      max: maxTime,
      formatted: `${minTime}-${maxTime} min`
    };
  }


  ngOnDestroy() {
    this.closemoreitemsmodal1(this.moreitemsdata);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.moreitemsmodal = false;
  }


  extractStartTimeTo24Hour(timeRange: any): string {
    const startTime12h = timeRange.split('-')[0].trim(); // "06:30PM"
    const [time, modifier] = startTime12h.toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.trim().split(':').map(Number);
    if (modifier == 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier == 'AM' && hours == 12) {
      hours = 0;
    }
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}:00`;
  }

  ionViewWillEnter() {
    localStorage.removeItem("previusepage");
    const setLatLongs = localStorage.getItem('setlatlongs');
    if (setLatLongs) {
      const stayLatLong = setLatLongs.split(',');
      if (stayLatLong.length >= 2) {
        this.userLatitude = Number(stayLatLong[0]);
        this.userLongitude = Number(stayLatLong[1]);
      }
    }
    if (localStorage.getItem("path_name") == "basket") {
      localStorage.removeItem("path_name")
    }
    this.cartData = JSON.parse(localStorage.getItem("cartData") ?? '[]');
    this.totalItems = this.cartData.reduce((sum: any, item: any) => sum + item.itemscount, 0);
  }

  async delivery_functionality(results: any) {
    const { min, max, formatted } = this.getDeliveryTime(results[0].distance.value / 1000);
    this.restaurantdata.delivery_time = formatted,
      this.restaurantdata.duration_org = { min, max }
    this.restaurantdata.distance = (results[0].distance.value / 1000);
    if (this.restaurantdata.maximum_del_km > (results[0].distance.value / 1000)) {
      localStorage.setItem("del_distance", String(results[0].distance.value / 1000));
      if ((results[0].distance.value / 1000) < this.restaurantdata.minimum_km) {
        localStorage.setItem("delivery_charges", String(this.restaurantdata.minimum_del_charge));
        this.restaurantdata.delivery_charges = this.restaurantdata.minimum_del_charge;
        this.restaurantdata.extradistance = 0;
        localStorage.setItem('cart_merchant', JSON.stringify(this.restaurantdata));
      } else {
        var extradistance = (results[0].distance.value / 1000) - this.restaurantdata.minimum_km;
        this.restaurantdata.extradistance = extradistance;
        var del_charges = Math.round((extradistance * this.restaurantdata.per_km_chargers) + Number(this.restaurantdata.minimum_del_charge));
        localStorage.setItem("delivery_charges", String(del_charges));
        this.restaurantdata.delivery_charges = del_charges;
        localStorage.setItem('cart_merchant', JSON.stringify(this.restaurantdata));
      }
    } else {
      this.gotoservicelist();
    }
  }

  async gotoservicelist() {
    localStorage.removeItem('main_shopdetails');
    localStorage.removeItem('category_id');
    localStorage.removeItem('category_name');
    localStorage.removeItem('current_location_id');
    localStorage.removeItem('cartData');
    localStorage.removeItem('cart_merchant');
    localStorage.removeItem('delivery_elements');
    console.log("remove delivery status 5");
    localStorage.setItem("set_delivery_distance_status", "0");
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Service Unavailable',
      message: 'We are currently not servicing this location. Please choose another serviceable area.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Change you delivery address',
          handler: () => {
            this.navctrl.navigateRoot('default-address');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentLoading(timeout: number = 5000) {
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

  async serviceNotAvailableFunction() {
    const alert = await this.alertController.create({
      header: 'Notice',
      message: 'Unable to service this location. Would you like to continue with another shop?',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            // Redirect to home page or shop list
            this.navctrl.navigateRoot('/home');
          }
        }
      ]
    });
    await alert.present();
  }

  unavailableitems: boolean = true

  toggleCategory2() {
    this.unavailableitems = !this.unavailableitems;
  }
}






