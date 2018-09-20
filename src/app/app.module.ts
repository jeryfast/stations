import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from './components/messages/messages.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component'; 
import { HttpClientModule }    from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { StationsComponent } from './components/stations/stations.component';
import { AirplanesComponent } from './components/airplanes/airplanes.component';
import { StationUnitsComponent } from './components/station-units/station-units.component';
import { StationStateComponent } from './components/station-state/station-state.component';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';
import { CanvasjsComponent } from './components/canvasjs/canvasjs.component';




@NgModule({
  declarations: [
    AppComponent,
    MessagesComponent,
    DashboardComponent,
    HeroSearchComponent,
    StationsComponent,
    AirplanesComponent,
    StationUnitsComponent,
    StationStateComponent,
    CanvasjsComponent
  ],
  imports: [
    BrowserModule,
	FormsModule,
	AppRoutingModule,
	HttpClientModule,
	ChartsModule,
	BrowserAnimationsModule,
	
	// The HttpClientInMemoryWebApiModule module intercepts HTTP requests
	// and returns simulated server responses.
	// Remove it when a real server is ready to receive requests.
	/*HttpClientInMemoryWebApiModule.forRoot(
	  InMemoryDataService, { dataEncapsulation: false })*/
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
