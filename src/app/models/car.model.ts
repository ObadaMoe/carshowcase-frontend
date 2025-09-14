import { PristineChangeEvent } from "@angular/forms";

export interface Car {
  id: number;                 // unique id
  company: string;
  model: string;
  price: number;
  imageUrl?: string;
  description?: string;       // seller description

}

export interface CarListItemDto {
  id: number;
  company: string;
  model: string;
  price: number;
  description?: string | null;
  hasImage: boolean;
  imageDataUrl?: string | null;
}
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
export interface CarDetailDto {
  id: number;
  company: string;
  model: string;
  price: number;
  description?: string | null;
  hasImage: boolean;
  imageDataUrl?: string | null;
}
