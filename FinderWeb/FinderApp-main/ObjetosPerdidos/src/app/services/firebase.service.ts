import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Objeto } from '../models/objeto';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {


  constructor(public db: AngularFirestore,public st:AngularFireStorage) { }
  

  createDoc(path:string,data:Objeto) {
    return new Promise((resolve, reject) => {
      this.db.collection(path).add(data).then((ref) => {
        resolve(true);
      });
    });
  }

  getDoc<tipo>(path: string, id: string) {
    const collection = this.db.collection<tipo>(path);
    return collection.doc(id).valueChanges();
  }
  
  createFile(imagen:File,nombre:string) {
    var archivo = this.st.ref(nombre);
    return new Promise((resolve, reject) => {
      archivo.put(imagen)
      .then(function() {
        resolve(nombre)
      })
    });
  }

}


