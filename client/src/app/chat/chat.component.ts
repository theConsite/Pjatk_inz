import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../services/socket-service/socket.service';
import { CryptoService } from '../services/crypto-service/crypto-service.service';
import { BigInteger } from 'jsbn';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  public room : string = 'test';
  public name: string = this.makeRandom(10);
  public messages: {name: string, msg: string}[] = [];
  public input: string = '';
  public keyPair: {publicKey: BigInteger, privateKey: BigInteger};
  public sharedSecret: string = '';
  public lastSecret: BigInteger | null = null;

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event: any) {
    this.socket.disconnect()
  }

  constructor(private http: HttpClient, private socket: SocketService, private crypto: CryptoService){
    this.keyPair = this.crypto.generateKeyPair();
  }

  ngOnInit(): void {
    console.log(this.keyPair)
    this.http.post('/register-user', {name: this.name, room: this.room}).subscribe(
      data => {
        this.socket.connect();
        this.socket.on('message', (message: any) => {
          this.messages.push({name: message.name, msg: this.crypto.decryptMessage(message.msg, this.sharedSecret)});
        });
        this.socket.on('status', (message: any) => {
          this.sharedSecret = '';
          this.sendPubKey(this.keyPair.publicKey)
          this.messages.push({name: 'server', msg: message.msg});
        });
        this.socket.on('key', (message: any) => {
          console.log(message)
          this.recievePKey(message)
        });
      },err => {
      }
    );
  }


  sendPubKey(key: BigInteger, i=0){
    this.socket.emit('pubKeyEmit', {key: key.toString(16), i:i})
  }

  recievePKey(keyData: {key: string, i: number, name: string, isLast: boolean, isSingleRoom: boolean}){
    if(keyData.isSingleRoom){
      return;
    }
    let secret;
    if(keyData.i == 0){
      secret = this.crypto.computeSecret(keyData.key, this.keyPair.privateKey)
    }else{
      secret = this.crypto.computeSecret(keyData.key, this.keyPair.privateKey)
    }
    this.lastSecret = secret;
    if(!keyData.isLast){
      this.sendPubKey(secret, keyData.i+1)
    }else{
      this.sharedSecret = this.crypto.deriveSharedKey(secret);
      console.log(this.sharedSecret)
    }
    
  }


  ngOnDestroy(): void {
    this.socket.disconnect()
  }


  makeRandom(lengthOfCode: number) {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678";
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;
  }

  sendMess(event: Event){
    event.preventDefault()
    this.socket.emit('text', this.crypto.encryptMessage(this.input, this.sharedSecret));
    this.input = '';
  }

}