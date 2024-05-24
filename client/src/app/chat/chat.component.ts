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
  public keys: string[] = [];

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
          this.keys = [];
          this.sendPubKey()
          this.messages.push({name: 'server', msg: message.msg});
        });
        this.socket.on('key', (message: any) => {
          if(message.name != this.name){
            this.recievePKey(message.key)
          }else{
            console.log('Own key')
          }
        });
      },err => {
      }
    );
  }


  sendPubKey(){
    console.log('sendKey')
    this.socket.emit('pubKeyEmit', this.keyPair.publicKey.toString(16))
  }

  recievePKey(key: string){
    this.keys.push(key)
    const secrets: BigInteger[] = this.keys.map(publicKey => 
      this.crypto.computeSecret(publicKey, this.keyPair.privateKey)
    );
    console.log(secrets)
    this.sharedSecret = this.crypto.deriveSharedKey(secrets);
    console.log(this.sharedSecret)
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