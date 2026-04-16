import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { LoginPage } from '../login/login.page';
import { ActivatedRoute } from '@angular/router';
import { Checkout } from "../../../node_modules/capacitor-razorpay";
import { IonRouterOutlet } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

declare var Razorpay: any; // Declare Razorpay globally

@Component({
  selector: 'app-basket',
  templateUrl: './basket.page.html',
  styleUrls: ['./basket.page.scss'],
})

export class BasketPage implements OnInit {

  @ViewChild('timeScroll') timeScroll!: ElementRef;
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;

  dateOptions = [
    { display: '', label: 'Today', slot_date: '' },
    { display: '', label: 'Tomorrow', slot_date: '' }
  ];

  timeOptions = [];
  selectedDate = this.dateOptions[0];
  selectedTime: string | null = null;
  locationdetails: any;

  async canDismiss(data?: undefined, role?: string) {
    return role !== 'gesture';
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/icon/noimg.png'; // Replace with your actual fallback image path
  }

  nodata: any;
  locationaddress: any = '';
  data: any = ''
  cartdata: any = [];
  // grandTotal: number = 0;
  totalItems: number = 0;
  dataw: any;
  shopdetails: any;
  distance: number = 0;
  staylatlong: any = localStorage.getItem("setlatlongs");
  itemstotalamount: number = 0;
  del_charges: number = 0;
  private readonly newProperty = this;
  show: boolean = false;
  delivery_fixed_charges: any = 0;
  customer_mobile_number: string = localStorage.getItem('number') || '';
  customer_name: string = localStorage.getItem('name') || '';
  // customer_number:any;
  customer_id: string = localStorage.getItem('usr_id') || '';
  deliverymodalopens: boolean = false;
  gstmarchantfeemodel: boolean = false;
  extradistance = 0;
  shop_gst_fee = 0;
  packing_gst_fee = 0;
  item_total_gst_fee = 0;
  handling_charges_gst_fee = 0;
  surcharges = 0;
  total_bill_value_gst_fee = 0; total_actual_amount = 0;
  grand_total = 0; total_saving_amount = 0; address_type = localStorage.getItem("address_type");
  sub_grand_total = 0; final_del_charges = 0; slot_date_list = []; slottimingmodal: boolean = false; deliveryType: any = 0;
  callbackdata: any; order_payments: any;
  categorydata: any; category_gst_percentage: any; deliveryInstructions: any; selectedInstruction: string = ''; instructionmodel: boolean = false;
  totaltimeslots = []; prescriptionRequired = false; prescriptionstatus = false; uploadedPrescription: string | null = null; banner_item_status = 0; order_latitude: any; order_longitude: any;
  userLatitude: any;
  userLongitude: any; distanceLoading = false;
  distanceInfo: any = null;
  constructor(private navCtrl: NavController, private api: ApiService, private alertCtrl: AlertController, private toastctrl: ToastController, private alertController: AlertController, public loadingCtrl: LoadingController, public modalController: ModalController, private route: ActivatedRoute, private toastController: ToastController, private platform: Platform) {

  }

  async ionViewWillEnter() {
    const setlatlong = this.staylatlong;
    let order_latitude: number;
    let order_longitude: number;
    if (setlatlong && setlatlong.includes(',')) {
      const [lat, lng] = setlatlong.split(',').map((coord: any) => parseFloat(coord));

      if (!isNaN(lat) && !isNaN(lng)) {
        this.order_latitude = lat;
        this.order_longitude = lng;
        this.address_type = localStorage.getItem("address_type");
        if (this.customer_name == "" || this.customer_name == "null" || this.customer_name == "undefined" || this.customer_name == null || this.customer_name == undefined) {
          this.customer_name = "";
        }
        this.getdelivery_instructions();
        this.dataw = localStorage.getItem('main_shopdetails');
        this.selectOnlyOne(1, 'Cash On Delivery');
        this.route.queryParams.subscribe(params => {
          this.callbackdata = params;
        });

        this.locationaddress = localStorage.getItem('setlocation');
        const addressStore = localStorage.getItem('address_store');
        const userId = localStorage.getItem('usr_id');


        if (!addressStore) {
          this.show = false;
        } else {
          if (addressStore === '1' && userId) {
            this.show = true;
          } else {
            this.show = false;
          }
        }

        const commonapis_data = localStorage.getItem('application_common_data');
        this.commonapis = commonapis_data ? JSON.parse(commonapis_data) : null;
        this.handling_charges = this.commonapis.handling_charges;
        this.surcharges = this.commonapis.surcharges;
        this.donation_charges = this.commonapis.donation_charges;
        this.gst_percentage = this.commonapis.gst_percentage;
        this.delivery_fixed_charges = this.commonapis.delivery_fixed_charges;
        this.maindata();
        this.api.application_common_api().subscribe(async (res: any) => {
          if (res.status == 200) {
            this.surcharges = res.data[0].surcharges
            this.donation_charges = this.commonapis.donation_charges;
          }
        }, (error: any) => {
        });
      } else {
        this.gotoservicelist();
      }
    } else {
      this.gotoservicelist();
    }
  }

  gotoservicelist() {
    this.serviceNotAvailableFunction('no_location');
  }

  lat: any;
  long: any;
  saved_delivery: boolean = false;

