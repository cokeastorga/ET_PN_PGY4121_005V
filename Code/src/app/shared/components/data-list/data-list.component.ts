import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';
import Long from 'long';



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
  model: use.UniversalSentenceEncoder;

  constructor(private firebaseService: FirebaseService, private alertController: AlertController) { }

  async ngOnInit() {
    this.model = await use.load();
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
 
  async getEmbedding(text: string): Promise<tf.Tensor> {
    const embeddings = await this.model.embed([text]);
    return embeddings.array().then((array: any) => tf.tensor(array[0]));
  }

  cosineSimilarity(a: tf.Tensor, b: tf.Tensor): number {
    const dotProduct = tf.dot(a, b).dataSync()[0];
    const normA = tf.norm(a).dataSync()[0];
    const normB = tf.norm(b).dataSync()[0];
    return dotProduct / (normA * normB);
  }

  async checkForMatches() {
    for (let userItem of this.userCollections) {
      const userCategoryEmbedding = await this.getEmbedding(userItem.category);
      const userSiteEmbedding = await this.getEmbedding(userItem.site);
      const userDescriptionEmbedding = await this.getEmbedding(userItem.description); // Embedding para la descripción del usuario

      for (let secondaryItem of this.secondaryCollections) {
        const secondaryCategoryEmbedding = await this.getEmbedding(secondaryItem.titulo);
        const secondarySiteEmbedding = await this.getEmbedding(secondaryItem.ubicacion);
        const secondaryDescriptionEmbedding = await this.getEmbedding(secondaryItem.descripcion); // Embedding para la descripción secundaria

        const categorySimilarity = this.cosineSimilarity(userCategoryEmbedding, secondaryCategoryEmbedding);
        const siteSimilarity = this.cosineSimilarity(userSiteEmbedding, secondarySiteEmbedding);
        const descriptionSimilarity = this.cosineSimilarity(userDescriptionEmbedding, secondaryDescriptionEmbedding); // Calcular similitud para la descripción

        if (categorySimilarity > 0.5 && siteSimilarity > 0.5 && descriptionSimilarity > 0.5) { // Ajusta el umbral de similitud según tus necesidades
          this.hasMatch = true;
          this.matchMessage = `Acercate al Repositorio Finder mas cercano "Objeto encontrado: ${userItem.category}" / "Ubicación: ${userItem.site} /  "Descripción: ${userItem.description}"`;
          this.presentNotificationAlert(); // Mostrar la alerta si hay coincidencia
          return;
        }
      }
    }
  }
}