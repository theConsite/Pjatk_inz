import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';
import { SignalService } from '../signal.service';
import { SignalProtocolStore } from '../signal-protocol-store';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  message = '';
  messages: string[] = [];
  public name: string = this.makeRandom(10);
  room = 'default';
  signalSession: libsignal.SessionCipher | undefined;

  constructor(private signalService: SignalService, private socketService: SocketService) { }

  makeRandom(lengthOfCode: number) {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678";
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;}

  async ngOnInit() {
    this.socketService.joinRoom(this.room);
    this.socketService.onMessage(async (msg) => {
      if (this.signalSession) {
        const decrypted = await this.signalService.decryptMessage(this.signalSession, msg);
        this.messages.push(decrypted);
      }
    });

    const identity = await this.signalService.generateIdentity();
    const preKeyBundle = await this.signalService.generatePreKeyBundle(identity.identityKeyPair, identity.registrationId);
    // Save preKeyBundle to backend and retrieve other user's preKeyBundle
    // Initialize signalSession here with preKeyBundle
    const store = new SignalProtocolStore();
    store.store.set('identityKey', identity.identityKeyPair);
    store.store.set('registrationId', identity.registrationId);
    // Assuming you have the other user's preKeyBundle
    const otherUserPreKeyBundle = {}; // Retrieve from backend
    const remoteUserId = new libsignal.SignalProtocolAddress(this.name, 1);
    const sessionBuilder = new libsignal.SessionBuilder(store, remoteUserId);
    await sessionBuilder.processPreKey(otherUserPreKeyBundle as any);
    this.signalSession = new libsignal.SessionCipher(store, remoteUserId);
  }

  async sendMess(event: Event) {
    event.preventDefault()
    if (this.signalSession) {
      const encrypted = await this.signalService.encryptMessage(this.signalSession, this.message);
      this.socketService.sendMessage(this.room, encrypted);
      this.message = '';
    }
  }
}