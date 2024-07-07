import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Product } from 'src/app/models/product.models';
import { FirebaseService } from 'src/app/services/firebase.service';


@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit {

  userCollections: any[] = [];
  secondaryCollections: any[] = [];
  items: any[] = [];

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.loadUserCollections();
    this.loadSecondaryCollections();
  }

  async loadUserCollections() {
    const user = await this.firebaseService.getAuth().currentUser;
    if (user) {
      const path = `users/${user.uid}/products`;
      this.firebaseService.getCollectionData(path).subscribe(data => {
        this.userCollections = data;
      });
    }
  }

  async loadSecondaryCollections() {
    const path = 'objetos';
    this.firebaseService.getSecondaryCollectionData(path).subscribe(data => {
      this.secondaryCollections = data;
    });
  }
}
