import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { BackgroundImageComponent } from './background-image/background-image.component';

@NgModule({
  imports:      [ BrowserModule, MatCardModule, MatButtonModule, RouterOutlet ],
  declarations: [ AppComponent, BackgroundImageComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }