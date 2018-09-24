import { Component, OnInit, Input } from '@angular/core';
import { StationState } from '../../classes/station_state';
import { StationStateService } from '../../services/station-state.service';
import { ActivatedRoute } from '@angular/router';
import { StationDataService } from '../../services/station-data.service';
import { interval } from 'rxjs';
import { Station } from '../../classes/station';
import * as CanvasJS from '../../js/canvasjs.min'
import { dateFieldName } from '@telerik/kendo-intl';

@Component({
  selector: 'app-canvasjs',
  templateUrl: './canvasjs.component.html',
  styleUrls: ['./canvasjs.component.css']
})
export class CanvasjsComponent implements OnInit {
  //voltage
  public voltageChart;
  private voltageDataset = [];
  private voltagepoints = [];
  //current
  public currentChart;
  private currentDataset = [];
  private currentpoints = [];
  //power
  public powerChart;
  private powerDataset = [];
  private powerpoints = [];


  private timer;
  private preparedStationsCount = 0;
  private statesByStations = [];
  private stations;
  //set back to false
  private chartInit = true;
  public history = "1h";
  private updated = true;
  private startTimeStamp = '1999-10-10 00:00:00';
  private lastTimeStamp = this.startTimeStamp;
  private historyLoaded = false;
  private liveUpdate = false;
  private liveUpdateCount = 0;

  constructor(
    private service: StationStateService,
    private route: ActivatedRoute,
    public stationDataService: StationDataService
  ) { }

  ngOnInit() {
    //set timer
    this.timer = interval(1000).subscribe(x => this.checkStateCount());
    this.checkStateCount();
  }

  //the history dropdown value changed
  onHistoryChange(): void {
    if (this.getStationsCount() != 0) {
      this.resetData();
      this.initCharts();
      this.renderCharts();
      this.preparedStationsCount = 0;
    }
  }

  //check for new states every second
  checkStateCount(): void {
    let newCount = this.getStationsCount();
    //console.log("count:"+count);
    //console.log("stationcount"+this.preparedStationsCount);    

    //chart data was cleared -> reset the chart
    if (newCount == 0 && this.preparedStationsCount != 0) {
      this.resetData();
      this.initCharts();
      this.renderCharts();
      this.preparedStationsCount = 0;
    }
    //draw chart only after charts are no longer updated (chart reinit&render)
    if (!this.updated && newCount == this.preparedStationsCount) {
      this.initCharts();
      this.chartInit = true;
      this.renderCharts();
      this.updated = true;
    }
    //number of chosen station changed 
    //refill history data
    else if (newCount != this.preparedStationsCount) {
      this.chartInit = false;
      this.resetData();
      this.preparedStationsCount = 0;
      this.fillData(newCount, callback => {
        //for every chart series
        console.log("callback");
        this.preparedStationsCount++;
        //all station`s datasets loaded
        if (newCount == this.preparedStationsCount) {
          this.updated = false;
          this.historyLoaded = true;
        }
      });
    }
    //live update - the charts data
    else if (this.liveUpdate && this.liveUpdateCount == 0) {
      this.fillData(newCount, callback => {
        //for every chart series increase the count               
        this.liveUpdateCount++;
        if (this.liveUpdateCount == newCount) {
          this.liveUpdate = false;
        }
      });
    }
    //live update - fill the charts dataset as the history was loaded
    else if (this.historyLoaded) {
      //console.log("live update");
      let datetime = this.timestampToDateTime(this.lastTimeStamp);
      let newData = false;
      //console.log("sending "+datetime)
      //if no history, a live update datetime is now()
      if (this.lastTimeStamp.localeCompare(this.startTimeStamp) == 0) {
        datetime = this.lastTimeStamp = this.timestampToDateTime(new Date(Date.now()).toISOString())
      }
      //get last state for all stations and check if new data exists (newer timestamp from the lastTimestamp)
      this.service.getStatesLast(datetime).subscribe(states => {
        let timestampToWrite;
        //TODO OPTIMIZE LOOPS!!!!!!!!
        for (var n = 0; n < newCount; n++) {
          //current station id
          let id = this.stations[n].id;
          console.log(id);
          try {
            states.forEach(element => {
              if (element != undefined && element.stations_id == id) {
                let value = element.timestamp.toString() > datetime;
                if (value) {
                  //dont overwrite the datetime representing the lasttimestamp as you need to check every station with the same timestamp
                  timestampToWrite = element.timestamp;
                  console.log("UPDATING 2!!! station: " + id);
                  //push the state to updated dictionary
                  this.statesByStations.find(x => x.key == id).value.push(element);
                  newData = true;
                }
              }
            });
          } catch (ex) {
            console.log(ex);
          }

        };
        //if data was updated:
        //update the lasttimestamp and other "states" only now
        if (newData) {
          this.lastTimeStamp = timestampToWrite;
          this.liveUpdate = true;
          this.liveUpdateCount = 0;
        }

      });
    }


  }

  timestampToDateTime(timestamp: string): string {
    let date = timestamp.slice(0, 10);
    let time = timestamp.slice(11, 19)
    return date + " " + time;

  }

