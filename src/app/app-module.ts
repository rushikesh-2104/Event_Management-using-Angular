import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TableComponent } from './components/table/table';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Cricket } from './cricket/cricket';


@NgModule({
  declarations: [
    App,
    TableComponent,
    Cricket
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
