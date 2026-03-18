import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../service/api.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  @ViewChild('timeScroll') timeScroll!: ElementRef;
  @Input() restaurantdata: any;
  deliveryType=0;
  slottimingmodal:boolean=false;
  timeOptions:any = []; totaltimeslots=[];

  dateOptions = [
    { display: '', label: 'Today',slot_date:'' },
    { display: '', label: 'Tomorrow',slot_date:'' }
  ];
  
    selectedDate = this.dateOptions[0];
    selectedTime: string | null = null;
  constructor(public api: ApiService,private modalCtrl: ModalController) { }

  ngOnInit() {
   
    
    this.scheudleforlatter();
  }


  
selectslotanddate() {
 
  this.deliveryType = 1;
  this.slottimingmodal = false;

 
  const end_time = (this.totaltimeslots as { slot_timings: string; end_time: string }[])
  .find(obj => obj.slot_timings === this.selectedTime)?.end_time;

  

  this.modalCtrl.dismiss({
    dismissed: true,
    selectedDate: this.selectedDate,
    selectedTime: this.selectedTime,
    end_time:end_time

  });
  
}


scheudleforlatter() {

  var slotdates={
    location_id:localStorage.getItem("location_id"),
    // current_date: 'Wednesday'
  }
  this.api.getslotdates(slotdates).subscribe(async (res: any) => {
    if (res.status == 200) {     
      console.log(res.data);
      
      this.dateOptions=[];
      this.dateOptions = res.data;
      this.selectedDate = this.dateOptions[0];
      this.selectDate(this.dateOptions[0])

    }
  }, error => {
    
    
   })
}

selectDate(date: any) {
  this.selectedDate = date;
console.log(this.selectedDate);

 const sdata: any = this.dateOptions.find((res: any) => res.slot_date == date.slot_date)
 this.timeOptions = []
 this.timeOptions = JSON.parse(sdata.slots);
  console.log(this.timeOptions);
  
  // this.api.getslot_booking(date).subscribe(async (res: any) => {
  //   if (res.status == 200) {
  //     this.totaltimeslots = res.data;
      
  //     this.timeOptions = res.data.map((slot:any) => slot.slot_timings);
  //     // this.selectedTime=this.timeOptions[0];
      

  //   }
  // }, error => { })

}

onScrollTime() {
  if (!this.timeScroll) return;
  const container = this.timeScroll.nativeElement;
  const center = container.getBoundingClientRect().top + container.offsetHeight / 2;

  const items = container.querySelectorAll('.time-item');
  let closestItem: string | null = null;
  let closestDistance = Infinity;

  items.forEach((item: HTMLElement) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(center - itemCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item.innerText;
    }
  });

  this.selectedTime = closestItem;
}

selectTime(time: any) {
  this.selectedTime = time.slot_timings; // Set the selected time
}

closseslottimingmodal() {
  this.modalCtrl.dismiss({
    dismissed: false,
    selectedDate: this.selectedDate,
    selectedTime: this.selectedTime
  });
}

}
