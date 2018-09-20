import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StationsComponent}      from './components/stations/stations.component';
import {AirplanesComponent}     from './components/airplanes/airplanes.component';
import { StationState } from './classes/station_state';

 const routes: Routes = [
  { path: 'stations', component: StationsComponent },
  { path: 'stations/:id', component: StationState },
  { path: 'airplanes', component: AirplanesComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
 
})
export class AppRoutingModule {}

