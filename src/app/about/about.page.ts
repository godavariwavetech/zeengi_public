import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  constructor() { }

  ngOnInit() {
    this.getAppVersion()
  }

  appVersion: any = ''

  async getAppVersion() {
    const info = await App.getInfo();
    
    this.appVersion = info.version; // Retrieve the version number
  }

}
