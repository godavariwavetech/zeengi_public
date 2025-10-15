import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-sub-subscribe',
  templateUrl: './sub-subscribe.page.html',
  styleUrls: ['./sub-subscribe.page.scss'],
})
export class SubSubscribePage implements OnInit {

  maindetails: any
  receviedorders: any
  constructor(public navCtrl: NavController, private route: ActivatedRoute, public api: ApiService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['subscribe_details']) {
        const data = JSON.parse(params['subscribe_details']);
        this.maindetails = data;
        console.log(this.maindetails);
        

        var data2 = {
          order_id: data.id
        }
        this.api.getrecieved_subscripitioin_order_itemCtrl(data2).subscribe((res: any) => {
          if (res.status == 200) {
            this.receviedorders = res.data;
          }
        })
      }
    });
  }

  gotoback() {
    this.navCtrl.navigateRoot('/home');
  }

}
