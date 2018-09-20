import { Component, OnInit, Input } from '@angular/core';
import { StationState } from '../../classes/station_state';
import { StationStateService } from '../../services/station-state.service'; 
import { ActivatedRoute } from '@angular/router';
import { StationDataService } from '../../services/station-data.service';
import { interval } from 'rxjs';
import {Station} from '../../classes/station';
import * as CanvasJS from '../../js/canvasjs.min'

@Component({
  selector: 'app-station-state',
  templateUrl: './station-state.component.html',
  styleUrls: ['./station-state.component.css']
})
export class StationStateComponent implements OnInit {
  
  states: StationState[];
  private timer;
  public Voltagechart;
  private dataPoints:Array<Array<any>>;
  private i=0;
  private numStations=0;
  private chartInit=false;
  public refresh:boolean;
    constructor(
      private service: StationStateService,
      private route: ActivatedRoute,
      public stationDataService:StationDataService
    ) { }
    
  
  ngOnInit() {
    this.refresh=true;
    this.timer = interval(1000).subscribe(x=>this.getStates());  
    
  } 
  getStationsCount():number{
    return this.stationDataService.stations.length;
  }

  getStations():Station[]{
    return this.stationDataService.stations;
  }

  getStates(): void {         
    //let point=this.getRandomInt(6);
    //this.dataPoints.push({x:this.i,y:point});
    this.i++;
    this.service.getLastState() 
    .subscribe(states => {
      //console.log(states);
      this.states=states;         
      /*this.states.forEach(element => {
          console.log("voltage:"+element.voltage);
          this.dataPoints[element.stations_id].push({x:this.i,y:parseFloat(element.voltage)});
          this.i++;              
      });*/
     
     
    });  

    
   
  }    
  
  toogleLiveRefresh():void{
    this.refresh=!this.refresh;
    console.log(this.refresh);
    if(!this.refresh){
      this.timer.unsubscribe();
    }
    else{
      this.timer= interval(1000).subscribe(x=>this.getStates());
    }
  }

  getRandomInt(max):number {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
    
   
}
