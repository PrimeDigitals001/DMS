import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CustomerVDM } from '../../shared/models/customer.vdm';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl = 'http://localhost:3000/api/super-admin/customers';

  constructor(private http: HttpClient) {}

  createCustomer(customer: CustomerVDM): Observable<CustomerVDM> {
    return this.http
      .post(this.baseUrl, customer.toRemote())
      .pipe(map((res) => CustomerVDM.toLocal(res)));
  }

  updateCustomer(id: string, customer: CustomerVDM): Observable<CustomerVDM> {
    return this.http
      .put(`${this.baseUrl}/${id}`, customer.toRemote())
      .pipe(map((res) => CustomerVDM.toLocal(res)));
  }

  getCustomers(): Observable<CustomerVDM[]> {
    return this.http
      .get<any>(this.baseUrl)
      .pipe(map((res) => res.data.map((item: any) => CustomerVDM.toLocal(item))));
  }

  getCustomerById(id: string): Observable<CustomerVDM> {
    return this.http
      .get(`${this.baseUrl}/${id}`)
      .pipe(map((res) => CustomerVDM.toLocal(res)));
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}