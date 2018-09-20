import { Component, OnInit } from '@angular/core';
import { Hero } from '../../classes/hero';
import { HeroService } from '../../services/hero.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  heroes: Hero[];

  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroes()
    .subscribe(heroes => this.heroes = heroes);
  }
  
  add(title: string): void {
	  title = title.trim();
	  if (!title) { return; }
	  this.heroService.addHero({ title } as Hero)
		.subscribe(hero => {
		  this.heroes.push(hero);
		});
	}
	
	delete(hero: Hero): void {
	  this.heroes = this.heroes.filter(h => h !== hero);
	  this.heroService.deleteHero(hero).subscribe();
	}
}