import { Injectable } from '@angular/core';
import {Station} from '../classes/station'; 

@Injectable({
  providedIn: 'root'
})
export class StationDataService {
  stations:Station[]= [];

  add(station: Station) {
    if(!this.stations.includes(station)){
      this.stations.push(station);
    }
    /*else{
      for(let i=0;i<this.stations.length;i++) {
        let element=this.stations[i];
        if(element.id==station.id){
          delete this.stations[i];
        }
      }  
    }*/
  }

  clear() {
    this.stations = [];
  }
}
