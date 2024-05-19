import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io();
  }

  joinRoom(room: string): void {
    this.socket.emit('join', room);
  }

  sendMessage(room: string, message: any): void { // Changed to `any` since message could be an encrypted object
    this.socket.emit('message', { room, message });
  }

  onMessage(callback: (msg: any) => void): void { // Changed to `any` since message could be an encrypted object
    this.socket.on('message', callback);
  }
}