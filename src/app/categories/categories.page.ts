import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import Swiper from 'swiper';
import { ApiService } from '../service/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer
  swiperConfig = {
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    },
    loop: true,
    pagination: { clickable: true }
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

  menuItems: any = []




  selectedFilter = 'All';
  searchQuery: string = '';

  toggleFavorite(index: number) {
    // this.restaurants[index].isFavorite = !this.restaurants[index].isFavorite;
  }

  data: any;
  filters: any = []; sub_category_id = 0; recommenderforyoudata: any = []; groupedRestaurants: any[][] = [];
  constructor(public navctrl: NavController, public api: ApiService, private route: ActivatedRoute, public loadingCtrl: LoadingController) {


  }

  sub_category_image: any = ''
  sub_category_name: any = '';
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      try {
        // Assign category data directly

        console.log(this.categorydata);

        if (params['categorydata'] === "[object Object]") {
          this.categorydata = JSON.parse(localStorage.getItem("bagebackcategory") || 'null');
        } else {
          this.categorydata = params['categorydata'];
        }

        // Fallback assignments if available
        if (this.categorydata) {
          this.categorydata.sub_category_image = this.categorydata.sub_category_image;
          this.categorydata.sub_category_name = this.categorydata.sub_category_name;
        }

        console.log(this.categorydata);

        // Get shop list from params if available
        const shop_list_arrays = params['shop_list_arrays'];
        this.sub_category_id = this.categorydata?.sub_category_id;
        console.log(this.sub_category_id);

        // Proceed only if sub_category_id exists
        if (this.sub_category_id) {
          const maindata = {
            category_id: this.categorydata.category_id,
            location_id: localStorage.getItem('location_id')
          };

          interface ShopItem {
            id: number;
            shop_id: string;
            category_id: number;
            sub_category_id: number;
            sub_category_name: string;
            sub_category_image: string;
          }

          this.api.getshopsubcategorylist(maindata).subscribe(async (res: any) => {
            if (res.status === 200) {
              const allShopIdsSet = new Set<string>();

              res.data.forEach((item: ShopItem) => {
                if (item.shop_id) {
                  item.shop_id.split(',').forEach(id => allShopIdsSet.add(id.trim()));
                }
              });

              const shoparray = {
                shop_id: Array.from(allShopIdsSet).sort((a, b) => +a - +b).join(',')
              };

              this.getshop(this.categorydata.category_id, this.sub_category_id, shoparray.shop_id);
            }
          });
        } else if (shop_list_arrays) {
          console.log("coming1");
          this.getshop(this.categorydata.category_id, this.sub_category_id, shop_list_arrays);
        } else {
          this.getshop(this.categorydata.category_id, this.sub_category_id, 0);
        }
      } catch (err) {
        console.error("Error parsing category data", err);
        this.getshop(this.categorydata?.category_id, this.sub_category_id, 0);
      }
    });
  }

  getbanner(category_id: any) {
    var data = {
      location_id: localStorage.getItem('location_id'),
      category_id: category_id
    }
    this.menuItems = [];
    this.api.getcategorybannerslist(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.menuItems = res.data;
      }
    })
  }

  ionViewWillEnter() {
  }

  categorydata: any
  mainshopsdata: any = []
  avail: boolean = false;

  async getshop(id: any, sub_category_id: any, shoparra: any) {
    this.getbanner(id);
    var data = {
      shop_latitude: localStorage.getItem('latitude'),
      shop_longitude: localStorage.getItem('longitude'),
      location_id: localStorage.getItem('location_id'),
      category_id: id,
      sub_category_id: sub_category_id,
      shop_id: shoparra,
      veg_mode: localStorage.getItem('vegmodestatus') ?? '0'
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.mainshopsdata = [];
    this.shops = [];

    this.api.recomrecommended_for_you_shops(data).subscribe(async (res: any) => {
      if (res.data.length > 0) {
        this.recommenderforyoudata = res.data.map((shop: any) => {
          const distance = shop.distance; // assumed in kilometers
          const { min, max, formatted } = this.getDeliveryTime(distance);
          return {
            ...shop,
            delivery_distance: distance,
            delivery_time: formatted,
            duration_org: { min, max }
          };
        });
        this.groupedRestaurants = this.chunkArray(this.recommenderforyoudata, 2);
      } else {
        this.groupedRestaurants = [];
        this.recommenderforyoudata = [];
      }
    })

    this.api.getshoplist(data).subscribe(async (res: any) => {
      loading.dismiss()
      if (res.status == 200) {
        const data = res.data[0].map((shop: any) => {
          const distance = shop.distance; // assumed in kilometers
          const { min, max, formatted } = this.getDeliveryTime(distance);
          return {
            ...shop,
            delivery_distance: distance,
            delivery_time: formatted,
            duration_org: { min, max }
          };
        });

        const mydata =  data.sort((a: any, b: any) => a.shop_active_status - b.shop_active_status);
        this.mainshopsdata = mydata;
        this.shops = mydata;
        // Set default filter to 'All' if not already set
        if (!this.selectedFilter) {
          this.selectedFilter = 'All';
        }
        if (this.shops.length == 0) {
          this.avail = true;
        }
        var transformedData = res.data[1].map(({ id, filter_id, filter_name, ["GROUP_CONCAT(shop_id)"]: shop_ids }: any) => ({
          id,
          shop_ids,
          filter_id,
          filter_name
        }));
        this.filters = transformedData;
      }
    }, (error) => {
      loading.dismiss();
    })
  }

  shops: any = []

  gotorestaurant(data: any) {
    localStorage.setItem('shopdetails', JSON.stringify(data));
    localStorage.setItem('bagebackcategory', JSON.stringify(this.categorydata));

    this.navctrl.navigateForward('main-resturant', {
      queryParams: {
        data: JSON.stringify(data)
      }
    });
  }

  filterItems(filterType: any) {
    if (filterType == 'All') {
      this.shops = this.mainshopsdata;
      this.selectedFilter = 'All';
    } else {
      const shopIdArray = filterType.shop_ids.split(',').map((id: any) => parseInt(id.trim(), 10));
      this.shops = this.mainshopsdata.filter((shop: any) => shopIdArray.includes(shop.shop_id));
      this.selectedFilter = filterType.filter_name;
    }
    // Update availability status based on filtered shops
    this.avail = this.shops.length === 0;
  }

  onFilterChange(event: any) {
  }

  gotohome() {
    this.navctrl.navigateRoot('/home');
  }

  filterShops() {
    if (this.searchQuery.trim() === '') {
      // If search is empty, restore based on selected filter
      if (this.selectedFilter === 'All' || !this.selectedFilter) {
        this.shops = [...this.mainshopsdata];
      } else {
        // Reapply the selected filter
        const selectedFilterObj = this.filters.find((f: any) => f.filter_name === this.selectedFilter);
        if (selectedFilterObj) {
          const shopIdArray = selectedFilterObj.shop_ids.split(',').map((id: any) => parseInt(id.trim(), 10));
          this.shops = this.mainshopsdata.filter((shop: any) => shopIdArray.includes(shop.shop_id));
        }
      }
    } else {
      // Apply search filter
      let filteredShops = this.mainshopsdata.filter((shop: any) =>
        shop.shop_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      
      // If a filter is selected, apply it to search results
      if (this.selectedFilter && this.selectedFilter !== 'All') {
        const selectedFilterObj = this.filters.find((f: any) => f.filter_name === this.selectedFilter);
        if (selectedFilterObj) {
          const shopIdArray = selectedFilterObj.shop_ids.split(',').map((id: any) => parseInt(id.trim(), 10));
          filteredShops = filteredShops.filter((shop: any) => shopIdArray.includes(shop.shop_id));
        }
      }
      this.shops = filteredShops;
    }
    // Update availability status based on filtered shops
    this.avail = this.shops.length === 0;
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

  chunkArray(arr: any[], size: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  onSlideChange(event: any) {
  }

}
