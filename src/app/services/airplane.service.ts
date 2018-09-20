import { Injectable } from '@angular/core';
import { Airplane } from '../classes/airplane';
//import { HEROES } from './mock-heroes';
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
export class AirplaneService {
	
  private url = '/airplanes';  // URL to web api	
  constructor(
  private http: HttpClient,
  private messageService: MessageService,
  ) { }
  
	getAirplanes(): Observable<Airplane[]> {
	   return this.http.post<Airplane[]>(this.url, null, httpOptions)
		   .pipe(
		  tap(heroes => this.log('fetched airplanes')),
		  catchError(this.handleError('getAirplanes', []))
		);
	}

	/*getHero(id: number): Observable<Hero> {
	   const url = `${this.url}/${id}`;
	  return this.http.get<Hero>(url).pipe(
		tap(_ => this.log(`fetched hero id=${id}`)),
		catchError(this.handleError<Hero>(`getHero id=${id}`))
	  );
	}
	

	updateHero (hero: Hero): Observable<any> {
	  return this.http.put(this.url, hero, httpOptions).pipe(
		tap(_ => this.log(`updated hero id=${hero.id}`)),
		catchError(this.handleError<any>('updateHero'))
	  );
	}

	addHero (hero: Hero): Observable<Hero> {
	  return this.http.post<Hero>(this.url, hero, httpOptions).pipe(
		tap((hero: Hero) => this.log(`added hero w/ id=${hero.id}`)),
		catchError(this.handleError<Hero>('addHero'))
	  );
	}
	

	deleteHero (hero: Hero | number): Observable<Hero> {
	  const id = typeof hero === 'number' ? hero : hero.id;
	  const url = `${this.url}/${id}`;

	  return this.http.delete<Hero>(url, httpOptions).pipe(
		tap(_ => this.log(`deleted hero id=${id}`)),
		catchError(this.handleError<Hero>('deleteHero'))
	  );
    }
	

	searchHeroes(term: string): Observable<Hero[]> {
	  if (!term.trim()) {
		// if not search term, return empty hero array.
		return of([]);
	  }
	  return this.http.get<Hero[]>(`${this.url}/?name=${term}`).pipe(
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
	  this.messageService.add(`HeroService: ${message}`);
	}

}
