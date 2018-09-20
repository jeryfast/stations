import { Component, OnInit } from '@angular/core';
import { Airplane } from '../../classes/airplane';
import { AirplaneService } from '../../services/airplane.service';
@Component({
  selector: 'app-airplanes',
  templateUrl: './airplanes.component.html',
  styleUrls: ['./airplanes.component.css']
})
export class AirplanesComponent implements OnInit {
  airplanes: Airplane[];

  constructor(private airplaneService: AirplaneService) { }

  ngOnInit() {
    this.getAirplanes();
  }

  getAirplanes(): void {
    this.airplaneService.getAirplanes()
    .subscribe(airplanes => this.airplanes = airplanes);
  }
}
