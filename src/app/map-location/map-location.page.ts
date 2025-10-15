import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

declare const google: any; // Explicitly declare Google Maps

@Component({
  selector: 'app-map-location',
  templateUrl: './map-location.page.html',
  styleUrls: ['./map-location.page.scss'],
})


export class MapLocationPage implements OnInit {
  map!: any;
  marker!: any;
  latitude: any;
  longitude: any;
  address: any;

  constructor() { }
  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.loadMap();
  }

  async loadMap() {
    const mapElement = document.getElementById('map') as HTMLElement;
  
    this.map = new google.maps.Map(mapElement, {
      center: { lat: 20.5937, lng: 78.9629 }, // Default location (India)
      zoom: 6,
      disableDefaultUI: true, 
      zoomControl: false, 
      mapTypeControl: false, 
      streetViewControl: false, 
      fullscreenControl: false, 
    });
  
    // Add click event listener to set a marker at the clicked location
    this.map.addListener('click', (event: any) => {
      this.setMapMarker(event.latLng.lat(), event.latLng.lng());
      this.getAddress(event.latLng.lat(), event.latLng.lng());
    });
  
    // Listen for dragend event to update marker and address
    this.map.addListener('dragend', () => {
      const center = this.map.getCenter();
      if (center) {
        this.setMapMarker(center.lat(), center.lng()); // Move marker to new center
        this.getAddress(center.lat(), center.lng());  // Get address of new location
      }
    });
  
    // Get user's current location when map loads
    await this.getCurrentLocation();
  }

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.setMapMarker(this.latitude, this.longitude);
      this.getAddress(this.latitude, this.longitude);
    } catch (error) {
      console.error('Error getting location', error);
    }
  }

  setMapMarker(lat: number, lng: number) {
    if (!this.map) return;

    const position = new google.maps.LatLng(lat, lng);
    const iconUrl = 'assets/icon/pointer.png'; // ✅ Path to your custom marker

    if (this.marker) {
      this.marker.setPosition(position);
    } else {
      this.marker = new google.maps.Marker({
        position,
        map: this.map,
        icon: {
          url: iconUrl, // ✅ Custom marker image
          scaledSize: new google.maps.Size(50, 50), // Adjust size if needed
        },
        title: 'Selected Location',
      });
    }

    this.latitude = lat;
    this.longitude = lng;
    this.map.setCenter(position);
    this.map.setZoom(15);
  }

  getAddress(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);
    localStorage.setItem('setlatlongs', lat + ',' + lng)
    geocoder.geocode({ location: latlng }, (results: any, status: string) => {
      if (status === 'OK' && results[0]) {
        this.address = results[0].formatted_address;
        localStorage.setItem('setlocation', this.address);
      } else {
        console.error('Geocoder failed due to:', status);
      }
    });
  }

}
