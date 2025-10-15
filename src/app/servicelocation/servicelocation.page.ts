import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-servicelocation',
  templateUrl: './servicelocation.page.html',
  styleUrls: ['./servicelocation.page.scss'],
})
export class ServicelocationPage implements OnInit {
  locations: any = []
  filteredLocations: any = []

  isLoading = false;
  constructor(public navctrl: NavController, private api: ApiService) {
    this.isLoading = true; //loader
    this.api.getserviceslist().subscribe(async (res: any) => {
      if (res.status == 200) {
        this.isLoading = false; //loader
        this.locations = res.data;
        this.filteredLocations = [...this.locations];
       
      }
    }, (error) => {
      this.isLoading = false;
    })
  }

  ngOnInit() {
  }

  

  searchQuery = '';

  filterLocations(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredLocations = this.locations.filter((location: any) =>
      location.location_name.toLowerCase().includes(query)
    );
  }

  setlocation(i: any) {
    const latlng = new google.maps.LatLng(i.location_latitude, i.location_longitude);
    const geocoder = new google.maps.Geocoder();
    // Perform geocode operation to get the full address
    geocoder.geocode({ location: latlng }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const full_address = results[0].formatted_address;
        console.log(full_address);
        
        const city_name = results[0].address_components[1].short_name;
        const short_address = results[0].address_components[2].short_name + "," + results[0].address_components[3].short_name;
        localStorage.setItem('full_address', full_address);
        localStorage.setItem('setlocation', full_address);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });


    localStorage.setItem('latitude', i.location_latitude);
    localStorage.setItem('longitude', i.location_longitude);
    localStorage.setItem('location_name', i.location_name);
    localStorage.setItem('location_id', i.id);
    localStorage.removeItem('delivery_elements');
    localStorage.setItem("set_delivery_distance_status","0");
    this.navctrl.navigateRoot('/home');
    localStorage.removeItem('cartData');
      localStorage.removeItem('cart_merchant');
      localStorage.removeItem('main_shopdetails');
      localStorage.removeItem('shopdetails');
  }

  gotoback() {
    this.navctrl.back()
  }

}
