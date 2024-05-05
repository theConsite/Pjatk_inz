import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  public room : string = 'test';
  public name: string = this.makeRandom(10);
  public messages: string[] = [];
  public input: string = '';

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event: any) {
    this.socket.disconnect()
  }

  constructor(private http: HttpClient, private socket: SocketService){
  }
  ngOnInit(): void {
    this.http.post('/register-user', {name: this.name, room: this.room}).subscribe(
      data => {
        this.socket.connect();
        this.socket.on('message', (message: any) => {
          this.messages.push(message.msg);
        });
        this.socket.on('status', (message: any) => {
          this.messages.push(message.msg);
        });
      },err => {
      }
    );
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
    this.socket.emit('text', {msg: this.input});
    this.input = '';
  }

}