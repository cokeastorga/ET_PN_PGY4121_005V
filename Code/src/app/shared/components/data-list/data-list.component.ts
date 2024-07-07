import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit {

  userCollections: any[] = [];
  secondaryCollections: any[] = [];
  hasMatch: boolean = false;
  matchMessage: string = '';

  constructor(private firebaseService: FirebaseService, private alertController: AlertController) { }

  ngOnInit() {
    this.loadUserCollections();
    this.loadSecondaryCollections();
  }

  async presentNotificationAlert() {
    const alert = await this.alertController.create({
      header: 'OBJETO ENCONTRADO',
      message: this.matchMessage,
      buttons: ['OK']
    });
    await alert.present();
  }

  async loadUserCollections() {
    const user = await this.firebaseService.getAuth().currentUser;
    if (user) {
      const path = `users/${user.uid}/products`;
      this.firebaseService.getCollectionData(path).subscribe(data => {
        this.userCollections = data;
        this.checkForMatches(); // Verificar coincidencias después de cargar los datos
      });
    }
  }

  async loadSecondaryCollections() {
    const path = 'objetos';
    this.firebaseService.getSecondaryCollectionData(path).subscribe(data => {
      this.secondaryCollections = data;
      this.checkForMatches(); // Verificar coincidencias después de cargar los datos
    });
  }

  checkForMatches() {
    for (let userItem of this.userCollections) {
      for (let secondaryItem of this.secondaryCollections) {
        if (userItem.category === secondaryItem.titulo && userItem.site === secondaryItem.ubicacion) {
          this.hasMatch = true;
          this.matchMessage = `DIRIGITE AL REPOSITORIO FINDER MAS CERCANO AL LUGAR DE PERDIDA "Objeto encontrado: ${userItem.category}" / "Ubicación: ${userItem.site}"`;
          this.presentNotificationAlert(); // Mostrar la alerta si hay coincidencia
          return;
        }
      }
    }
  }
}
