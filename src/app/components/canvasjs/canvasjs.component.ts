import { Component, OnInit, Input } from '@angular/core';
import { StationState } from '../../classes/station_state';
import { StationStateService } from '../../services/station-state.service'; 
import { ActivatedRoute } from '@angular/router';
import { StationDataService } from '../../services/station-data.service';
import { interval } from 'rxjs';
import {Station} from '../../classes/station';
import * as CanvasJS from '../../js/canvasjs.min'
import { dateFieldName } from '@telerik/kendo-intl';

@Component({
  selector: 'app-canvasjs',
  templateUrl: './canvasjs.component.html',
  styleUrls: ['./canvasjs.component.css']
})
export class CanvasjsComponent implements OnInit {
  public voltageChart;
  private voltageDataset=[];
  private Voltagepoints=[];
  public currentChart;
  private timer;
  private preparedStationsCount=0;
  private statesByStations=[];
  private stations;
    //set back to false
  private chartInit=true;
  public history="24h";
  private updated=true;
  private lastTimeStamp='1999-10-10 00:00:00';
  private historyLoaded=false;
  private liveUpdate=false;
  
  constructor(
    private service: StationStateService,
    private route: ActivatedRoute,
    public stationDataService:StationDataService
  ) { }

  ngOnInit() {
    //set timer
    this.timer = interval(1000).subscribe(x=>this.checkStateCount());  
    this.checkStateCount();
  }

  onHistoryChange():void{
    if(this.getStationsCount()!=0){
      this.resetData();
      this.initCharts();
      this.renderCharts();
      this.preparedStationsCount=0;
    }   
  }

  checkStateCount():void{
    let newCount=this.getStationsCount();
    //console.log("count:"+count);
    //console.log("stationcount"+this.preparedStationsCount);        
    if(newCount==0 && this.preparedStationsCount!=0){
      this.resetData();
      this.initCharts();
      this.renderCharts();
      this.preparedStationsCount=0; 
    }
    //draw chart only after charts are no longer updated (chart reinit&render)
    if(!this.updated && newCount==this.preparedStationsCount){
        this.initCharts(); 
        this.chartInit=true; 
        this.renderCharts(); 
        this.updated=true;      
    }
    //number of chosen station changed 
    //refill history data
    else if(newCount!=this.preparedStationsCount){      
        this.chartInit=false; 
        this.resetData();
        this.preparedStationsCount=0;        
        this.fillData(newCount, callback=>{          
          //for every chart series
          //console.log("callback");
          this.preparedStationsCount++; 
          //all station`s datasets loaded
          if(newCount==this.preparedStationsCount){
            this.updated=false;
            this.historyLoaded=true;
          }
        });                
    }
    //live update - the charts
    else if(this.liveUpdate){
      this.fillData(newCount, callback=>{          
        //for every chart series
        this.liveUpdate=false;   
      });  
    }
    //live update - fill the charts dataset
    else if(this.historyLoaded){
      //console.log("live update");
      let date=this.lastTimeStamp.slice(0,10);
      let time=this.lastTimeStamp.slice(11,19)
      let datetime=date+" "+time;
      let newData=false;
      //console.log("sending "+datetime)
      this.service.getStatesLast(datetime).subscribe(states => {             
            for(var n=0;n<newCount;n++){
              //current station id
              let id=this.stations[n].id;             
              try{
                if(states[n]!=undefined && states[n].stations_id==id){
                  let value=states[n].timestamp.toString()>datetime;
                  //timestamp the same->save to send last timestamp as datetime in live update                  
                  if(value){
                    this.lastTimeStamp=states[n].timestamp;
                    console.log("UPDATING 2!!! station: "+id);                       
                    this.statesByStations.find(x=>x.key==id).value.push(states[n]); 
                    newData=true;                   
                  }
                               
                } 
              } catch(ex){
                  console.log(ex);
              }   
              
            };
            if(newData){
              this.liveUpdate=true;
            }
              
        });
    }
  
   
  }


  initCharts():void{   
      this.initVoltageChart();          
  }
  resetData():void{
    this.voltageDataset=[];
    this.statesByStations=[];
  }

  fillData(count, callback):void{
     this.stations=this.getStations();
    for(var n=0;n<count;n++){
      //current station id  
      let id=this.stations[n].id;

      //live update
      if(this.liveUpdate){
        //TODO CHANGE
        //this.voltageDataset=[];
        this.fillVoltageData(id,this.statesByStations.find(x=>x.key==id).value); 
        callback(); 
      }
      else{
      //history fill
      this.service.getStatesHistory(id,this.history).subscribe(states => {
        //states for current stations        
        if(!(id in this.statesByStations)){
              //save the last timestamp
              states.forEach(element => {
                if(element.timestamp.toString()>this.lastTimeStamp)
                  this.lastTimeStamp=element.timestamp;
              });
                //fill the dataset      
                this.statesByStations.push({
                  key:   id,
                  value: states
              }); 
              this.fillVoltageData(id,states);                                  
              //callback for every series
              callback();
          }            
      });  
      }
   
      
    }
    
  }

  getTimeOffset(timestamp):Date{
    var targetTime = new Date(timestamp);
    var timeZoneFromDB = 0.00; //time zone value from database
    //get the timezone offset from local time in minutes
    var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
    //convert the offset to milliseconds, add to targetTime, and make a new Date
    var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
    return offsetTime;
  }

  fillVoltageData(id:number, states:StationState[]){
    this.Voltagepoints[id]=[];

// get stations
  states.forEach(element=>{
   let offsetTime=this.getTimeOffset(element.timestamp);      
  this.Voltagepoints[id].push({x:offsetTime,y:parseFloat(element.voltage)});

  });

  if(this.liveUpdate){
    //set the actual datapoints
    this.voltageDataset.forEach(e => {
      if(e.name==id.toString()){
        console.log("datapoints set!");
          e.dataPoints=this.Voltagepoints[id];
      }
    });
    //only add points  
    this.Voltagepoints[id].shift();
    console.log(this.Voltagepoints[id]); 
    this.renderCharts(); 
  }
  else{
    //rebuild points and graph    
    this.voltageDataset.push({
      type: "line",    
      name: id.toString(),
      axisYType: "secondary",
      showInLegend: true,
      markerSize: 10,     
      markerType: "square",
      xValueFormatString: "DD.MM.YY, HH:mm:ss",
      dataPoints: this.Voltagepoints[id]
    });
  }
   
  }

  initVoltageChart():void{   
    this.voltageChart = new CanvasJS.Chart("voltageChart",{
      //zoomEnabled: true,
		  //animationEnabled: true,
      exportEnabled: true,
      title:{
        text:"Voltage"
      },
      axisX:{
        valueFormatString: "DD.MM HH:mm",
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY2: {
        title: "Voltage",        
        suffix: "V",
        maximum: 10,
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        horizontalAlign: "center",
        dockInsidePlotArea: true
      },
      data:this.voltageDataset
    });
    
    console.log("chart init!!")
  }

  renderCharts():void{
    //draw graphs
    if(this.chartInit){
      console.log("chart render!");
      this.voltageChart.render();
    }
  }

  

  getStationsCount():number{
    return this.stationDataService.stations.length;
  }

  getStations():Station[]{
    return this.stationDataService.stations;
  }



  getRandomInt(max):number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  //on selected stations changed re-render all graphs-add/remove lines

}
