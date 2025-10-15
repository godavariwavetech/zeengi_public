import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as L from 'leaflet';


@Component({
  selector: 'app-delivery-map',
  templateUrl: './delivery-map.page.html',
  styleUrls: ['./delivery-map.page.scss'],
})
export class DeliveryMapPage implements OnInit {

  timer: number = 57;

  constructor(private navCtrl: NavController) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.loadMap();
    this.startTimer();
  }

  goBack() {
    this.navCtrl.back();
  }

  cancelOrder() {
    alert('Your order has been canceled.');
  }

  startTimer() {
    setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      }
    }, 1000);
  }

  map!: L.Map;

  // Default lat/long (Rajahmundry, India)
  defaultLat = 16.9982;
  defaultLng = 81.7836;



  loadMap() {
    setTimeout(() => { // Ensures map loads after view init
      const lat = 17.3850;  // Static latitude
      const lng = 78.4867;  // Static longitude

      this.map = L.map('map', { center: [lat, lng], zoom: 13 });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      L.marker([lat, lng]).addTo(this.map)
        .bindPopup('This is the selected location.')
        .openPopup();

      this.map.invalidateSize(); // Fixes map display issues
    }, 500); // Delays map loading slightly
  }


}