  async maindata() {

    // const loadings = this.presentLoadings()
    const loading = await this.presentLoadings();
    const setLatLongs = localStorage.getItem('setlatlongs');
    if (setLatLongs) {
      const stayLatLong = setLatLongs.split(',');
      if (stayLatLong.length >= 2) {
        this.userLatitude = Number(stayLatLong[0]);
        this.userLongitude = Number(stayLatLong[1]);
      }
    }
    if (!this.userLatitude || !this.userLongitude || isNaN(this.userLatitude) || isNaN(this.userLongitude)) {
      this.loadCartItems();
      (await loading).dismiss();
      this.serviceNotAvailableFunction('location_error');
      return;
    }
    if (!this.dataw) {
      this.nodata = true;
      (await loading).dismiss()
      return;
    }
    try {
      this.shopdetails = JSON.parse(this.dataw);
      console.log(this.shopdetails);

      if (localStorage.getItem("set_delivery_distance_status") == "0") {
        const distance_latlng = {
          from_latitude: this.shopdetails.shop_latitude,
          from_longitude: this.shopdetails.shop_longitude,
          to_latitude: this.userLatitude,
          to_longitude: this.userLongitude,
        };
        this.distanceLoading = true;
        try {
          const distanceInfo = await this.api.getRouteDistanceORS(this.shopdetails.shop_latitude, this.shopdetails.shop_longitude, this.userLatitude, this.userLongitude);
          if (distanceInfo && (this.shopdetails.maximum_del_km >= distanceInfo)) {
            this.shopdetails.distance = distanceInfo
            if (this.shopdetails.distance < this.shopdetails.minimum_km) {   // Below 3 kilometers
              localStorage.setItem("delivery_charges", String(this.shopdetails.minimum_del_charge));
              this.shopdetails.delivery_charges = this.shopdetails.minimum_del_charge;
              this.shopdetails.extradistance = 0;
            } else {
              this.shopdetails.extradistance = this.shopdetails.distance - this.shopdetails.minimum_km;
              var del_charges = Math.round((this.shopdetails.extradistance * this.shopdetails.per_km_chargers) + Number(this.shopdetails.minimum_del_charge));
              localStorage.setItem("delivery_charges", String(del_charges));
              this.shopdetails.delivery_charges = del_charges;
            }
            localStorage.setItem("set_delivery_distance_status", "1");
            this.maindatafunction2();
            (await loading).dismiss()
          } else {
            localStorage.setItem("set_delivery_distance_status", "0");
            this.loadCartItems();
            (await loading).dismiss();
            this.serviceNotAvailableFunction('distance');
          }
        } catch (error) {
          console.error('Error fetching distance:', error);
          localStorage.setItem("set_delivery_distance_status", "0");
          this.loadCartItems();
          (await loading).dismiss();
          this.serviceNotAvailableFunction('location_error');
        }
        this.distanceLoading = false;
      } else {
        this.maindatafunction2();
        (await loading).dismiss()
      }
    } catch (error) {
    }
  }

  async maindatafunction2() {
    // const loadings = this.presentLoadings()
    const loading = await this.presentLoadings();
    this.shopdetails.slot_order = this.shopdetails?.slot_order || 0;
    this.getcoupons(this.shopdetails);
    if (this.shopdetails.deliveryType == 1) {
      this.deliveryType = this.shopdetails.deliveryType;
      this.selectedTime = this.shopdetails.selectedTime;
    }
    this.data = localStorage.getItem('cartData');
    this.cartdata = [];
    if (this.data) {
      try {
        this.cartdata = JSON.parse(this.data);
        this.banner_item_status = this.cartdata.find((item: any) => item.banner_item_status === 1) ? 1 : 0;
        this.cartdata.forEach((obj: any) => {
          const extra = parseFloat(obj.total_extra_item_price) || 0;
          const single_extra_item_price = parseFloat(obj.single_extra_item_price) || 0;
          const selling = parseFloat(obj.org_selling_price) || 0;
          const actual = parseFloat(obj.org_actual_price) || 0;
          obj.selling_price = selling + single_extra_item_price;
          obj.actual_price = actual + single_extra_item_price;
          obj.single_extra_item_price = single_extra_item_price;
        });
      } catch (error) {
      } finally {
        (await loading).dismiss()
      }
      // Fetch category details and offer
      const category_data = { id: this.shopdetails.category_id };
      this.api.getcategorydetails(category_data).subscribe(async (res: any) => {
        this.categorydata = res.data[0];
        const offerAmount = res.data[0].order_offer_amount;
        this.order_offer_amount = offerAmount;
        this.valid_offer_amount = offerAmount ? Number(offerAmount) : 0;
        this.updateGrandTotal();
        (await loading).dismiss()
      }, async error => {
        this.updateGrandTotal();
        (await loading).dismiss()
      });
    }
    // Check if cart is empty
    if (this.cartdata.length === 0) {
      this.nodata = true;
    } else {
      const loading = await this.loadingCtrl.create({
        spinner: 'bubbles',
        cssClass: 'custom-loading'
      });
      this.nodata = false;
    }
  }

