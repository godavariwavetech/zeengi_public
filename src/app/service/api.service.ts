import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
declare const google: any;


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private baseUrl = 'https://api.zeengi.com/public_app/';

  // private baseUrl = 'https://stagingapi.zeengi.com/public_app/';
  // private baseUrl = 'http://localhost:2406/public_app/';

  private cartCount = new BehaviorSubject<number>(0);

  private apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImY5MGFmNjA5NTkzZDQyZGZiNWQxNzZhZmViNjQ4MDdjIiwiaCI6Im11cm11cjY0In0='; // Replace with your real API key

  private apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  getCartCount() {
    return this.cartCount.asObservable();
  }

  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        reject("Google Maps API is not loaded.");
        return;
      }

      const service = new google.maps.DistanceMatrixService();
      const origin = new google.maps.LatLng(lat1, lon1);
      const destination = new google.maps.LatLng(lat2, lon2);

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            reject("Error fetching distance: " + status);
            return;
          }
          // Check if response contains valid data
          if (!response.rows || response.rows.length === 0 ||
            !response.rows[0].elements || response.rows[0].elements.length === 0 ||
            !response.rows[0].elements[0].distance) {
            reject("No distance data available.");
            return;
          }
          const distance = response; // Convert meters to km
          resolve(distance);
        }
      );
    });
  }




  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  constructor(public http: HttpClient) { }

  getuserloginotp(data: any) {
    return this.http.post(`${this.baseUrl}getuserloginotp`, data);
  }

  customerlogin(data: any) {
    console.log(data);

    return this.http.post(`${this.baseUrl}customerlogin`, data);
  }

  publicregister(data: any) {
    return this.http.post(`${this.baseUrl}publicregister`, data);
  }

  masterdata() {
    return this.http.post(`${this.baseUrl}masterdata`, []);
  }

  coupon_list(data: any) {
    return this.http.post(`${this.baseUrl}coupon_list`, data);
  }

  postplayer_id(data: any) {
    return this.http.post(`${this.baseUrl}postplayer_id`, data);
  }

  getuserdaata(data: any) {
    return this.http.post(`${this.baseUrl}getuserdaata`, data);
  }

  //--------------------------------location------------------------------------------

  getuserlocation(data: any) {
    return this.http.post(`${this.baseUrl}getuserlocation`, data)
  }

  getserviceslist() {
    return this.http.get(`${this.baseUrl}getserviceslist`)
  }
  
  getbannerslist(data: any) {
    return this.http.post(`${this.baseUrl}getbannerslist`, data)
  }
  
  getlocationctgrylist(data: any) {
    return this.http.post(`${this.baseUrl}getlocationctgrylist`, data)
  }
  
  getshopsubcategorylist(data: any) {
    return this.http.post(`${this.baseUrl}getshopsubcategorylist`, data)
  }
  
  getshoplist(data: any) {
    return this.http.post(`${this.baseUrl}getshoplist`, data)
  }
  recomrecommended_for_you_shops(data: any) {
    return this.http.post(`${this.baseUrl}recomrecommended_for_you_shops`, data)
  }
  
  getitemslist(data: any) {
    return this.http.post(`${this.baseUrl}getitemslist`, data)
  }
  
  getbanneritemslist(data: any) {
    return this.http.post(`${this.baseUrl}getbanneritemslist`, data)
  }
  
  
  orderplaced(data: any) {
    return this.http.post(`${this.baseUrl}orderplaced`, data)
  }
  
  updatepaymetdetails(data: any) {
    return this.http.post(`${this.baseUrl}updatepaymetdetails`, data)
  }
  
  
  getorderdetails(data: any) {
    return this.http.post(`${this.baseUrl}getorderdetails`, data)
  }
  
  getorderlistdata(data: any) {
    return this.http.post(`${this.baseUrl}getorderlist`, data)
  }
  
  getgrocery_sub_total_categories() {
    return this.http.post(`${this.baseUrl}getgrocery_sub_total_categories`, [])
  }
  
  getgroucery_category_items_list(data: any) {
    return this.http.post(`${this.baseUrl}getgroucery_category_items_list`, data)
  }
  
  getdarksstoresresult(data: any) {
    return this.http.post(`${this.baseUrl}getdarksstoresresult`, data)
  }
  
  getgroucery_search_items_list(data: any) {
    return this.http.post(`${this.baseUrl}getgroucery_search_items_list`, data)
  }
  
  get_subscription_timeline() {
    return this.http.post(`${this.baseUrl}get_subscription_timeline`, [])
  }
  
  get_wallet_amounts() {
    return this.http.post(`${this.baseUrl}get_wallet_amounts`, [])
  }
  
  getslot_booking(data: any) {
    return this.http.post(`${this.baseUrl}getslot_booking`, data)
  }
  
  user_wallet_payment(data: any) {
    return this.http.post(`${this.baseUrl}user_wallet_payment`, data)
  }
  
  generateorderid(data: any) {
    return this.http.post(`${this.baseUrl}generateorderid`, data)
  }
  
  update_user_wallet_payment(data: any) {
    return this.http.post(`${this.baseUrl}update_user_wallet_payment`, data)
  }
  
  get_user_wallet_amount_details(data: any) {
    return this.http.post(`${this.baseUrl}get_user_wallet_amount_details`, data)
  }
  
  subscription_order_placed(data: any) {
    return this.http.post(`${this.baseUrl}subscription_order_placed`, data)
  }
  
  getsubscripitioin_orders(data: any) {
    return this.http.post(`${this.baseUrl}getsubscripitioin_orders`, data)
  }
  
  getrecieved_subscripitioin_order_itemCtrl(data: any) {
    return this.http.post(`${this.baseUrl}getrecieved_subscripitioin_order_itemCtrl`, data)
  }
  
  getwalletdeduction(data: any) {
    return this.http.post(`${this.baseUrl}getwalletdeduction`, data)
  }
  
  getsubcategoryall(data: any) {
    return this.http.post(`${this.baseUrl}getsubcategoryall`, data)
  }
  
  search_allitems(data: any) {
    return this.http.post(`${this.baseUrl}search_allitems`, data)
  }
  
  searchitemsfull(data: any) {
    return this.http.post(`${this.baseUrl}searchitemsfull`, data)
  }

  post_customer_delivery_address(data: any) {
    return this.http.post(`${this.baseUrl}post_customer_delivery_address`, data)
  }
  
  get_customer_delivery_address(data: any) {
    return this.http.post(`${this.baseUrl}get_customer_delivery_address`, data)
  }
  
  application_common_api() {
    return this.http.post(`${this.baseUrl}application_common_api`, [])
  }
  
  getprofile() {
    var data = { customer_id: localStorage.getItem('usr_id') }
    return this.http.post(`${this.baseUrl}getprofile`, data)
  }
  
  update_customer_profile(data: any) {
    return this.http.post(`${this.baseUrl}update_customer_profile`, data)
  }
  
  get_related_products(data: any) {
    return this.http.post(`${this.baseUrl}get_related_products`, data)
  }
  
  getappversions() {
    return this.http.get(`${this.baseUrl}getappversions`)
  }
  
  delete_customer_address(data: any) {
    return this.http.post(`${this.baseUrl}delete_customer_address`, data)
  }
  
  cancleorder(data: any) {
    return this.http.post(`${this.baseUrl}cancleorder`, data)
  }
  
  notificationslist(data: any) {
    return this.http.post(`${this.baseUrl}notificationslist`, data)
  }
  
  postapprating(data: any) {
    return this.http.post(`${this.baseUrl}postapprating`, data)
  }
  
  postorderrating(data: any) {
    return this.http.post(`${this.baseUrl}postorderrating`, data)
  }
  
  //kiran ----------------------------------------------------
  
  getsingleshopdetails(data: any) {
    return this.http.post(`${this.baseUrl}getsingleshopdetails`, data)
  }
  
  getsearchcategoriesshoplist(data: any) {
    return this.http.post(`${this.baseUrl}getsearchcategoriesshoplist`, data)
  }
  
  getsearchsubcategoriesshoplist(data: any) {
    return this.http.post(`${this.baseUrl}getsearchsubcategoriesshoplist`, data)
  }
  
  getsearchshoplist(data: any) {
    return this.http.post(`${this.baseUrl}getsearchshoplist`, data)
  }
  
  getsearchgroceryitemslist(data: any) {
    return this.http.post(`${this.baseUrl}getsearchgroceryitemslist`, data)
  }
  
  
  
  //kiran ----------------------------------------------------
  
  addwishlist(data: any) {
    return this.http.post(`${this.baseUrl}addwishlist`, data)
  }
  
  getuserwishlist(data: any) {
    return this.http.post(`${this.baseUrl}getuserwishlist`, data)
  }
  
  deletewishlist(data: any) {
    return this.http.post(`${this.baseUrl}deletewishlist`, data)
  }
  
  getuserwishlistfulldata() {
    var data = {
      customer_id: localStorage.getItem('usr_id'),
      location_id: localStorage.getItem('location_id')
    }
    return this.http.post(`${this.baseUrl}getuserwishlistfulldata`, data)
  }
  
  sameshopoutlets(data: any) {
    
    return this.http.post(`${this.baseUrl}sameshopoutlets`, data)
  }
  
  getslotdates(data: any) {
    return this.http.post(`${this.baseUrl}getslotdates`, data)
  }
  
  getcategorydetails(data: any) {
    return this.http.post(`${this.baseUrl}getcategorydetails`, data)
  }
  
  delivery_instructions() {
    return this.http.post(`${this.baseUrl}delivery_instructions`, [])
  }
  getmerchentratings(data: any) {
    return this.http.post(`${this.baseUrl}getmerchentratings`, data)
  }
  getshop_offercelist(data: any) {
    return this.http.post(`${this.baseUrl}getshop_offercelist`, data)
  }
  
  checkshop_slot_timings(data: any) {
    return this.http.post(`${this.baseUrl}checkshop_slot_timings`, data)
  }
  getrelateditemslist(data: any) {
    return this.http.post(`${this.baseUrl}getrelateditemslist`, data)
  }
  
  get_offer_banners(data: any) {
    return this.http.post(`${this.baseUrl}get_offer_banners`, data)
  }
  
  deleteaccount(data: any) {
    return this.http.post(`${this.baseUrl}deleteaccount`, data)
  }
  
  getcategorybannerslist(data: any) {
    return this.http.post(`${this.baseUrl}getcategorybannerslist`, data)
  }
  
  public_complaits(data: any) {
    return this.http.post(`${this.baseUrl}public_complaits`, data)
  }
  
  updatename(data: any) {
    return this.http.post(`${this.baseUrl}updatename`, data)
  }
  
  getorder_distance(data: any) {
    return this.http.post(`${this.baseUrl}getorder_distance`, data)
  }
  
  getfranshichedetails(data: any) {
    return this.http.post(`${this.baseUrl}getfranshichedetails`, data)
  }
  
  getfranchsiedetails(data: any) {
    return this.http.post(`${this.baseUrl}getpublicfranshichedetails`, data)
  }
  
  
  // async getRouteDistanceORS(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    //   const body = {
      //     coordinates: [[fromLng, fromLat], [toLng, toLat]]
      //   };
      
      //   const headers = new HttpHeaders({
        //     'Authorization': this.apiKey,
        //     'Content-Type': 'application/json'
  //   });
  
  //   try {
    //     const response: any = await lastValueFrom(
      //       this.http.post(this.apiUrl, body, { headers })
      //     );
      
      //     const summary = response.routes[0].summary;
      //     const distanceKm = (summary.distance / 1000).toFixed(2);
      //     // const durationSec = summary.duration;
      
      //     // const hours = Math.floor(durationSec / 3600);
      //     // const minutes = Math.round((durationSec % 3600) / 60);
      
      //     // console.log(`🚗 Distance: ${distanceKm} km`);
      //     // console.log(`🕒 Estimated time: ${hours}h ${minutes}m`);
      
      //     return {
        //       distanceKm: parseFloat(distanceKm),
        //     };
        
        //   } catch (error: any) {
          //     console.error('❌ Error fetching route:', error?.error || error.message);
          //     return null;
          //   }
          // }
          
          //  async getRouteDistanceORS(lat1: any, lon1: any, lat2: any, lon2: any): Promise<number> {
            //     return new Promise((resolve) => {
              //       // If Google API not available, fallback to haversine
              //       if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                //         console.warn("Google Maps API not available, using haversine.");
                //         resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
                //         return;
                //       }
                
                //       const service = new google.maps.DistanceMatrixService();
                //       const origin = new google.maps.LatLng(lat1, lon1);
                //       const destination = new google.maps.LatLng(lat2, lon2);
                
                //       const timeout = setTimeout(() => {
                  //         console.warn("Google DistanceMatrix timeout, using haversine.");
                  //         resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
                  //       }, 3000); // Timeout after 3 seconds
                  
                  //       service.getDistanceMatrix(
                    //         {
                      //           origins: [origin],
                      //           destinations: [destination],
                      //           travelMode: google.maps.TravelMode.DRIVING,
                      //         },
                      //         (response: any, status: any) => {
                        //           clearTimeout(timeout);
                        //           if (status !== google.maps.DistanceMatrixStatus.OK) {
                          //             console.warn("Google Maps error:", status, "- using haversine.");
                          //             resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
                          //             return;
                          //           }
                          //           const element = response.rows?.[0]?.elements?.[0];
                          //           if (!element || element.status !== 'OK') {
                            //             console.warn("Invalid Google Maps response - using haversine.");
                            //             resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
                            //             return;
                            //           }
                            //           const distanceInKm = element.distance.value / 1000;
                            //           resolve(distanceInKm);
                            //         }
                            //       );
                            //     });
                            //   }
                            
                            //   haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
                              //     const R = 6371; // Radius of Earth in km
                              //     const toRad = (value: number) => value * Math.PI / 180;
                              
                              //     const dLat = toRad(lat2 - lat1);
  //     const dLon = toRad(lon2 - lon1);
  
  //     const a = Math.sin(dLat / 2) ** 2 +
  //       Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
  //       Math.sin(dLon / 2) ** 2;
  
  //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //     const distance = R * c;
  
  //     return distance * 1.45; // Add 2km buffer
  //   }
  
  async getRouteDistanceORS(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    return new Promise((resolve) => {
      // Check if Google Maps API is available
      if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.warn('Google Maps API not available, using Haversine.');
        return resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
      }
      
      const service = new google.maps.DistanceMatrixService();
      const origin = new google.maps.LatLng(lat1, lon1);
      const destination = new google.maps.LatLng(lat2, lon2);
      
      let resolved = false;
      
      // Timeout fallback (3s max wait)
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.warn('Google DistanceMatrix timeout, using Haversine.');
          resolved = true;
          resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
        }
      }, 3000);
      
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response:any, status:any) => {
          clearTimeout(timeout);
          if (resolved) return; // Prevent double resolve
          
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            console.warn('Google Maps error:', status, '- using Haversine.');
            resolved = true;
            return resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
          }
          
          const element = response?.rows?.[0]?.elements?.[0];
          if (!element || element.status !== 'OK') {
            console.warn('Invalid Google Maps response - using Haversine.');
            resolved = true;
            return resolve(this.haversineDistance(lat1, lon1, lat2, lon2));
          }
          
          const distanceInKm = element.distance.value / 1000;
          resolved = true;
          resolve(distanceInKm);
        }
      );
    });
  }
  
  haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const toRad = (v: number) => (v * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(2)); // precise result, no artificial buffer
  }
  
  getpaymentslist(id: any) {
    console.log(id);
    
    return this.http.get(`${this.baseUrl}getpaymentslist/` + id)
  }
}
