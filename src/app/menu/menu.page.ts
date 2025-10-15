import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  @ViewChild('subcategorySection', { read: ElementRef }) subcategorySection!: ElementRef;
  @ViewChild('content', { static: false }) content!: IonContent;

  categories: any = []
  selectedCategory: any = '';
  category_id: any = ''
  categories2: any = []
  distancerestaurtants: any = [];
  restaurants: any = [];
  cartCount: number = 0;
  cartdata:any=[]

  constructor(public navctrl: NavController, private alertController: AlertController, private api: ApiService, public loadingCtrl: LoadingController) { }

  ngAfterViewInit() {
    // confirm references
   
  }



  ngOnInit() {
    const data = localStorage.getItem('cartData');
    this.cartdata = data ? JSON.parse(data) : [];

    this.cartCount = this.cartdata.reduce((total: number, item: any) => {
      return total + (item.itemscount || 0);
    }, 0);
    this.getcategory();
  }

  getcategory() {
    var data = {
      location_id: localStorage.getItem('location_id'),
      veg_mode:localStorage.getItem("vegmodestatus")
    }
    this.api.getlocationctgrylist(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.categories = res.data;
        this.selectedCategory = this.categories[0].category_name;
        // this.selectCategory(this.categories[0]);
      }
    })
  }

  selectCategory(data: any) {
    this.selectedCategory = data.category_name;
    this.category_id = data.id;
  
    if (data.regular_status == 1) {
      this.getshop(data.id, data.regular_status);
    } else {
      const maindata = {
        category_id: data.id,
        location_id: localStorage.getItem('location_id'),
        veg_mode:localStorage.getItem("vegmodestatus")
      };
  
      this.getshop(data.id, 0);
  
      this.api.getshopsubcategorylist(maindata).subscribe(async (res: any) => {
        if (res.status == 200) {
          this.categories2 = res.data;
          localStorage.setItem('sub_category_id', res.data[0].sub_category_id);
          localStorage.setItem('sub_category_name', res.data[0].sub_category_name);
  
          // Ensure the view updates before scrolling
          setTimeout(() => {
            const yOffset = this.subcategorySection.nativeElement.offsetTop;
            this.content.scrollToPoint(0, yOffset, 500); // scroll to y
          }, 200); // slight delay to ensure DOM is ready
        }
      });
    }
  }
  

  

  async getshop(id: any, regular_status: any) {
    var data = {
      shop_latitude: localStorage.getItem('latitude'),
      shop_longitude: localStorage.getItem('longitude'),
      location_id: localStorage.getItem('location_id'),
      category_id: id,
      shop_id: 0,
      veg_mode:localStorage.getItem("vegmodestatus")
    }
    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    this.api.getshoplist(data).subscribe(async (res: any) => {
      if (res.status == 200) {

        const data = res.data[0].map((shop: any) => ({
          ...shop,
          delivery_time: this.getDeliveryTime(shop.distance)
        }));

        this.restaurants = data;
        if (regular_status == 1) {
          if (this.restaurants[0] == undefined || this.restaurants[0] == null || this.restaurants[0] == 'undefined' || this.restaurants[0] == 'null') {
            const alert = await this.alertController.create({
              mode: 'ios',
              message: 'Grocery not available in this location.',
              buttons: ['OK']
            });
            await alert.present();
            loading.dismiss();
          } else {
            localStorage.setItem('shopdetails', JSON.stringify(this.restaurants[0]))
            const sortedRestaurants = data.sort((a: any, b: any) => a.distance - b.distance);
            this.distancerestaurtants = sortedRestaurants;
            this.navctrl.navigateForward('groceries');
            loading.dismiss();
          }
        } else {
          localStorage.setItem('shopdetails', JSON.stringify(this.restaurants[0]))
          const sortedRestaurants = data.sort((a: any, b: any) => a.distance - b.distance);
          this.distancerestaurtants = sortedRestaurants;
          loading.dismiss();
        }
      }
    }, error => {
      loading.dismiss()
    })
  }

  getDeliveryTime(distanceKm: any) {
    let minTime = 25;
    let maxTime = 30;

    if (distanceKm > 3) {
      const extraKm = distanceKm - 3;
      const extraMinutes = Math.ceil(extraKm) * 3;
      minTime += extraMinutes;
      maxTime += extraMinutes;
    }

    return `${minTime}-${maxTime} min`;
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

  gotocategory(sub_data: any) {
    // localStorage.setItem('category_id', sub_data.category_id);
    localStorage.setItem('sub_category_image', sub_data.sub_category_image);
    localStorage.setItem('sub_category_name', sub_data.sub_category_name);
    var sub_category_data = {
      search_image: sub_data.sub_category_image,
      search_text: sub_data.sub_category_name,
      sub_category_image: sub_data.sub_category_image,
      sub_category_name: sub_data.sub_category_name,
      id: sub_data.id,
      location_id: localStorage.getItem("location_id"),
      table_name: "shop_subcategory_list_t",
      subcategory_tag_line: sub_data.subcategory_tag_line,
      category_id:sub_data.category_id
    }

    
    this.navctrl.navigateForward('categories', {
      queryParams: {
        shop_list_arrays: sub_data.shop_id,
        categorydata: sub_category_data
      }
    });
  }
  // gotocategory(sub_data: any) {
  //   localStorage.setItem('category_id', sub_data.category_id);
  //   var sub_category_data = {
  //     search_image: sub_data.sub_category_image,
  //     search_text: sub_data.sub_category_name,
  //     id: sub_data.id,
  //     location_id: localStorage.getItem("location_id"),
  //     table_name: "shop_subcategory_list_t"
  //   }
  //   this.navctrl.navigateForward('categories', {
  //     queryParams: {
  //       shop_list_arrays: sub_data.shop_id,
  //       categorydata: sub_category_data
  //     }
  //   });
  // }

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


  


}
