import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/icon/noimg.png'; // Replace with your actual fallback image path
  }

  subcategory: any;sub_category_data:any;
  searchList: any = '';recent_search:any=[];
  constructor(private api: ApiService, public navctrl: NavController, private toastController: ToastController) { 
    this.recent_search = JSON.parse(localStorage.getItem("recent_search") || "[]");

  }

  ngOnInit() {
    this.getsubcategoryall();
  }

  getsubcategoryall() {
     var data = {
      location_id: localStorage.getItem('location_id'),
      veg_mode: localStorage.getItem('vegmodestatus') ?? '0'
    }
    this.api.getsubcategoryall(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        this.subcategory = res.data;
      }
    }, error => {
      // loading.dismiss()
    })
  }

  gotoback() {
    this.navctrl.back();
  }

  onSearch(event: any) {
    this.searchList = [];
    const query = event.target.value;
    if (query.length > 3) {
      var data = {
        searchterm: query,
        location_id: localStorage.getItem("location_id")
      }

      this.getsubcategorydata(query);

      this.api.search_allitems(data).subscribe(async (res: any) => {
        if (res.status == 200) {
          this.searchList = res.data;
          if(this.searchList.length){
            this.recent_search=[];
          }
        }
      }, (error: any) => {
        // loading.dismiss()
      })
    } else {
      // this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);
      this.recent_search = JSON.parse(localStorage.getItem("recent_search") || "[]");
    }
  }

  getsubcategorydata(query:any){
    console.log(this.subcategory);
    console.log(query);
    
    
   this.sub_category_data = this.subcategory.find((obj: any) =>
      obj.sub_category_name.toLowerCase().trim() === query.toLowerCase().trim()
    );

    console.log(this.sub_category_data);
    
  }

  onCategoryClick(sub_data: any) {

    
    
    

    localStorage.setItem('category_id', sub_data.category_id);
    var sub_category_data = {
      sub_category_image: sub_data.sub_category_image,
      sub_category_name: sub_data.sub_category_name,
      id: sub_data.id,
      location_id: localStorage.getItem("location_id"),
      table_name: "shop_subcategory_list_t",
      subcategory_tag_line: sub_data.subcategory_tag_line,
      category_id:sub_data.category_id
    }
    this.api.getsearchsubcategoriesshoplist(sub_category_data).subscribe(async (res: any) => {
      if (res.data.length > 0) {
        this.navctrl.navigateForward('categories', {
          queryParams: {
            shop_list_arrays: res.data[0].shop_ids,
            categorydata: sub_category_data
          }
        });
      } else {
        this.presentToast(`Sorry, ${sub_data.sub_category_name} is not available in your location.`);

      }
    })
  }

  searchlistitem(data: any) {
    // this.api.searchitemsfull(data).subscribe(async (res: any) => {

    data.location_id = localStorage.getItem("location_id");
   
  
    const recent_search = JSON.parse(localStorage.getItem("recent_search") || "[]"); 

    const exists = recent_search.some((item: any) =>
      item.id === data.id &&
      item.search_type === data.search_type &&
      item.table_name === data.table_name &&
      item.location_id === data.location_id
    );

    if (!exists) {
      if (recent_search.length < 5) {
        recent_search.push(data);
      } else {
        // Optionally remove the oldest item and add new one
        recent_search.shift(); // remove the first (oldest) item
        recent_search.push(data);
      }
      localStorage.setItem("recent_search", JSON.stringify(recent_search));
    }
    
    console.log(data);
    data.sub_category_image = data.search_image;
    data.sub_category_name = data.search_text;
    data.subcategory_tag_line = data.search_tagline
    
    if (data.search_type == 1) {
      data.kay_name = "item_name";
      this.api.getsearchshoplist(data).subscribe(async (res: any) => {
        if (res.data.length > 0) {
          localStorage.setItem("category_id", res.data[0].category_id);
          data.category_id=res.data[0].category_id
          this.navctrl.navigateForward('categories', {
            queryParams: {
              shop_list_arrays: res.data[0].shop_ids,
              categorydata: data
            }
          });
        } else {
          this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);

        }
      })
    } else if (data.search_type == 2) {
      
      data.shop_latitude = localStorage.getItem("latitude");
      data.shop_longitude = localStorage.getItem("longitude");
      data.shop_id = data.id
      this.api.getsingleshopdetails(data).subscribe(async (res: any) => {
        if (res.data.length > 0) {
          localStorage.setItem("category_id", res.data[0].category_id);
          localStorage.setItem('shopdetails', JSON.stringify(res.data[0]));
          this.navctrl.navigateForward('main-resturant', {
            queryParams: {
              data: JSON.stringify(res.data[0])
            }
          });
        } else {
          this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);
        }

      })
    } else if (data.search_type == 3) {

      this.api.getsearchcategoriesshoplist(data).subscribe(async (res: any) => {
        if (res.data.length > 0) {
          localStorage.setItem("category_id", res.data[0].category_id);
          data.category_id=res.data[0].category_id.category_id
          this.navctrl.navigateForward('categories', {
            queryParams: {
              shop_list_arrays: res.data[0].shop_ids,
              categorydata: data
            }
          });
        } else {
          this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);

        }
      })
    } else if (data.search_type == 4) {

      this.api.getsearchsubcategoriesshoplist(data).subscribe(async (res: any) => {
        

        if (res.data.length > 0) {
          localStorage.setItem("category_id", res.data[0].category_id);
          data.category_id=res.data[0].category_id.category_id
          this.navctrl.navigateForward('categories', {
            queryParams: {
              shop_list_arrays: res.data[0].shop_ids,
              categorydata: data
            }
          });
        } else {
          this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);
        }
      })
    } else if (data.search_type == 5) {
      
      
      this.api.searchitemsfull(data).subscribe(async (res: any) => {    
        
        res.data[0].shop_latitude = localStorage.getItem("latitude")
        res.data[0].shop_longitude = localStorage.getItem("longitude")
        this.api.getsingleshopdetails(res?.data[0]).subscribe(async (shop_res: any) => {
          if(shop_res.data.length==0){
            this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);
          } else if (res.data.length > 0) {
            
            localStorage.setItem('main_shopdetails', JSON.stringify(shop_res.data[0]));
            localStorage.setItem('shopdetails', JSON.stringify(shop_res.data[0]));

            this.navctrl.navigateForward('groceries-product', {
              queryParams: {
                product_details: JSON.stringify(res?.data[0])
              }
            });
          } else {
            this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);
          }
            
          
          
          
        })
        
        
        
        // if (res.data.length > 0) {
        //   localStorage.setItem("category_id", res.data[0].category_id);
        //   this.navctrl.navigateForward('categories', {
        //     queryParams: {
        //       shop_list_arrays: res.data[0].shop_ids,
        //       categorydata: data
        //     }
        //   });
        // } else {
        //   this.presentToast(`Sorry, ${data.search_text} is not available in your location.`);
        // }
      })
    }
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      color: 'primary'
    });
    await toast.present();
  }


  removeItem(index: number) {
    this.recent_search.splice(index, 1);
    localStorage.setItem("recent_search",JSON.stringify(this.recent_search));
  }

}
