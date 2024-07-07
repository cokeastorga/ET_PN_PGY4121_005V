import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Product } from 'src/app/models/product.models';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss'],
})
export class DataListComponent implements OnInit {
  items: any[];
  user = {} as User;

  constructor(private firebaseService: FirebaseService, user: User, product: Product) {
  

  }

  ngOnInit() {
    this.firebaseService.getCollectionData(`users/${this.user.uid}/products`).subscribe(data => {
      this.items = data;
    });
  }
}