  showprescription: boolean = false;
  onPrescriptionUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedPrescription = reader.result as string;
        this.showprescription = true;
        this.prescriptionstatus = false;
      };
      reader.readAsDataURL(file);
    }
  }

  checkprescriptionstatus() {
    this.prescriptionRequired = this.cartdata.some((item: any) => item.prescription_required === 1);
    this.prescriptionstatus = this.cartdata.some((item: any) => item.prescription_required === 1);
  }

  removePrescription() {
    this.uploadedPrescription = null;
    this.prescriptionRequired = true;
    this.prescriptionstatus = true;
    this.showprescription = false;
  }

  calculateGrandTotal(items: any[]): number {
    return items.reduce((total, item) => total + item.itemsamount, 0);
  }

  goBack() {
    if (localStorage.getItem("path_name") == "basket") {
      this.navCtrl.navigateRoot('/home');
    } else {
      this.navCtrl.back();
    }
  }

  coupons: any = [];
  orderTypeswe: any = [];
  slots: any;
  commonapis: any
  coupon_show: boolean = false;

  getcoupons(shopdetails: any) {
    var data = {
      location_id: localStorage.getItem('location_id'),
      coupon_category_id: localStorage.getItem('category_id'),
      shop_id: shopdetails.shop_id
    }
    this.api.coupon_list(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.coupons = res.data
        console.log(this.coupons);

        if (this.coupons.length == 0) {
          this.coupon_show = true
        }
      }
    }, error => { })


    this.api.getpaymentslist(localStorage.getItem('location_id')).subscribe((res: any) => {
      if (res.status == 200) {
        this.locationdetails = res.data[0];
        console.log(this.locationdetails);

        // Calculate delivery boy charges now that locationdetails is available
        if (this.shopdetails.distance && this.locationdetails) {
          if (this.shopdetails.distance < this.locationdetails.del_minimum_km) {
            localStorage.setItem("deliveryboy_delivery_charges", String(this.locationdetails.del_minimum_del_charge));
            this.shopdetails.deliveryboy_delivery_charges = this.locationdetails.del_minimum_del_charge;
          } else {
            this.shopdetails.del_extradistance = this.shopdetails.distance - this.locationdetails.del_minimum_km;
            var deliveryboy_delivery_charges = Math.round((this.shopdetails.del_extradistance * this.locationdetails.del_per_km_chargers) + Number(this.locationdetails.del_minimum_del_charge));
            localStorage.setItem("deliveryboy_delivery_charges", String(deliveryboy_delivery_charges));
            this.shopdetails.deliveryboy_delivery_charges = deliveryboy_delivery_charges;
            console.log(this.shopdetails.distance, deliveryboy_delivery_charges);
          }
        }

        const payment_type = Number(this.locationdetails.payment_type);

        // Reset array
        this.orderTypeswe = [];

        if (payment_type === 0) {
          this.orderTypeswe = [
            { label: 'Cash on Delivery', selected: false }
          ];
        }
        else if (payment_type === 1) {
          this.orderTypeswe = [
            { label: 'Pay Online', selected: false }
          ];
        }
        else if (payment_type === 2) {
          this.orderTypeswe = [
            { label: 'Pay Online', selected: false },
            { label: 'Cash on Delivery', selected: false }
          ];
        }
        this.selectedPaymentType = this.orderTypeswe[0].label;
        console.log(this.orderTypeswe, "order types");
      }
    }, error => { });

    this.api.getslotdates(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.dateOptions = [];
        this.dateOptions = res.data;
        this.selectedDate = this.dateOptions[0];
        this.selectDate(this.dateOptions[0])
      }
    }, error => {
    })

    this.category_id = localStorage.getItem('category_id');
    if (this.category_id == 4) {
      this.order_type = 0;
      this.showslots = 1;
    } else {
      this.order_type = 0;
      this.showslots = 0;
      this.selectedTime = 'Fast Delivery';
    }
  }

  category_id: any;
  order_type: any;
  showslots: any;

  increaseQuantity(item: any) {
    item.itemscount++;
    item.itemsamount = item.selling_price * item.itemscount;
    item.item_gst_amount = (item.item_gst * item.itemsamount) / 100;
    item.savingsamount = item.savingitemprice * item.itemscount;
    item.total_extra_item_price = item.single_extra_item_price * item.itemscount;
    this.toggleCoupon(1, this.selectedCoupon)
    this.updateGrandTotal();
  }

  decreaseQuantity(item: any) {
    if (item.itemscount > 1) {
      item.itemscount--;
      item.itemsamount = item.selling_price * item.itemscount;
      item.item_gst_amount = (item.item_gst * item.itemsamount) / 100;
      item.savingsamount = item.savingitemprice * item.itemscount;
      item.total_extra_item_price = item.single_extra_item_price * item.itemscount;
    } else {
      this.cartdata = this.cartdata.filter((i: any) => i.id !== item.id);
    }
    this.toggleCoupon(1, this.selectedCoupon);
    this.updateGrandTotal();
    if (this.cartdata.length == 0) {
      localStorage.removeItem('cartData');
      localStorage.setItem("set_delivery_distance_status", "0");
      localStorage.removeItem('order_distance');
      localStorage.removeItem('order_delivery_charges');
      localStorage.removeItem('order_extradistance');
      localStorage.removeItem('cart_created_at');
      this.nodata = true;
    }
  }

  removeItem(item: any) {
    this.cartdata = this.cartdata.filter((i: any) => i.id !== item.id);
    this.updateGrandTotal();
    if (this.cartdata.length == 0) {
      localStorage.removeItem('cartData');
      localStorage.setItem("set_delivery_distance_status", "0");
      localStorage.removeItem('order_distance');
      localStorage.removeItem('order_delivery_charges');
      localStorage.removeItem('order_extradistance');
      localStorage.removeItem('cart_created_at');
      this.nodata = true;
    }
  }

  savings: number = 0;
  packing_charges: any = 0;
  delivery_charges_gst: number = 0;
  handling_charges: number = 0;
  donation_charges: number = 0;
  total_packing_charges: number = 0;
  // packingchargergst_amount: number = 0;
  maindonation_charges: number = 0;
  order_offer_amount: number = 0;
  valid_offer_amount: any = 0;
  itemsstrikeamount: any = 0;


  async updateGrandTotal() {

    this.total_packing_charges = 0;
    if (this.cartdata.length != 0) {
      const loading = this.presentLoadings();
      if (this.cartdata.length === 0) {
        this.grand_total = 0;
        this.totalItems = 0;
        await (await loading).dismiss();
      }
      this.totalItems = this.cartdata.reduce((count: number, item: any) => count + Number(item.itemscount), 0);

      this.itemstotalamount = this.cartdata.reduce((total: number, item: any) => total + Number(item.itemsamount), 0);

      this.total_actual_amount = this.cartdata.reduce((total: number, item: any) => total + (Number(item.actual_price) * Number(item.itemscount)), 0);

      const item_gst_amount = this.cartdata.reduce((total: number, item: any) => total + (Number(item.item_gst_amount)), 0);

      this.savings = this.total_actual_amount - this.itemstotalamount;

      // if (this.shopdetails.shop_gst_number == "Not Applicable") {
      //   this.shop_gst_fee = 0;
      //   this.packing_gst_fee = 0;
      //   this.item_total_gst_fee = 0;
      // } else {
      this.packing_gst_fee = (this.shopdetails.packing_charges * this.gst_percentage) / 100;
      this.item_total_gst_fee = item_gst_amount;
      this.shop_gst_fee = (this.packing_gst_fee + this.item_total_gst_fee);
      // }


      this.packing_charges = this.shopdetails.packing_charges;
      this.total_packing_charges = this.packing_charges + this.packing_gst_fee;
      this.handling_charges_gst_fee = (this.gst_percentage * this.handling_charges) / 100;
      this.total_bill_value_gst_fee = (this.handling_charges_gst_fee + this.shop_gst_fee);
      var saved_delivery_charges = 0;
      if (this.itemstotalamount > this.valid_offer_amount) {
        this.saved_delivery = true;
        this.delivery_fixed_charges = 0;
        saved_delivery_charges = this.commonapis.delivery_fixed_charges;
      } else {
        this.saved_delivery = false;
        this.delivery_fixed_charges = this.commonapis.delivery_fixed_charges;
        saved_delivery_charges = 0;
      }
      this.final_del_charges = Number(this.shopdetails.delivery_charges) + Number(this.delivery_fixed_charges ?? 0);
      const extra_total_charges = Number(this.packing_charges) + Number(this.total_bill_value_gst_fee) + Number(this.handling_charges) + Number(this.surcharges) +
        Number(this.maindonation_charges) + Number(this.final_del_charges) + Number(this.donation_charges);
      this.itemsstrikeamount = extra_total_charges + Number(this.total_actual_amount) + Number(saved_delivery_charges);
      this.total_saving_amount = Number(this.coupon_discount_amount) + Number(this.savings) + Number(saved_delivery_charges);
      this.sub_grand_total = (extra_total_charges + Number(this.itemstotalamount))
      let final_total = (extra_total_charges + Number(this.itemstotalamount)) - Number(this.coupon_discount_amount);
      this.grand_total = parseFloat(final_total.toFixed(2));

      await (await loading).dismiss();

      this.order_payments = {
        item_total_gst_fee: this.item_total_gst_fee,
        packing_charges: this.shopdetails?.packing_charges,
        packing_gst_fee: this.packing_gst_fee,
        handling_charges_gst_fee: this.handling_charges_gst_fee,
        item_total_gst_fee_packing_charges: this.item_total_gst_fee + this.shopdetails?.packing_charges,
        final_del_charges: this.final_del_charges,
        minimum_km: this.shopdetails?.minimum_km,
        minimum_del_charge: this.shopdetails?.minimum_del_charge,
        per_km_chargers: this.shopdetails?.per_km_chargers,
        extradistance_chargers: (this.shopdetails.extradistance * this.shopdetails?.per_km_chargers),
        delivery_fixed_charges: this.delivery_fixed_charges,
        platform_fee: this.handling_charges,
        surcharges: this.surcharges,
        delivery_partner_tip: this.maindonation_charges,
        grand_total: this.grand_total
      }
      this.filteredOrderTypes();
      localStorage.removeItem('cartData');
      setTimeout(() => {
        localStorage.setItem('cartData', JSON.stringify(this.cartdata));
      }, 100);
      this.checkprescriptionstatus();
    }
  }

  // orderTypeswe = [
  //   // { label: 'Pay Online', selected: false },
  //   { label: 'Cash on Delivery', selected: false }
  // ];

  orderTypes: any = []

  filteredOrderTypes() {
    const offerAmount = 10000000
    if (this.grand_total <= (offerAmount || 10000000)) {
      this.orderTypes = this.orderTypeswe;
    } else {
      this.orderTypes = this.orderTypeswe.filter((type: any) => type.label === 'Pay Online');
      console.log(this.orderTypes);

      this.selectedPaymentType = this.orderTypes[0].label;
      this.payment_type = 'Pay Online';
    }
  }

  gotomap() {
    this.navCtrl.navigateForward('delivery-map');
  }

  submitpayment(id: any) {
    this.gotomap();
  }

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }


  setslot(i: any) {
    if (i == 0) {
      this.order_type = 0;
      this.selectedTime = 'Fast Delivery';
      this.slottimingmodal = false;
      this.deliveryType = 0;
    }
    else {
      this.order_type = 1;
      this.slottimingmodal = true;
    }
  }

  // -----------------------------------------Coupons -------------------------------------
  selectedCouponid: any = '';
  selectedCoupon: any = '';
  originalTotal: number = 0;
  coupon_discount_amount: number = 0;
  gst_percentage: number = 0;
  payment_type: any;
  selectedOrderType: string = '';

  ngOnInit() {
  }

  isCouponValid(coupon: any): boolean {
    return this.itemstotalamount < coupon.coupon_upto_price;
  }

  getErrorMessage(coupon: any): string {
    if (this.itemstotalamount < coupon.coupon_upto_price) return `Minimum order value must be ₹${coupon.coupon_upto_price}.`;
    return '';
  }

  async removecoupon(id: any) {
    if (this.selectedCoupon) {
      if (id === 0) return this.toggleCoupon(0, this.selectedCoupon);
      const alert = await this.alertController.create({
        header: 'Remove Coupon',
        mode: 'ios',
        message: 'Are you sure you want to remove this coupon?',
        buttons: [
          { text: 'No', role: 'cancel' },
          { text: 'Yes', handler: () => this.toggleCoupon(1, this.selectedCoupon) }
        ]
      });
      await alert.present();
    }

  }

  async toggleCoupon(id: any, coupon: any) {
    if (id == 1) {
      this.selectedCouponid = '';
      if (typeof coupon === 'object' && coupon !== null) {
        coupon.applied = false;
      } else {
        coupon = { applied: false };
      }
      this.selectedCoupon = '';
      this.coupon_discount_amount = 0;
      this.closeModal();
      this.updateGrandTotal();
    } else {
      this.coupons.forEach((c: any) => c.applied = false);
      coupon.applied = true;
      this.selectedCoupon = coupon;
      this.closeModal();
      console.log(this.selectedCoupon);
      if (this.itemstotalamount >= this.selectedCoupon.coupon_upto_price) {
        var discount = Math.round((this.itemstotalamount * this.selectedCoupon.coupon_percentage) / 100);

        if (discount <= this.selectedCoupon.coupon_max_price_limit) {
          this.coupon_discount_amount = discount;
          this.updateGrandTotal();
        } else {
          this.coupon_discount_amount = this.selectedCoupon.coupon_max_price_limit;
          this.updateGrandTotal();
        }
        this.selectedCouponid = coupon.id;
        const successAlert = await this.alertCtrl.create({
          mode: 'ios',
          header: ` ${this.selectedCoupon.coupon_name} applied successfully!`,
          buttons: ['OK']
        });
        await successAlert.present();
      } else {
        this.selectedCouponid = '';
        const successAlert = await this.alertCtrl.create({
          mode: 'ios',
          header: `Coupon could not be applied.`,
          buttons: ['OK']
        });
        await successAlert.present();
      }
    }
  }

  filteredCoupons: any = []

  searchCoupons() {
    if (!this.searchQuery) {
      return;
    }
    console.log(this.searchQuery, this.coupons)
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredCoupons = this.coupons.filter((coupon: any) =>
      coupon.coupon_name.toLowerCase() == query   // 🔹 exact match only
    );
  }


  async gotomaplocation() {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
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
              this.openlogin();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.navCtrl.navigateForward('default-address');
      localStorage.setItem('path_name', 'basket');
    }
  }

  sub_array: any = []
  async gotopayment() {
    console.log("------------------  1")
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
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
              localStorage.setItem('path_name', 'basket');
              // this.navCtrl.navigateRoot('login');
              this.openlogin()
            },
          },
        ],
      });
      await alert.present();
      console.log("------------------ 2 ")
    } else {
      console.log("------------------3")
      if (localStorage.getItem('name') == '' || localStorage.getItem('name') == null || localStorage.getItem('name') == 'null' || localStorage.getItem('name') == undefined || localStorage.getItem('name') == 'undefined') {
        console.log("------------------ 4 ")
        this.namemodal = true;
      } else {
        console.log("------------------ 5")
        localStorage.setItem('path_name', 'basket');
        this.navCtrl.navigateForward('default-address');
      }
    }
  }

  namemodal = false;

  closenammemodal() {
    this.namemodal = false;
  }

  opennammemodal() {
    this.namemodal = true;
  }

  submitname(customer_name: any, customer_mobile_number: any) {
    var data = {
      name: customer_name,
      number: localStorage.getItem('number')
    }
    this.customer_mobile_number = customer_mobile_number;
    this.api.updatename(data).subscribe(async (res: any) => {

    })
    this.namemodal = false;
    localStorage.setItem('name', customer_name);
    this.customer_name = customer_name;
  }

  //--------------------------------------------------------------------
  modalwe = false;

  opencodmodal() {
    this.modalwe = true;
  }
  close() {
    this.modalwe = false;
  }

  billmodal = false;

  openbill() {
    this.billmodal = true;
  }
  closebill() {
    this.billmodal = false;
  }

  status: any = ''
  //----------------------------------------------------------------------

  async checkloginandpay() {
    if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
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
              localStorage.setItem('path_name', 'basket');
              this.navCtrl.navigateRoot('login');
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.get()
    }
  }

  get() {
    if (this.paymentstuus == 0) {
      alert('Select the Payment Type');
    } else {
      if (this.payment_type == 'Pay Online') {
        this.status = 7;
        var data = {
          razorpay_payment_id: '',
          razorpay_order_id: '',
        }
        this.orderplaced(data);
      } else {
        this.status = 0;
        var data = {
          razorpay_payment_id: '',
          razorpay_order_id: '',
        }
        this.orderplaced(data)
      }
    }
  }

  insert_id: any;

  async orderplaced(response: any) {

    if (!this.customer_name) {
      this.namemodal = true;
    } else {
      //---------------------Dont Remove ------------------------------
      if (this.itemstotalamount <= this.shopdetails?.minimum_order) {
        this.minimumorderamountalert(this.shopdetails?.minimum_order);
      } else {
        this.payorder(response);
      }
      //---------------------Dont Remove ------------------------------
      // this.payorder(response);
      // console.log('Pradep IN ')
    }
    // }
  }

  async payorder(response: any) {
    if (this.payment_type == 'Pay Online') {
      const loading = await this.loadingCtrl.create({
        spinner: 'bubbles',
        cssClass: 'custom-loading'
      });
      await loading.present();
      var data = {
        order_amount: 1 * 100,
        // order_amount: this.grand_total * 100,
        razorpay_secret_key: this.locationdetails.razorpay_secret_key,
        razorpay_key: this.locationdetails.razorpay_key
      }
      console.log(data);

      this.api.generateorderid(data).subscribe(async (res: any) => {
        loading.dismiss();
        this.onlineorderplaced(response, res.orderId.id, res.payment_key_id);
      }, error => {
        loading.dismiss();
      })
    } else {
      this.onlineorderplaced(response, '', '')
    }
  }

  async onlineorderplaced(response: any, razorpay_order_id: any, payment_key_id: any) {
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();

    this.sub_array = this.cartdata.map((item: any) => ({
      item_name: item.item_name + (item.final_more_itmes ? ' - ' + item.final_more_itmes : ''),

      item_image: item.item_image,
      item_id: item.id,
      category_id: localStorage.getItem('category_id'),
      sub_category_id: localStorage.getItem('sub_category_id'),
      category_name: localStorage.getItem('category_name'),
      sub_category_name: localStorage.getItem('sub_category_name'),
      actualitem_price: Number(item.actual_price),
      item_price: Number(item.selling_price),
      sub_item_count: item.itemscount,
      item_total_amount: item.itemsamount,
      filter_name: "tets",
      item_description: item.item_description,
      saving_price: item.savingitemprice,
      shop_id: this.shopdetails.shop_id,
      filter_one: "test",
      rack_code: item.rack_code,
      extra_items: item.final_more_itmes,
      item_gst: item.item_gst,
      item_gst_amount: item.item_gst_amount
    }));

    const slotDate = this.shopdetails?.slot_date || this.getCurrentDate();
    var data = {
      actual_total_amount: (this.itemstotalamount * 1) + (this.savings * 1),
      customer_id: localStorage.getItem('usr_id'),
      customer_name: this.customer_name,
      customer_mobile_number: this.customer_mobile_number,
      category_id: this.shopdetails.category_id,
      sub_category_id: localStorage.getItem('sub_category_id'),
      admin_percentage: this.shopdetails.admin_percentage,
      item_count: this.totalItems,
      total_amount: this.itemstotalamount,
      total_saving_amount: this.savings,
      coupon_amount: this.coupon_discount_amount !== undefined ? this.coupon_discount_amount : 0,
      delivery_charges: this.final_del_charges,
      deliveryboy_delivery_charges: localStorage.getItem('deliveryboy_delivery_charges'),
      grand_total: this.grand_total,
      location_id: localStorage.getItem('location_id'),
      location_name: localStorage.getItem('location_name'),
      payment_type: this.payment_type,
      payment_id: response.razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      order_instructions: this.note,
      coupon_type: '1',
      coupon_id: this.selectedCoupon.id !== undefined ? this.selectedCoupon.id : 0,
      delivery_address: this.locationaddress,
      order_latitude: this.order_latitude,
      order_longitude: this.order_longitude,
      // slot_timings: this.shopdetails?.slot_date + " " + this.selectedTime,
      order_distance: this.shopdetails.distance,
      ext_del_charge: "0",
      shop_id: this.shopdetails.shop_id,
      user_player_id: localStorage.getItem('player_id'),
      order_type: this.shopdetails.order_type || 0,
      delivery_charges_gst: this.delivery_charges_gst,
      handling_charges: this.handling_charges,
      surcharges: this.surcharges,
      packing_charges: this.shopdetails.packing_charges,
      packing_charges_gst: this.packing_gst_fee,
      donation_charges: this.donation_charges,
      order_status: this.status,
      delivery_instruction: this.selectedInstruction,
      total_bill_value_gst_fee: this.total_bill_value_gst_fee,
      delivery_partner_tip: this.maindonation_charges,
      order_payments: this.order_payments,
      gstonplatform_fee: this.handling_charges_gst_fee,
      sub_order_array: this.sub_array,
      total_item_gst_amount: this.item_total_gst_fee,
      prescription_image: this.uploadedPrescription || "",
      prescriptionRequired: this.prescriptionRequired,
      // slot_indication:this.shopdetails.slot_order,
      slot_indication: this.deliveryType,
      // order_date: this.shopdetails?.slot_date,
      // slot_date: this.shopdetails?.slot_date,
      slot_time: this.shopdetails?.slot_time,
      order_date_time: this.shopdetails.order_date_time,
      deliveryType: this.deliveryType,
      note: this.note,
      delivery_fixed_charges: this.delivery_fixed_charges,
      slot_timings: slotDate + " " + this.selectedTime,
      order_date: slotDate,
      slot_date: slotDate,
    }
    console.log(data);

    this.api.orderplaced(data).subscribe(async (res: any) => {
      loading.dismiss();
      if (res.status == 200) {
        this.insert_id = res.id;
        if (this.payment_type == 'Pay Online') {
          this.openrazorpay(razorpay_order_id, payment_key_id);
        } else {
          this.successmodal = true;
          setTimeout(() => {
            this.successmodal = false;
            localStorage.removeItem('cartData');
            localStorage.setItem("set_delivery_distance_status", "0");
            localStorage.removeItem('order_distance');
            localStorage.removeItem('order_delivery_charges');
            localStorage.removeItem('order_extradistance');
            localStorage.removeItem('cart_created_at');
            localStorage.setItem('address_store', '0')
            setTimeout(() => {
              this.navCtrl.navigateForward('orders', {
                queryParams: {
                  order_cancle_type: 0,
                  order_id: this.insert_id,
                  orderindication: 1
                }
              });
            }, 100);
          }, 2500);
        }
      } else {
        this.presentMerchantClosedAlert();
      }
    }, error => {
      loading.dismiss();
    })
  }
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  async presentMerchantClosedAlert() {
    const alert = await this.alertController.create({
      header: 'Notice',
      message: 'Sorry for the inconvenience. The current merchant is closed. Would you like to continue with another merchant?',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            // Redirect to home page
            this.navCtrl.navigateRoot('/home');
          }
        }
      ]
    });
    await alert.present();
  }

  serviceUnavailableReason: 'distance' | 'location_error' | 'no_location' | null = null;

  serviceNotAvailableFunction(reason: 'distance' | 'location_error' | 'no_location') {
    this.serviceUnavailableReason = reason;
  }

  getServiceUnavailableTitle(): string {
    switch (this.serviceUnavailableReason) {
      case 'distance': return 'Shop Too Far Away';
      case 'location_error': return 'Location Not Found';
      case 'no_location': return 'No Delivery Address';
      default: return 'Service Unavailable';
    }
  }

  getServiceUnavailableMessage(): string {
    switch (this.serviceUnavailableReason) {
      case 'distance': return 'This shop is too far from your current delivery address. Please change your address or try a nearby shop.';
      case 'location_error': return 'We couldn\'t determine your delivery location. Please update your address so we can calculate delivery.';
      case 'no_location': return 'Please set a delivery address to continue with your order.';
      default: return 'Something went wrong. Please try again.';
    }
  }

  getServiceUnavailableIcon(): string {
    switch (this.serviceUnavailableReason) {
      case 'distance': return 'assets/icon/store.png';
      default: return 'assets/icon/home/location-pin.svg';
    }
  }

  loadCartItems() {
    const data = localStorage.getItem('cartData');
    if (data) {
      try {
        this.cartdata = JSON.parse(data);
        this.totalItems = this.cartdata.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        this.cartdata.forEach((obj: any) => {
          const single_extra_item_price = parseFloat(obj.single_extra_item_price) || 0;
          const selling = parseFloat(obj.org_selling_price) || 0;
          const actual = parseFloat(obj.org_actual_price) || 0;
          obj.selling_price = selling + single_extra_item_price;
          obj.actual_price = actual + single_extra_item_price;
        });
      } catch (e) {
        this.cartdata = [];
      }
    }
  }

  onChangeAddress() {
    this.serviceUnavailableReason = null;
    this.navCtrl.navigateForward('default-address');
  }

  onBrowseShops() {
    this.serviceUnavailableReason = null;
    this.navCtrl.navigateRoot('/home');
  }

  async openrazorpay(order_id: any, payment_key_id: any) {
    const options = {
      description: `Payment for Order #${order_id}`,
      image: "",
      currency: 'INR',
      key: payment_key_id,
      order_id: order_id,
      amount: (this.grand_total * 100).toString(), // 🔧 converted to string
      name: localStorage.getItem('name') || 'Zeengi',
      prefill: {
        name: localStorage.getItem('name') || '',
        email: '', // Consider removing if empty
        contact: localStorage.getItem('number') || '',
      },
      theme: {
        color: '#db7434ff',
      },
      modal: {
        ondismiss: () => {
          // alert('dismissed');
        },
        onsuccess: () => {
          // alert('successCallback');
        },
        fullscreen: true, // ✅ Fullscreen modal enabled
      },
    };

    try {
      const data = await Checkout.open(options);
      console.log(data);
      this.updatepayment(data.response);
      console.log(JSON.stringify(data));
    } catch (error) {
      console.log('Razorpay Checkout Error:', error);
    }
  }

  updatepayment(data: any) {
    console.log(data);
    var datare = {
      payment_id: data.razorpay_payment_id,
      razorpay_order_id: data.razorpay_order_id,
      id: this.insert_id,
      user_player_id: localStorage.getItem('player_id'),
      shop_id: this.shopdetails.shop_id,
      slot_indication: this.deliveryType
    }
    this.api.updatepaymetdetails(datare).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.successmodal = true;
        setTimeout(() => {
          this.successmodal = false;
          localStorage.removeItem('cartData');
          localStorage.setItem("set_delivery_distance_status", "0");
          localStorage.removeItem('order_distance');
          localStorage.removeItem('order_delivery_charges');
          localStorage.removeItem('order_extradistance');
          localStorage.setItem('address_store', '0');
          localStorage.removeItem('cart_created_at');
          setTimeout(() => {
            // this.navCtrl.navigateForward('orders');
            this.navCtrl.navigateForward('/orders', {
              queryParams: { orderindication: 1 }
            });
          }, 100);
        }, 2500);
      }
    })
  }

  selectedPaymentType: string = 'Payment Type'; // Default text
  paymentstuus: number = 0;
  selectOnlyOne(selectedIndex: number, name: any) {
    this.orderTypes.forEach((order: any, index: any) => {
      order.selected = index === selectedIndex;
    });
    this.payment_type = name;
    this.selectedPaymentType = name; // Update the selected payment type
    this.menuOpen = false; // Close the dropdown menu
    this.paymentstuus = 1
  }

  async showToast(message: string, color: string = 'light', duration: number = 2000) {
    const toast = await this.toastctrl.create({
      message: message,
      duration: duration,
      color: color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }


  adddonation(amount: any) {
    // this.donation_charges = amount;
    this.maindonation_charges = amount;
    this.updateGrandTotal()
  }


  cleardonation() {
    this.maindonation_charges = 0;
    this.updateGrandTotal();
    this.selectedTip = null;
  }

  searchQuery: any = ''

  menuOpen = false;


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  selectPayment(method: string) {
    this.menuOpen = false; // Close menu after selection
  }


  async openlogin() {
    const modal = await this.modalController.create({
      component: LoginPage,
      componentProps: {
        data: '',
      },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
  }
  notemodal = false;

  opennotemodal() {
    this.notemodal = true;
  }


  closenotemodal() {
    this.notemodal = false;
  }


  note: any = ''

  clearNote() {
    this.note = '';
  }


  saveNote() {
    this.modalController.dismiss(this.note);
  }


  tipAmounts = [5, 10, 20];
  selectedTip: number | null = null;
  customTip = 22;
  isCustomTip = false;


  selectTip(amount: number) {
    this.selectedTip = amount;
    this.isCustomTip = false;
  }


  enterCustomTip() {
    this.isCustomTip = true;
    this.selectedTip = this.customTip;
  }


  successmodal = false;


  opensucdessmodal() {
    this.successmodal = true;
  }


  closesuccessmodal() {
    this.successmodal = false;
  }


  async showPlatformFeeAlert() {
    const alert = await this.alertController.create({
      header: 'Platform Fee',
      message: 'This small fee helps us pay the bills so that we can keep Zeengi running.',
      buttons: ['Okay'], // Button to close the alert
    });
    await alert.present();
  }


  async minimumorderamountalert(billvalues: any) {
    const alert = await this.alertController.create({
      header: 'Minimum Order Amount',
      message: `Please note: Your order must be above ₹${billvalues} to proceed.`,
      buttons: ['Okay'],
    });
    await alert.present();
  }


  async showSurchargeAlert2() {
    const alert = await this.alertController.create({
      header: 'Additional Surcharge',
      message: 'A small surcharge may apply during certain conditions to help us maintain timely and quality service. We appreciate your understanding.',
      buttons: ['Okay'],
    });

    await alert.present();
  }


  async showdeliveryFeeAlert() {
    this.deliverymodalopens = true;
  }


  showdeliveryFeeclose() {
    this.deliverymodalopens = false;
  }


  async showgstmarchantFeeAlert() {
    this.gstmarchantfeemodel = true;
  }


  async showgstmarchantFeeclose() {
    this.gstmarchantfeemodel = false;
  }


  selectDate(date: any) {
    this.selectedDate = date;
    this.api.getslot_booking(date).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.totaltimeslots = res.data;
        this.timeOptions = res.data.map((slot: any) => slot.slot_timings);
        // this.selectedTime=this.timeOptions[0];
      }
    }, error => { })
  }


  onScrollTime() {
    if (!this.timeScroll) return;
    const container = this.timeScroll.nativeElement;
    const center = container.getBoundingClientRect().top + container.offsetHeight / 2;

    const items = container.querySelectorAll('.time-item');
    let closestItem: string | null = null;
    let closestDistance = Infinity;

    items.forEach((item: HTMLElement) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(center - itemCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item.innerText;
      }
    });
    this.selectedTime = closestItem;
  }


  closseslottimingmodal() {
    this.slottimingmodal = false;
  }


  selectslotanddate() {
    const end_time = (this.totaltimeslots as { slot_timings: string; end_time: string }[])
      .find(obj => obj.slot_timings === this.selectedTime)?.end_time;
    const checktimeslot = {
      end_time: end_time,
      selectedDate: this.selectedDate,
      location_id: this.shopdetails.location_id,
      shop_id: this.shopdetails.shop_id
    }
    this.api.checkshop_slot_timings(checktimeslot).subscribe(async (res: any) => {
      if (res.data[0].shop_active_status == 0) {
        // kiran kk
        const startTime24 = this.extractStartTimeTo24Hour(this.selectedTime);
        this.deliveryType = 1;
        this.order_type = this.shopdetails.order_type;
        // this.shopdetails.slot_order=1;
        this.shopdetails.order_date = this.selectedDate.slot_date;
        this.shopdetails.slot_date = this.selectedDate.slot_date;
        this.shopdetails.slot_time = startTime24
        this.shopdetails.order_date_time = this.selectedDate.slot_date + " " + startTime24;
      } else {
        this.deliveryType = 0;
        this.order_type = this.shopdetails.order_type;
        const slot_time = this.selectedTime + ": Currently, we are not servicing this slot.";
        this.presentToast(slot_time);
      }
    })
    // this.deliveryType = 1;
    this.slottimingmodal = false;
  }


  selectTime(time: string) {
    this.selectedTime = time; // Set the selected time
  }


  callbackpage() {
    const callbackstoragedata = JSON.parse(localStorage.getItem("callbackdata") || '{}');
    if (this.callbackdata && this.callbackdata.pageback) {
      this.navCtrl.navigateForward(this.callbackdata.pageback, {
        queryParams: {
          data: JSON.stringify(this.callbackdata.pagebackdata)
        }
      });
    } else if (callbackstoragedata.pageback) {
      this.navCtrl.navigateForward(callbackstoragedata.pageback, {
        queryParams: {
          data: JSON.stringify(callbackstoragedata.pagebackdata)
        }
      });
    } else {
      this.navCtrl.navigateRoot('/home');
    }
  }


  getdelivery_instructions() {
    this.api.delivery_instructions().subscribe(async (res: any) => {
      this.deliveryInstructions = res.data;
    })
  }


  openinstructionmodal() {
    this.instructionmodel = true;
  }


  closeinstructionmodal() {
    this.instructionmodel = false;
  }


  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      cssClass: 'custom-toast'  // Add your custom class here
    });
    await toast.present();
  }


  extractStartTimeTo24Hour(timeRange: any): string {
    const startTime12h = timeRange.split('-')[0].trim(); // "06:30PM"
    const [time, modifier] = startTime12h.toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.trim().split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}:00`;
  }

  handleDismiss(event: any) {
    const role = event.detail.role;
    console.log('Modal dismissed with role:', role); // e.g., "backdrop", "cancel", "done";
    this.closebill()
  }

  async distance_caliculation(distance_latlng: any): Promise<any> {
    const loadingWrapper = await this.presentLoading();
    const dismissLoader = loadingWrapper.dismiss;
    try {
      const res: any = await firstValueFrom(this.api.getorder_distance(distance_latlng));
      console.log(res.data[0]);
      await dismissLoader();
      if (res.status === 200) {
        return res.data[0];
      } else {
        return 0;
      }
    } catch (error) {
      console.error("API error:", error);
      await dismissLoader();
      return 0;
    }
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

  adddonations() {
    this.donation_charges = this.commonapis.donation_charges;
    this.updateGrandTotal();
  }

  removedonation() {
    this.donation_charges = 0;
    this.updateGrandTotal();
  }

  async presentLoadings(message: string = 'Please wait...') {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
      cssClass: 'modern-loading'
    });
    await loading.present();
    return loading;
  }



}
// -----------------------------------------Coupons -------------------------------------


