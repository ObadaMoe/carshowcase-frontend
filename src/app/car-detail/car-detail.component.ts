import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCarService } from '../services/api-car.service';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.scss'],
  standalone: false
})
export class CarDetailComponent implements OnInit {
  car: any;
  imageUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiCarService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCar(id).subscribe({
      next: res => {
        this.car = res;

      },
      error: err => console.error(err)
    });
  }
}
