import { Injectable } from '@angular/core';
import { Station } from '../classes/Station';
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
export class StationService {
	
  private url = '/stationsByUnits';  // URL to web api	
  constructor(
  private http: HttpClient,
  private messageService: MessageService,
  ) { }
  
	getStations(): Observable<Station[]> {
	   return this.http.post<Station[]>(this.url, null, httpOptions)
		   .pipe(
		  tap(stations => this.log('fetched stations')),
		  catchError(this.handleError('getStations', []))
		);
	}

	/* GET heroes whose name contains search term */
	/*searchHeroes(term: string): Observable<Hero[]> {
	  if (!term.trim()) {
		// if not search term, return empty hero array.
		return of([]);
	  }
	  return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
		tap(_ => this.log(`found heroes matching "${term}"`)),
		catchError(this.handleError<Hero[]>('searchHeroes', []))
	  );
	}*/
	
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
