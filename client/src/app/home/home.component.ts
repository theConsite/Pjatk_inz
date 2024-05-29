import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import * as CryptoJS from 'crypto-js';
import { UserData } from '../global-models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private http: HttpClient){

  }
  public formData: UserData = new UserData();

  joinChat(event: Event){
    event.preventDefault()
    let passWd = null
    if(this.formData.pass){
      passWd = CryptoJS.SHA512(this.formData.pass).toString()
    }
    this.http.post('/validate-chat', {user: this.formData.uName, room: this.formData.room, password: passWd}).subscribe(
      (data) =>{
        localStorage.setItem('connData', JSON.stringify(this.formData))
        window.location.href = '/chat'
      },
      err =>{
        console.log(err)
      }
    )
  }

  fillRandom(event: Event){
    event.preventDefault()
    this.formData.room = uuidv4();
    this.formData.uName = this.makeRandomName(16)
  }

  makeRandomName(lengthOfCode: number) {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678";
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;
  }

}
