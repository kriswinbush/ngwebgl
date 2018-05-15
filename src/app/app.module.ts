import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WindowService } from './core/services/window.service';
import { LibsService } from "./core/services/libs.service";
import { ShadersService } from './core/services/shaders.service';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    WindowService,
    LibsService,
    ShadersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
