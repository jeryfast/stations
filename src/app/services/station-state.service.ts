import { Injectable } from '@angular/core';
import { StationState } from '../classes/station_state';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 
  'Content-Type': 'application/json',
  'Authorization': environment.jwt_token
  })
};


@Injectable({
providedIn: 'root'
})
export class StationStateService {

private url = '/lastStationStates';  // URL to web api	
private statesUrl = '/stationStates';
private statesHistoryUrl = '/stationStatesHistory';
private liveUrl = '/lastStationStatesUpdate'
constructor(
private http: HttpClient,
private messageService: MessageService,
) { }

getLastState(): Observable<StationState[]> {
   return this.http.post<StationState[]>(this.url, httpOptions)
     .pipe(
    tap(stations => this.log('fetched StationLastStates')),
    catchError(this.handleError('getLastStates', []))
  );
}

getStates(id:number):Observable<StationState[]> {
  var body={
    "station_id":id  
}
  return this.http.post<StationState[]>(this.statesUrl, body, httpOptions)
    .pipe(
   tap(stations => this.log('fetched StationStates')),
   catchError(this.handleError('getStates', []))
 );
}

getStatesHistory(id:number, history:string):Observable<StationState[]> {
  var body={
    "station_id":id,
    "history":history  
}
  return this.http.post<StationState[]>(this.statesHistoryUrl, body, httpOptions)
    .pipe(
   tap(stations => this.log('fetched StationStates')),
   catchError(this.handleError('getStates', []))
 );
}

//get last states after some timestamp for all stations
getStatesLast(timestamp:string):Observable<StationState[]> {
  var body={
    "timestamp":timestamp
}
  return this.http.post<StationState[]>(this.liveUrl, body, httpOptions)
    .pipe(
   tap(stations => this.log('fetched live states')),
   catchError(this.handleError('getStatesLast', []))
 );
}



  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}

	private log(message: string) {
	  this.messageService.add(`StationService: ${message}`);
	}
}
