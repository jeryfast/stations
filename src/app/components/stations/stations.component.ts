import { Component, OnInit, Input } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Station } from '../../classes/station';
import { StationService } from '../../services/station.service';
import {StationDataService} from '../../services/station-data.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.css']
})
export class StationsComponent implements OnInit {
  stations: Station[];
  stationsById: Station[];
  selected:Station;
  @Input() id: number;

    constructor(
      private stationService: StationService,
      private stationDataService:StationDataService
    ) { }

  ngOnInit() {
    this.getStations();
  }

  getStations(): void {
    this.stationService.getStations()
    .subscribe(stations => this.stations = stations);
  }

  equal(a,b):boolean{
     return a==b;
  }

  onSelect(station:Station):void{
    this.stationDataService.add(station);
    console.log("selected"+station.id);
  }

  /*getStationsById(){
    this.stationsById.filter(this.stations.map)
  }*/
}