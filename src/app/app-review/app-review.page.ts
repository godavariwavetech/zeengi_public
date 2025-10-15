import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-app-review',
  templateUrl: './app-review.page.html',
  styleUrls: ['./app-review.page.scss'],
})
export class AppReviewPage implements OnInit {

  stars: number[] = [1, 2, 3, 4, 5]; // 5-star rating system
  productrating: number = 0; // Default rating
  productcommand: string = ''; // Comment text

  constructor(public api: ApiService) { }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  // Set the rating when a star is clicked
  setRating(rating: number): void {
    this.productrating = rating;
  }

  // Submit the review
  addproductcommand(comment: string, rating: number): void {
    if (!comment.trim()) {
      alert('Please enter a valid comment.');
      return;
    }
    
    var data = {
      usr_id: localStorage.getItem('usr_id'),
      comment: comment,
      rating: rating
    }
    this.api.postapprating(data).subscribe((res: any) => {
      if (res.status == 200) {
        alert("Success")
      }
    }, (error) => {

    })

    // Reset form after submission
    this.productrating = 0;
    this.productcommand = '';
  }

}
