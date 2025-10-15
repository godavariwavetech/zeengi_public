import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.page.html',
  styleUrls: ['./collection.page.scss'],
})
export class CollectionPage implements OnInit {

  filterorder: any = "Shops";

  getfilteroderlist(filterorder: any) {
    this.filterorder = filterorder;
  }

  constructor(private navctrl: NavController, private api: ApiService) { }

  ngOnInit() {
    this.getalldata()
  }

  gotomenu() {
    this.navctrl.navigateBack('home');
  }

  shops: any
  items: any

  getalldata() {
    this.api.getuserwishlistfulldata().subscribe((res: any) => {
      this.shops = res.data[0];
      this.items = res.data[1];
    })
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

  gotocategory(sub_data: any) {

    console.log(50, sub_data);

    localStorage.setItem('sub_category_image', sub_data.item_image);
    localStorage.setItem('sub_category_name', sub_data.sub_category_name);
    var sub_category_data = {
      search_image: sub_data.item_image,
      search_text: sub_data.sub_category_name,
      sub_category_image: sub_data.item_image,
      sub_category_name: sub_data.sub_category_name,
      subcategory_tag_line: sub_data.subcategory_tag_line,
      id: sub_data.id,
      location_id: localStorage.getItem("location_id"),
      table_name: "shop_subcategory_list_t",
      category_id: sub_data.category_id
    }

    this.navctrl.navigateForward('categories', {
      queryParams: {
        shop_list_arrays: sub_data.shop_id,
        categorydata: sub_category_data
      }
    });
  }




}
