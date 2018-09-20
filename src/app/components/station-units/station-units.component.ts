import { Component, OnInit } from '@angular/core';
import { StationUnit } from '../../classes/station_unit';
import { StationUnitService } from '../../services/station-unit.service';

@Component({
  selector: 'app-station-units',
  templateUrl: './station-units.component.html',
  styleUrls: ['./station-units.component.css']
})
export class StationUnitsComponent implements OnInit {

  units: StationUnit[];
  
    constructor(private stationUnitsService: StationUnitService) { }

  ngOnInit() {
    this.getUnits();
  }

  getUnits(): void {
    this.stationUnitsService.getStationUnits()
    .subscribe(units => this.units = units);
  }
}
