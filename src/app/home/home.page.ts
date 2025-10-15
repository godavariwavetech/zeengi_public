import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, AnimationController, IonContent, LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import Swiper from 'swiper';
import { App } from '@capacitor/app';
declare const google: any;
import { VegmodeModalPage } from '../vegmode-modal/vegmode-modal.page';
// Inject both controllers in your constructor

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  toggleValue = false;
  isScrolled = false;
  isScrolleded = false;
  @HostListener('window:scroll', [])

  // veg mode
  isVegMode = false;
  showVegAlert = false;

  vegAlertButtons = [
    {
      text: 'All Restaurants',
      role: 'cancel',
      handler: () => this.setVegMode(false),
    },
    {
      text: 'Pure Veg Only',
      handler: () => this.setVegMode(true),
    }
  ];



  setVegMode(pureVeg: boolean) {
    this.isVegMode = pureVeg;
    this.showVegAlert = false;
  }
  selectedMode: 'pure' | 'all' = 'all';  // selection before applying;

  showVegBox = false;
  vegOption = 'all';
  showVegConfirmBox = false;
  isVegModeEnabled = false;
  showVegOptions = false;
  // veg mode end

  //----------------------------------------------- Loader  ------------------------------- 
  placeholderText: string = 'Search here...';
  placeholders: string[] = ['Search Biryani...', 'Search Merchants...', 'Search Cakes...'];
  index: number = 0;
  animate: boolean = false;
  cartCount: number = 0; bannerskeletonstatus: boolean = true; category_status: boolean = true;

  //----------------------------------------------- Loader  ------------------------------- 

  @HostListener('ionScroll', ['$event'])

  onScroll(event: any) {
    const content = event.target as HTMLElement;
    content.classList.toggle('scrolled', content.scrollTop > 0);
    const offset = (event.detail as any).scrollTop;
    this.isScrolled = offset > 40;
    this.isScrolleded = offset > 100;
  }

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  scrollToTop(): void {
    this.content.scrollToTop(500); // 500ms animation
  }

  swiperConfig = {
    autoplay: {
      delay: 1000, disableOnInteraction: false
    }, loop: true
  };

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  latitude: any;
  longitude: any;
  cartdata: any = [];
  offer_banners: any = []; recommenderforyoudata: any = []; groupedRestaurants: any[][] = []; selected_category_id = 0;

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
  swiperSlideChanged(e: any) {
    const index = e.target.swiper.activeIndex
  }
  _segmentSelected(index: number) {
    this.swiper?.slideTo(index)
  }

  onSlideChange(event: any) {
  }

  selectedCategory = 'Restaurants';
  selectedCategory2: string = '';
  address: any;
  location_name: any;
  category_id: any = '1';
  menuItems: any = []
  categories: any = []
  categories2: any = [];
  filteredCategories: any = [];
  restaurants: any = [];
  inactive_restaurants: any = [];

  //-----------------------------------sub categrory-------------------------------------------

  selectCategory2(category: any) {
    this.selectedCategory = category.name;
  }

  onSlideChange2(event: any) {
  }

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer

  //-----------------------------------sub categrory-------------------------------------------
  private placeholderInterval: any;
  constructor(private route: ActivatedRoute, private api: ApiService, private route1: Router, public navctrl: NavController, private modalController: ModalController, public loadingCtrl: LoadingController, private alertController: AlertController, public toastctrl: ToastController, private animationCtrl: AnimationController, private platform: Platform) {
    if (localStorage.getItem("vegmodestatus") == "1") {
      this.isVegModeEnabled = true;
    }
    this.route.queryParams.subscribe(params => {
      const refreshStatus = params['refreshStatus'];
      if (refreshStatus == 1) {
        this.getcategory();
      }
    });
    this.application_comoonapi();
    if (localStorage.getItem('setlocation') == '' || localStorage.getItem('setlocation') == 'null' || localStorage.getItem('setlocation') == null || localStorage.getItem('setlocation') == 'undefined' || localStorage.getItem('setlocation') == undefined) {
      this.latitude = localStorage.getItem('latitude');
      this.longitude = localStorage.getItem('longitude');
      this.getaddress();
    }
    this.location_name = localStorage.getItem('location_name');
    const lat = localStorage.getItem('latitude');
    const lng = localStorage.getItem('longitude');
    if (lat && lng) {
      localStorage.setItem('setlatlongs', `${lat},${lng}`);
    }
    this.getAppVersion();
  }

  categoriesWER = [
    {
      name: 'Food',
      image: 'assets/icon/slide/f1.svg',
      description: 'On your first delivery',
      offer: 'Get 15% Off'
    },
    {
      name: 'Grocery',
      image: 'assets/icon/slide/f2.svg',
      description: 'Daily essentials at your door',
      offer: 'Save on groceries'
    },
    {
      name: 'Meat',
      image: 'assets/icon/slide/f3.svg',
      description: 'Fresh and Clean Meat',
      offer: '20% Off Today'
    },
    {
      name: 'Pickles',
      image: 'assets/icon/slide/f4.svg',
      description: 'Homemade with love',
      offer: 'Get Free Sample'
    },
    {
      name: 'Pickless',
      image: 'assets/icon/slide/f5.svg',
      description: 'Homemade with love',
      offer: 'Get Free Sample'
    }
  ];

  selectategory: string = 'Food';

  change(name: any) {
    this.selectategory = name;
  }

  cartdetails() {
    this.cartdata = [];
    const cartdata = localStorage.getItem('cartData');
    this.cartCount = 0;
    if (cartdata) {
      try {
        this.cartdata = JSON.parse(cartdata);
        this.cartdata.forEach((obj: any) => {
          this.cartCount += obj.itemscount;
        });
      } catch (error) {
      }
    }
  }

  ionViewWillEnter() {
    this.checkCartExpiration();
    this.location_name = localStorage.getItem('location_name');
    this.address = localStorage.getItem('setlocation');
    this.cartdetails();
  }

  async dismissModal() {
    await this.modalController.dismiss();
  }

  // gotocategory(a: any) {
  //   localStorage.setItem('category_id', a.category_id)
  //   this.navctrl.navigateForward('categories', {
  //     queryParams: {
  //       subcategorydata: JSON.stringify(a)
  //     }
  //   });
  //   this.dismissModal()
  // }

  gotocategory(sub_data: any) {

    // localStorage.setItem('category_id', sub_data.category_id);
    localStorage.setItem('sub_category_image', sub_data.sub_category_image);
    localStorage.setItem('sub_category_name', sub_data.sub_category_name);
    var sub_category_data = {
      search_image: sub_data.sub_category_image,
      search_text: sub_data.sub_category_name,
      sub_category_image: sub_data.sub_category_image,
      sub_category_name: sub_data.sub_category_name,
      subcategory_tag_line: sub_data.subcategory_tag_line,
      id: sub_data.id,
      location_id: localStorage.getItem("location_id"),
      table_name: "shop_subcategory_list_t",
      category_id: this.selected_category_id,
    }

    this.navctrl.navigateForward('categories', {
      queryParams: {
        shop_list_arrays: sub_data.shop_id,
        categorydata: sub_category_data
      }
    });
  }

  async canDismiss(data?: undefined, role?: string) {
    return role !== 'gesture';
  }

  appVersion: any = ''

  async getAppVersion() {
    const info = await App.getInfo();
    this.appVersion = info.version; // Retrieve the version number
    this.getversiosn();
  }

  getversiosn() {
    this.api.getappversions().subscribe(async (res: any) => {
      if (res.status == 200) {
        if (res.data[0].publicapp_version_status == 0) {
          if (res.data[0].public_app_version == this.appVersion) {
          } else {
            this.navctrl.navigateRoot('update');
          }
        }
      }
    }, error => { });
  }

  async ngOnInit() {

    // this.checkLocationStatus();

    this.getcategory();
  }

  handleRefresh(event: any) {
    this.getcategory();
    this.getshop(this.category_id, 0);
    setTimeout(() => {
      event.target.complete(); // Stop the refresher animation
    }, 2000);
  }

  getaddress() {
    this.getAddressFromCoordinates(this.latitude, this.longitude)
  }

