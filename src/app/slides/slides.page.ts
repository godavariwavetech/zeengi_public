
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import Swiper from 'swiper';

import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { ApiService } from '../service/api.service';
@Component({
  selector: 'app-slides',
  templateUrl: './slides.page.html',
  styleUrls: ['./slides.page.scss'],
})
export class SlidesPage implements OnInit {

  constructor(public route: Router, public navctrl: NavController, private geolocation: Geolocation, private locationAccuracy: LocationAccuracy,private api: ApiService) { }

  ngOnInit() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            // If request is successful, fetch the current location
            this.getcurrentlocation();
          },
          (error) => {
            // In case of error, still try to fetch the current location
            console.error('Location accuracy request failed:', error);
            this.getcurrentlocation();  // Handle fallback behavior or error handling here
          }
        );
      }
    });    
  }

  

  swiperConfig = {
    autoplay: {
      delay: 1000,
      disableOnInteraction: false
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',  // Target element for the bullets
      clickable: true,           // Make bullets clickable
    }
  };

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  slidesData = [
    {
      image: 'assets/icon/slide/s1.svg',
      title: 'Buy Groceries Easily',
      description: 'It is a long established fact that a reader will be distracted by the readable.',
    },
    {
      image: 'assets/icon/slide/s1.svg',
      title: 'Fast and Reliable Delivery',
      description: 'Get fresho groceries delivered to your doorstep within minutes!',
    },
    {
      image: 'assets/icon/slide/s1.svg',
      title: 'Best Deals and Discounts',
      description: 'Best Deals and DiscountsBest Deals and DiscountsBest Deals and DiscountsBest Deals and Discounts',
    },
  ];

  skipOnboarding() {
    this.navctrl.navigateForward('login')
  }

  getcurrentlocation() {
    this.geolocation.getCurrentPosition().then((resp: any) => {
      this.getlocation(resp.coords.latitude, resp.coords.longitude);
      localStorage.setItem('latitude', resp.coords.latitude.toString());
      localStorage.setItem('longitude', resp.coords.longitude.toString());

      localStorage.setItem('current_latitude', resp.coords.latitude.toString());
      localStorage.setItem('current_longitude', resp.coords.longitude.toString());


      const latlng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const geocoder = new google.maps.Geocoder();

      // Use 'location' instead of 'latLng'
      geocoder.geocode({ 'location': latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[1]) {
          localStorage.setItem("setlocation", results[1].formatted_address);
          localStorage.setItem("current_address", results[1].formatted_address);
        } else {
        }
      });
    }).catch((error: any) => {
    });
  }

  async getlocation(latitude: any, longitude: any) {
    var data = {
      location_latitude: latitude,
      location_longitude: longitude
    }
    
    this.api.getuserlocation(data).subscribe(async (res: any) => {      
      if (res.status == 200) {
        localStorage.setItem('location_id', res.data[0].id);
        localStorage.setItem('location_name', res.data[0].location_name);
        localStorage.setItem('service_location_status', "1");
        localStorage.removeItem('delivery_elements');
        localStorage.setItem("set_delivery_distance_status","0");
      } else if (res.status == 300) {
        localStorage.setItem('service_location_status', "0");       
      } else {
        localStorage.setItem('service_location_status', "0");
      }
    }, error => {
      
    })
  }


}
