import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  titulo="";
  descripcion="";
  ubicacion="";
  imagen:any;
  fecha="";
  nombre="";
  telefono="";

  @ViewChild('firstView') firstView: ElementRef | undefined;
  @ViewChild('secondView') secondView: ElementRef | undefined;
  
  constructor(private firebase:FirebaseService,private toastController:ToastController,private renderer: Renderer2) {}

  abrirFormulario() {
    this.renderer.addClass(this.firstView!.nativeElement, 'top');

    this.renderer.addClass(this.secondView!.nativeElement, 'top');
    this.renderer.removeClass(this.secondView!.nativeElement, 'd-none');
  }

  validar() {
    if(this.titulo == "") {
      this.showToast("danger","Debe completar el campo titulo");
      return false;
    } else if(this.descripcion == "") {
      this.showToast("danger","Debe completar el campo descripcion");
      return false;
    } else if(this.fecha == "") {
      this.showToast("danger","Debe completar el campo fecha");
      return false;
    } else if(this.ubicacion == "") {
      this.showToast("danger","Debe completar el campo ubicacion");
      return false;
    } else if(!this.imagen) {
      this.showToast("danger","Debe seleccionar una imagen");
      return false;
    } else if(this.nombre == "") {
      this.showToast("danger","Debe completar el campo nombre de contacto");
      return false;
    } else if(this.telefono == "") {
      this.showToast("danger","Debe completar el campo telefono de contacto");
      return false;
    }
    return true;
  }


  async enviarFormulario() {
    if(!this.validar()) return false;
    
    var imagenName = this.imageName();
    var data = {
      titulo:this.titulo,
      descripcion:this.descripcion,
      ubicacion:this.ubicacion,
      fecha_encontrado:this.fecha,
      imagen:'uploads/'+imagenName,
      nombre:this.nombre,
      telefono:this.telefono
    }
  
    // se crea el archivo en storage
    this.firebase.createFile(this.imagen,'uploads/'+imagenName);

    // se crea el doc en firestore
    var createDoc = this.firebase.createDoc('objetos',data);
    if(await createDoc) {
      this.nombre="";
      this.titulo="";
      this.descripcion="";
      this.fecha="";
      this.ubicacion="";
      this.imagen = null;
      this.telefono="";
      this.showToast("success","Objeto registrado correctamente");
    } else 
      this.showToast("danger",'Ocurrio un error');

    return true;
  }

  imageName() {
    const prevName = this.imagen.name;
    const newTime = Math.floor(Date.now() / 1000);
    const lastDotIndex = prevName.lastIndexOf('.');
    const ext = prevName.substring(lastDotIndex + 1)
    return Math.floor(Math.random() * 20) + newTime+"."+ext;
  }

  onFileChosen(fileChangeEvent:any) {
    this.imagen = fileChangeEvent.target.files[0];
  }

  async showToast(color:any,msg:any,duracion=3000) {
    const toast = await this.toastController.create({
      message: msg,
      duration: duracion,
      color:color
    });

    await toast.present();
  }

}
