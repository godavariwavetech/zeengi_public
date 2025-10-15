import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-shop-ratings',
  templateUrl: './shop-ratings.page.html',
  styleUrls: ['./shop-ratings.page.scss'],
})
export class ShopRatingsPage implements OnInit {

  
  public feedbacks = [
    { 
      name: 'John Doe', 
      imageUrl: 'https://www.w3schools.com/w3images/avatar2.png', 
      comment: 'Great product, really useful!', 
      rating: 5
    },
    { 
      name: 'Jane Smith', 
      imageUrl: 'https://www.w3schools.com/w3images/avatar5.png', 
      comment: 'Good value for the price.',
      rating: 3
    },
    { 
      name: 'Alice Brown', 
      imageUrl: 'https://www.w3schools.com/w3images/avatar4.png', 
      comment: 'Not bad, but could be improved.',
      rating: 2
    },
    { 
      name: 'Tom White', 
      imageUrl: 'https://www.w3schools.com/w3images/avatar6.png', 
      comment: 'I absolutely love it!',
      rating: 4
    }
  ]
  restaurantdata:any;customer_reviews:any=[];
  constructor(public api: ApiService,private route: ActivatedRoute, public navctrl: NavController) {

    this.route.queryParams.subscribe(params => {
     
    
      // Directly access pagebackdata without 'queryParams' key
      this.restaurantdata = params['pagebackdata'];
      
    });
    this.getshopratinglist();
   }

  ngOnInit() {
  }

  getshopratinglist() {
    this.api.getmerchentratings(this.restaurantdata).subscribe(async (res: any) => {
      
      this.customer_reviews = res.data
      
    })
  }
  goBack(){
    this.navctrl.navigateForward('main-resturant', {
      queryParams: {
        data: JSON.stringify(this.restaurantdata)
      }
    });

    
  }

}
