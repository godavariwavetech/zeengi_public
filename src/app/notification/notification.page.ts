import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  messages: any = []
  selectedSegment: string = '11'; // Initial value
  notications: any = [];


  constructor(public api: ApiService, public navctrl: NavController) { }

  ngOnInit() {
    this.get();
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    if (event.detail.value == 11) {
      this.messages = this.notications;  // Show all if status is 11
    } else {
      this.messages = this.notications.filter((item: any) => item.notication_type == event.detail.value);  // Filter by status
    }

  }

  mainnotification: any;

  get() {
    var data = {
      location_id: localStorage.getItem('location_id')
    }
    this.api.notificationslist(data).subscribe(async (res: any) => {
      if (res.status == 200) {
        
        this.notications = res.data;
      }
    })
  }


  removeMessage(message: any) {
    this.messages = this.messages.filter((msg: any) => msg !== message);
  }



  gotopage(page: any) {
    if (page == 'grievance-details' || page == 'connect' || page == 'profile') {
      if (localStorage.getItem('usr_id') == null || localStorage.getItem('usr_id') == "undefined" || localStorage.getItem('usr_id') == '') {
        if (page == 'grievance-details') {
          this.navctrl.navigateRoot('/grievance-login');
        } else if (page == 'connect') {
          this.navctrl.navigateRoot('/connect-login');
        }
      } else {
        this.navctrl.navigateForward(page);
      }
    } else {
      this.navctrl.navigateForward(page);
    }
  }


}
