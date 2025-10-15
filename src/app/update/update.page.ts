import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {


  ngOnInit() {
  }

  isUpdateModalOpen = true; // Open modal by default

  constructor(private platform: Platform) { }

  updateApp() {
    window.open('https://play.google.com/store/apps/details?id=com.zeengi&hl=en', '_system'); // Replace with your app store link
  }

  closeApp() {
    if (this.platform.is('android')) {
      (navigator as any).app.exitApp(); // Close the app on Android
    }
  }
}
