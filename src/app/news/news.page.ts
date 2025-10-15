import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @ViewChild('parallaxImage', { static: false }) parallaxImage!: ElementRef;
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  isHidden = false;
  lastScrollTop = 0;
  items = new Array(10).fill('');

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;

    // Parallax effect
    if (this.parallaxImage) {
      this.parallaxImage.nativeElement.style.transform = `translateY(${scrollTop * 0.5}px)`;
    }

    // Hide/Show Header
    this.isHidden = scrollTop > this.lastScrollTop;
    this.lastScrollTop = scrollTop;
  }

}
