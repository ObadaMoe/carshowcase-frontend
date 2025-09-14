import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CarDetailDto, CarListItemDto, PagedResult } from '../models/car.model';


@Injectable({ providedIn: 'root' })
export class ApiCarService {
  private base = `${environment.apiBase}/Cars`;

  constructor(private http: HttpClient) {}

  getCars(q: string, page: number, pageSize: number) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (q) params = params.set('q', q);
    return this.http.get<PagedResult<CarListItemDto>>(this.base, { params });
  }

  getCar(id: number) {
    return this.http.get<CarDetailDto>(`${this.base}/CarInfo-${id}`);
  }


  addCar(data: { company: string; model: string; price: number; description?: string; file?: File | null; }) {

    const fd = new FormData();
    fd.append('Company', data.company);
    fd.append('Model', data.model);
    fd.append('Price', String(data.price));
    if (data.description) fd.append('Description', data.description);
    if (data.file) fd.append('Image', data.file);
    return this.http.post<any>(`${this.base}/AddCar-${data.company}-${data.model}`, fd);
  }

  updateCar(id: number, data: { company: string; model: string; price: number; description?: string; file?: File | null; }) {
    const fd = new FormData();
    fd.append('Company', data.company);
    fd.append('Model', data.model);
    fd.append('Price', String(data.price));
    if (data.description) fd.append('Description', data.description);
    if (data.file) fd.append('Image', data.file);
    return this.http.put<void>(`${this.base}/UpdateCar-${id}-${data.company}-${data.model}`, fd);
  }

  deleteCar(id: number) {

    return this.http.delete<void>(`${this.base}/DeleteCar-${id}`);
  }
}
