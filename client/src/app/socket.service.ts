import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  connect(): void {
    this.socket = io(window.location.origin + '/chat');
    const that = this;
    this.socket.on('connect', function() {
      that.socket.emit('joined', {});
  });
    }

  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  on(event: string, callback: Function): void {
    this.socket.on(event, (data) => {
      callback(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.emit('left', {})
      this.socket.disconnect();
    }
  }
}