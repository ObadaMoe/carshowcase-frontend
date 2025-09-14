// src/app/services/car.service.ts
import { Injectable } from '@angular/core';
import { Car } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private cars: Car[] = [];
  private nextId = 1;

  constructor() {
    if (this.cars.length === 0) {
      const companies = ['Toyota','Honda','BMW','Mercedes','Audi','Ford','Chevrolet','Hyundai','Kia','Nissan'];
      const models    = ['Sedan','Hatchback','SUV','Coupe','Crossover','Truck','Convertible','Wagon','Sport','Luxury'];
      for (let i = 1; i <= 30; i++) {
        this.add({
          company: companies[(i - 1) % companies.length],
          model: `${models[(i - 1) % models.length]} ${i}`,
          price: 40000 + (i * 750),
          imageUrl: `https://picsum.photos/seed/car${i}/600/400`,
          description: 'Clean title. Runs and drives. (Mock)'
        });
      }
    }
  }

  getAll(): Car[] {
    return [...this.cars];
  }

  getById(id: number): Car | undefined {
    return this.cars.find(c => c.id === id);
  }

  add(car: Omit<Car, 'id'>): Car {
    const created: Car = { id: this.nextId++, ...car };
    this.cars = [created, ...this.cars];
    return created;
  }

  update(id: number, changes: Partial<Omit<Car, 'id'>>): boolean {
    const idx = this.cars.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.cars[idx] = { ...this.cars[idx], ...changes };
    return true;
  }

  remove(id: number): void {
    this.cars = this.cars.filter(c => c.id !== id);
  }
}