getAddressFromCoordinates(lat: any, lng: any) {
  // Ensure numeric values
  const latitude = Number(lat);
  const longitude = Number(lng);

  console.log('Coordinates:', latitude, longitude);

  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results:any, status:any) => {
    console.log('Geocode status:', status, results);

    if (status === 'OK' && results[0]) {
      this.address = results[0].formatted_address;
      localStorage.setItem('setlatlongs', `${latitude},${longitude}`);
      localStorage.setItem('setlocation', this.address);
    } else {
      console.warn('Geocoding failed:', status);
    }
  });
}


  getbanner(category_id: any) {
    var data = {
      location_id: localStorage.getItem('location_id'),
      category_id: category_id,
      veg_mode: localStorage.getItem('vegmodestatus') ?? '0'
    }
    this.menuItems = [];
    this.bannerskeletonstatus = false;
    this.api.getbannerslist(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.menuItems = res.data;
      }
    }, error => {
      this.bannerskeletonstatus = false;
    })
  }

  getcategory() {

    var data = {
      location_id: localStorage.getItem('location_id'),
      veg_mode: localStorage.getItem('vegmodestatus') ?? '0'
    }
    this.api.getlocationctgrylist(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.categories = res.data;
        const categorylist = res.data.map((item: any) => `Search ${item.category_name}`)
        clearInterval(this.placeholderInterval);
        this.changePlaceholder(categorylist);
        this.selectedCategory = this.categories[0].category_name;
        this.selectategory = this.categories[0].category_name;
        this.selectCategory(this.categories[0]);
        // if(res.data.length==0){
        //   this.bannerskeletonstatus=false;
        //   this.category_status=false;
        // }
        this.bannerskeletonstatus = false;
        this.category_status = false;
      } else {
        this.bannerskeletonstatus = false;
        this.category_status = false;
      }
    }, error => {
      this.bannerskeletonstatus = false;
      this.category_status = false;
    })


  }




  changePlaceholder(placeholders: any) {
    this.placeholderInterval = setInterval(() => {
      this.animate = true;
      setTimeout(() => {
        this.index = (this.index + 1) % placeholders.length;
        this.placeholderText = placeholders[this.index];
        this.animate = false;
      }, 300);
    }, 3000);
  }

  selectCategory(data: any) {
    this.selected_category_id = data.id;
    this.getbanner(data.id);
    this.getofferbanners(data.id);
    // localStorage.setItem("category_details",JSON.stringify(data))
    // localStorage.setItem('category_id', data.id);
    // localStorage.setItem('category_name', data.category_name);
    // localStorage.setItem('order_offer_amount', data.order_offer_amount);
    this.selectedCategory = data.category_name;
    this.category_id = data.id;
    if (data.regular_status == 1) {
      this.getshop(data.id, data.regular_status);
    } else {
      var maindata = {
        category_id: data.id,
        location_id: localStorage.getItem('location_id'),
        veg_mode: localStorage.getItem('vegmodestatus') ?? '0'
      }
      this.getshop(data.id, 0);
      this.api.getshopsubcategorylist(maindata).subscribe(async (res: any) => {
        if (res.status == 200) {
          this.categories2 = res.data;
          localStorage.setItem('sub_category_id', res.data[0].sub_category_id);
          localStorage.setItem('sub_category_name', res.data[0].sub_category_name);
        }
      })
    }
  }



  async getshop(id: any, regular_status: any) {


    const loadingWrapper = await this.presentLoading();
    const dismissLoader = loadingWrapper.dismiss;

    try {
      const data = {
        shop_latitude: localStorage.getItem('latitude'),
        shop_longitude: localStorage.getItem('longitude'),
        location_id: localStorage.getItem('location_id'),
        category_id: id,
        shop_id: 0,
        veg_mode: localStorage.getItem('vegmodestatus') ?? '0'
      };
      this.groupedRestaurants = [];
      this.recommenderforyoudata = [];
      const recommenderSub = this.api.recomrecommended_for_you_shops(data).subscribe((res: any) => {
        if (res.data.length > 0) {
          this.recommenderforyoudata = res.data.map((shop: any) => {
            const { min, max, formatted } = this.getDeliveryTime(shop.distance);
            return {
              ...shop,
              delivery_distance: shop.distance,
              delivery_time: formatted,
              duration_org: { min, max }
            };
          });
          this.groupedRestaurants = this.chunkArray(this.recommenderforyoudata, 2);
        }
      });

      const shopListSub = this.api.getshoplist(data).subscribe(async (res: any) => {
        if (res.status === 200) {
          const active = res.data[0].filter((x: any) => x.shop_active_status === 0);
          const inactive = res.data[0].filter((x: any) => x.shop_active_status === 1);
          localStorage.setItem('restaurant_avalibility', JSON.stringify(res.data[0]));
          this.restaurants = active.map((shop: any) => {
            const { min, max, formatted } = this.getDeliveryTime(shop.distance);
            return {
              ...shop,
              delivery_distance: shop.distance,
              delivery_time: formatted,
              duration_org: { min, max }
            };
          });

          this.restaurants.forEach((r: any) => r.imageLoaded = false);
          this.inactive_restaurants = inactive.map((shop: any) => {
            const { min, max, formatted } = this.getDeliveryTime(shop.distance);
            return {
              ...shop,
              delivery_distance: shop.distance,
              delivery_time: formatted,
              duration_org: { min, max }
            };
          });

          if (regular_status === 1) {
            if (this.restaurants.length == 0) {
              this.restaurants = [];
              this.inactive_restaurants = [];
              const alert = await this.alertController.create({
                mode: 'ios',
                message: 'Grocery not available in this location.',
                buttons: ['OK']
              });
              this.getcategory();
              await alert.present();
              await dismissLoader();
              return;
            } else {
              this.navctrl.navigateForward('groceries', {
                queryParams: {
                  merchant_data: JSON.stringify(this.restaurants[0])
                }
              });
              this.restaurants = [];
              this.inactive_restaurants = [];
              await dismissLoader();
              return;
            }
            // })

          } else {
            localStorage.setItem('shopdetails', JSON.stringify(this.restaurants[0]));
            await dismissLoader();
            return;
          }
        } else {
          await dismissLoader();
        }
      }, async (error) => {
        await dismissLoader();
      });
    } catch (err) {
      await dismissLoader();
    }
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
      formatted: `${minTime} - ${maxTime} Min`
    };
  }




  gotomaplocation() {
    this.navctrl.navigateForward('default-address');
    localStorage.setItem('path_name', 'home')
  }

  gotorestaurant(data: any) {
    localStorage.setItem('shop_id', data.shop_id);
    localStorage.setItem('shopdetails', JSON.stringify(data));
    this.navctrl.navigateForward('main-resturant', {
      queryParams: {
        data: JSON.stringify(data)
      }
    });
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

  isModalOpen = false;

  open() {
    this.isModalOpen = true;
  }

  close() {
    this.isModalOpen = false;
  }

  searchstatus() {
    this.navctrl.navigateForward('search');
  }

  isToastOpen = false;

  showToast() {
    this.isToastOpen = true;
  }

  dismissToast() {
    this.isToastOpen = false;
  }

  gotoshop(id: any, banner_data: any) {
    var resturant = this.restaurants.filter((item: any) => item.shop_id == id);
    if (resturant == '') {
    } else {
      // if(banner_data.item_id==)
      resturant[0].banner_item_ids = banner_data.item_id;
      resturant[0].banner_offer_title = banner_data.banner_offer_title
      localStorage.setItem('shopdetails', JSON.stringify(resturant[0]));
      this.navctrl.navigateForward('main-resturant', {
        queryParams: {
          data: JSON.stringify(resturant[0])
        }
      });
    }
  }



  application_comoonapi() {
    this.api.application_common_api().subscribe(async (res: any) => {
      if (res.status == 200) {
        localStorage.setItem("application_common_data", JSON.stringify(res.data[0]))
      }
    }, error => {

    });
  }

  getofferbanners(category_id: any) {
    this.offer_banners = [];
    const location_data = {
      location_id: localStorage.getItem("location_id"),
      category_id: category_id,
      veg_mode: localStorage.getItem("vegmodestatus")
    }
    this.api.get_offer_banners(location_data).subscribe(async (res: any) => {
      this.offer_banners = res.data;
    })

  }

  gotoshoporders(offersdata: any) {
    localStorage.setItem('sub_category_image', offersdata.tagline_image);
    localStorage.setItem('sub_category_name', offersdata.offer_title);
    var sub_category_data = {
      search_image: offersdata.tagline_image,
      search_text: offersdata.offer_title,
      sub_category_image: offersdata.tagline_image,
      sub_category_name: offersdata.offer_title,

      subcategory_tag_line: offersdata.offer_tag_line,
      id: offersdata.id,
      location_id: localStorage.getItem("location_id"),
      table_name: "shop_subcategory_list_t",
      category_id: this.selected_category_id,
    }
    // kiran

    this.navctrl.navigateForward('categories', {
      queryParams: {
        shop_list_arrays: offersdata.shop_id,
        categorydata: sub_category_data
      }
    });
  }

  chunkArray(arr: any[], size: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
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





  // Confetti logic
  createConfetti() {
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
    const container = document.getElementById('confetti-container');
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(confetti);

      // Remove each after falling
      setTimeout(() => {
        confetti.remove();
      }, 50000);
    }
  }


  onImageLoad(event: any) {
    const imgSrc = event.target.src;

    const restaurant = this.groupedRestaurants
      .flat()
      .find((r: any) => imgSrc.endsWith(r.shop_image));

    if (restaurant) {
      restaurant.imageLoaded = true;
    }
  }



  onImageLoad1(event: any) {
    const imgSrc = event.target.src;

    const categories = this.categories
      .flat()
      .find((r: any) => imgSrc.endsWith(r.shop_image));

    if (categories) {
      categories.imageLoaded = true;
    }
  }

  onImageLoad2(event: any) {
    const imgSrc = event.target.src;

    const categories2 = this.categories2
      .flat()
      .find((r: any) => imgSrc.endsWith(r.shop_image));

    if (categories2) {
      categories2.imageLoaded = true;
    }
  }

  onImageLoad3(event: any) {
    const imgSrc = event.target.src;

    const menuItems = this.menuItems
      .flat()
      .find((r: any) => imgSrc.endsWith(r.shop_image));

    if (menuItems) {
      menuItems.imageLoaded = true;
    }
  }

  onImageLoad4(event: any) {
    const imgSrc = event.target.src;

    const offer_banners = this.offer_banners
      .flat()
      .find((r: any) => imgSrc.endsWith(r.shop_image));

    if (offer_banners) {
      offer_banners.imageLoaded = true;
    }
  }

  onImageLoad5(event: any) {
    const imgSrc = event.target.src;
    const restaurants = this.groupedRestaurants.flat().find((r: any) => imgSrc.endsWith(r.shop_image));
    if (restaurants) {
      restaurants.imageLoaded = true;
    }
  }

  onImageLoad6(event: any) {
    const imgSrc = event.target.src;

    const inactive_restaurants = this.inactive_restaurants
      .flat()
      .find((r: any) => imgSrc.endsWith(r.shop_image));

    if (inactive_restaurants) {
      inactive_restaurants.imageLoaded = true;
    }
  }


  onImageError(event: any) {
    const fallback = 'assets/icon/store.png'
    if (!event.target.src.endsWith(fallback)) {
      event.target.src = fallback;
    }
  }

  // veg mode code start 
  toggleVegBox() {
    this.showVegBox = !this.showVegBox;
  }

  applyVegFilter() {
    if (this.vegOption == "all") {
      this.isVegModeEnabled = false;
      localStorage.setItem("vegmodestatus", "0");
      this.getcategory();
    } else {
      this.isVegModeEnabled = true;
      localStorage.setItem("vegmodestatus", "1");
      this.getcategory();
    }
    this.showVegBox = false;
  }

  openMoreSettings() {
    this.showVegBox = !this.showVegBox;
  }

  async presentVegModeModal() {
    const modal = await this.modalController.create({
      component: VegmodeModalPage,
      cssClass: 'veg-mode-alert-modal',
      backdropDismiss: true,
    });

    await modal.present(); // ✅ Just show modal, nothing to destructure here

    const { data } = await modal.onDidDismiss(); // ✅ Get the result when it closes

    if (data?.confirmed) {
      this.isVegMode = false; // User clicked "Switch off"
    } else {
      this.isVegMode = true; // User chose to keep using it
    }
  }

  toggleVegWarning() {
    this.showVegConfirmBox = true;
  }

  confirmVegModeOff() {
    this.isVegMode = false;
    this.showVegConfirmBox = false;
    this.isVegModeEnabled = false;
    localStorage.setItem("vegmodestatus", "0");
    this.getcategory();
  }

  keepVegMode() {
    this.isVegMode = true;
    this.showVegConfirmBox = false;
  }

  async onToggleClick(event: Event) {
    // Prevent toggle from changing state
    event.preventDefault();
    event.stopImmediatePropagation();
    if (localStorage.getItem("vegmodestatus") == "1") {
      this.showVegConfirmBox = !this.showVegConfirmBox;
    } else {
      this.showVegBox = !this.showVegBox;
    }

  }

  selectvegmodeoption(vegOption: any) {
    this.vegOption = vegOption;
  }

  checkCartExpiration() {
    const createdAt = localStorage.getItem('cart_created_at');
    if (createdAt) {
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;

      if (now - parseInt(createdAt) > oneHour) {
        localStorage.removeItem('cartData');
        localStorage.removeItem('cart_merchant');
        localStorage.removeItem('main_shopdetails');
        localStorage.removeItem('shopdetails');
        localStorage.setItem("set_delivery_distance_status", "0");
        localStorage.removeItem('order_distance');
        localStorage.removeItem('order_delivery_charges');
        localStorage.removeItem('order_extradistance');
        localStorage.removeItem('cart_created_at');
        localStorage.setItem('address_store', '0')
      }
    }
  }

  restaurantList = [
    {
      name: 'Vantalakka Biriyani',
      image: 'assets/imgs/vantalakka.jpg',
      rating: 4.5,
      reviews: '26k+',
      time: '20–30 mins',
      tags: 'Street Food, Shake, Beverages',
      location: 'Tilak Road',
      distance: 3.0,
      badge: ''
    },
    {
      name: 'Naidu Gari Kunda Biryani',
      image: 'assets/imgs/naidu.jpg',
      rating: 4.5,
      reviews: '26k+',
      time: '20–30 mins',
      tags: 'Fried Rice, Chinese, Italian',
      location: 'Tilak Road',
      distance: 3.0,
      badge: 'EXTRA 10% off & FREE DELIVERY'
    }
  ];


}

