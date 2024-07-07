import { Component } from '@angular/core';
import { Product } from 'src/app/models/product.models';
import { User } from 'src/app/models/user.model';


import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  items: any[] = [];
  user = {} as User;
  loading: boolean = false;
  products: Product[]=[];

 constructor(
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService
  )
  {}

  getUser(){
    return this.user = this.utilsSvc.getFromLocalStorage("user");
  }


  status(): boolean {
    return this.products && this.products.length > 0;
  }


  ionViewWillEnter(){
    this.getProducts();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 2000);
  }
//obtener productos
getProducts(){
  this.getUser();
  let path = `users/${this.user.uid}/products`;

  this.loading= true;

  let sub = this.firebaseSvc.getCollectionData(path).subscribe({
    next: (res: any) => {
      this.products = res;
      this.loading = false;
      sub.unsubscribe();
    }
  })
}

//cerrar sesion
signOut(){
  this.firebaseSvc.signOut();
}


//agregar o actualizar un productos
async addUpdateProduct(product?:Product){
  let success = await this.utilsSvc.presentModal({
    component: AddUpdateProductComponent,
    componentProps: {product}
  })

  if(success) this.getProducts();

}

async confirmDeleteProduct(product: Product) {
  this.utilsSvc.presentAlert({
    header: 'Eliminar Objeto',
    message: '¿Estás seguro de eliminar este producto?',
    mode: 'ios',
    buttons: [
      {
        text: 'Cancelar',
      },
      {
        text: 'Si, eliminar',
        handler: () => this.deleteProduct(product),
      },
    ],
  });
}
//eliminar producto
async deleteProduct(product: Product) {
  let path = `users/${this.user.uid}/products/${product.id}`;

  const loading = await this.utilsSvc.presentLoading();
  await loading.present();

  try {
    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    await this.firebaseSvc.deleteDocument(path);

    this.products = this.products.filter((p) => p.id !== product.id);

    this.utilsSvc.presentToast({
      message: 'Objeto eliminado correctamente',
      duration: 2800,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline',
    });
  } catch (error) {
    console.error(error);

    this.utilsSvc.presentToast({
      message: error.message,
      duration: 2800,
      color: 'warning',
      position: 'middle',
      icon: 'alert-circle-outline',
    });
  } finally {
    loading.dismiss();
  }
}
}