  initCharts(): void {
    this.initVoltageChart();
    this.initCurrentChart();
    this.initPowerChart();
  }
  resetData(): void {
    //parameters
    this.voltageDataset = [];
    this.currentDataset = [];
    this.powerDataset = [];
    this.statesByStations = [];
  }

  fillData(count, callback): void {
    this.stations = this.getStations();
    for (var n = 0; n < count; n++) {
      //current station id  
      let id = this.stations[n].id;

      //live update
      if (this.liveUpdate) {
        this.fillActualData(id, this.statesByStations.find(x => x.key == id).value);
        callback();
      }
      else {
        this.fillHistoryData(id, callback);
      }
    }
  }

  fillHistoryData(id: number, callback): void {
    //history fill
    this.service.getStatesHistory(id, this.history).subscribe(states => {
      //states for current stations        
      if (!(id in this.statesByStations)) {
        //save the last timestamp
        states.forEach(element => {
          if (element.timestamp.toString() > this.lastTimeStamp)
            this.lastTimeStamp = element.timestamp;
        });
        //fill the dataset      
        this.statesByStations.push({
          key: id,
          value: states
        });
        this.fillActualData(id, states);
        //callback for every series
        callback();
      }
    });
  }

  getTimeOffset(timestamp): Date {
    var targetTime = new Date(timestamp);
    var timeZoneFromDB = 0.00; //time zone value from database
    //get the timezone offset from local time in minutes
    var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
    //convert the offset to milliseconds, add to targetTime, and make a new Date
    var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
    return offsetTime;
  }

  fillActualData(id: number, states: StationState[]) {
    //parameters
    this.voltagepoints[id] = [];
    this.currentpoints[id] = [];
    this.powerpoints[id] = [];

    // get states and reload the voltagepoints
    states.forEach(element => {
      let offsetTime = this.getTimeOffset(element.timestamp);
      //parameters
      this.voltagepoints[id].push({ x: offsetTime, y: parseFloat(element.voltage) });
      this.currentpoints[id].push({ x: offsetTime, y: parseFloat(element.current) });
      this.powerpoints[id].push({ x: offsetTime, y: (parseFloat(element.voltage) * parseFloat(element.current)) });

    });

    if (this.liveUpdate) {
      //set the actual datapoints
      //voltage
      this.voltageDataset.forEach(e => {
        if (e.name == id.toString()) {
          console.log("datapoints set!");
          e.dataPoints = this.voltagepoints[id];
        }
      });
      //current
      this.currentDataset.forEach(e => {
        if (e.name == id.toString()) {
          console.log("datapoints set!");
          e.dataPoints = this.currentpoints[id];
        }
      });
      //power
      this.powerDataset.forEach(e => {
        if (e.name == id.toString()) {
          console.log("datapoints set!");
          e.dataPoints = this.powerpoints[id];
        }
      });


      console.log(this.voltagepoints[id]);
      this.renderCharts();
    }
    else {
      //rebuild points and graph  
      //voltage
      this.voltageDataset.push({
        type: "line",
        name: id.toString(),
        axisYType: "secondary",
        showInLegend: true,
        markerSize: 10,
        markerType: "square",
        xValueFormatString: "DD.MM.YY, HH:mm:ss",
        dataPoints: this.voltagepoints[id]
      });
      //current
      this.currentDataset.push({
        type: "line",
        name: id.toString(),
        axisYType: "secondary",
        showInLegend: true,
        markerSize: 10,
        markerType: "square",
        xValueFormatString: "DD.MM.YY, HH:mm:ss",
        dataPoints: this.currentpoints[id]
      });
      //power
      this.powerDataset.push({
        type: "line",
        name: id.toString(),
        axisYType: "secondary",
        showInLegend: true,
        markerSize: 10,
        markerType: "square",
        xValueFormatString: "DD.MM.YY, HH:mm:ss",
        dataPoints: this.powerpoints[id]
      });
    }

  }

  initVoltageChart(): void {
    this.voltageChart = new CanvasJS.Chart("voltageChart", {
      zoomEnabled: true,
      //animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Voltage"
      },
      axisX: {
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
      data: this.voltageDataset
    });

    console.log("chart init!!")
  }

  initCurrentChart(): void {
    this.currentChart = new CanvasJS.Chart("currentChart", {
      zoomEnabled: true,
      //animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Current"
      },
      axisX: {
        valueFormatString: "DD.MM HH:mm",
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY2: {
        title: "Current",
        suffix: "A"
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
      data: this.currentDataset
    });

    console.log("current chart init!!")
  }

  initPowerChart(): void {
    this.powerChart = new CanvasJS.Chart("powerChart", {
      zoomEnabled: true,
      //animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Power"
      },
      axisX: {
        valueFormatString: "DD.MM HH:mm",
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY2: {
        title: "Power",
        suffix: "W"
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
      data: this.powerDataset
    });

    console.log("power chart init!!")
  }



  renderCharts(): void {
    //draw graphs
    if (this.chartInit) {
      console.log("chart render!");
      this.voltageChart.render();
      this.currentChart.render();
      this.powerChart.render();
    }
  }



  getStationsCount(): number {
    return this.stationDataService.stations.length;
  }

  getStations(): Station[] {
    return this.stationDataService.stations;
  }



  getRandomInt(max): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  //on selected stations changed re-render all graphs-add/remove lines

}
