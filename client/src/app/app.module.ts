import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SocketService } from './services/socket-service/socket.service';
import { ChatComponent } from './chat/chat.component';
import { CryptoService } from './services/crypto-service/crypto-service.service';


@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
    ],
  providers: [
    SocketService,
    CryptoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
